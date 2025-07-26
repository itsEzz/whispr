import type {
	EventSchedulerResult,
	EventSchedulerStatus,
	InformationSchemaEvents,
	ValidationCache
} from '$lib/types/database';
import { isDateInPast } from '$lib/utils/date-helpers';
import { isError, tc, tca } from '@itsezz/try-catch';
import { sql } from 'drizzle-orm';
import type pino from 'pino';
import { createChildLogger } from '../logger';
import { db } from './index';

/**
 * Database Event Scheduler manager for MySQL/MariaDB event scheduling.
 * Handles initialization, validation, and management of database cleanup events.
 */
export class DbEventScheduler {
	private logger: pino.Logger;
	private validationCache: ValidationCache | null = null;
	private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

	/**
	 * Creates a new DbEventScheduler instance.
	 */
	constructor() {
		this.logger = createChildLogger('db-event-scheduler');
	}

	/**
	 * Initializes the database event scheduler by checking and enabling the scheduler,
	 * and ensuring the cleanup event exists and is properly configured.
	 *
	 * @throws {Error} Exits the process if critical initialization steps fail
	 */
	async initializeEventScheduler() {
		this.logger.info('Checking db event scheduler status...');
		const schedulerStatus = await this.isDbSchedulerEnabled();
		this.logger.info(`Event scheduler status: ${schedulerStatus}`);

		if (schedulerStatus !== 'OK') {
			this.logger.info('Trying to enable db event scheduler...');
			const enableStatus = await this.enableDbScheduler();
			this.logger.info(`Enable status: ${enableStatus}`);

			if (enableStatus !== 'OK') {
				this.logger.error(
					'Failed to enable db event scheduler. Whispr requires this feature to function correctly.'
				);
				process.exit(1);
			}
		}

		this.logger.info('Checking if cleanup event exists...');
		const eventStatus = await this.eventExists();
		this.logger.info(`Event status: ${eventStatus}`);

		if (eventStatus !== 'OK') {
			this.logger.info('Cleanup event needs to be recreated. Dropping existing event...');
			const dropStatus = await this.dropEvent();
			this.logger.info(`Drop status: ${dropStatus}`);

			if (dropStatus !== 'OK') this.logger.error('Failed to drop cleanup event.');

			this.logger.info('Creating cleanup event...');
			const createStatus = await this.createEvent();
			this.logger.info(`Create status: ${createStatus}`);

			if (createStatus !== 'OK') {
				this.logger.error(
					'Failed to create cleanup event. Whispr requires this cleanup event to function correctly.'
				);
				process.exit(1);
			}
		}

		this.logger.info('Event scheduler initialized successfully');
		this.clearValidationCache();
	}

	/**
	 * Validates that the database event scheduler is enabled and the cleanup event exists.
	 * Uses caching to reduce database queries - cache is valid for 5 minutes.
	 *
	 * @returns {Promise<boolean>} True if both scheduler is enabled and cleanup event exists
	 */
	async isValid(): Promise<boolean> {
		const now = Date.now();

		if (this.validationCache && now - this.validationCache.timestamp < this.CACHE_DURATION_MS)
			return this.validationCache.isValid;

		const schedulerStatus = await this.isDbSchedulerEnabled();
		if (schedulerStatus !== 'OK') {
			this.logger.warn('Database event scheduler validation failed - scheduler not enabled');
			this.updateValidationCache(false);
			return false;
		}

		const eventStatus = await this.eventExists();
		if (eventStatus !== 'OK') {
			this.logger.warn(
				'Database event scheduler validation failed - cleanup event not found or invalid'
			);
			this.updateValidationCache(false);
			return false;
		}

		this.updateValidationCache(true);
		return true;
	}

	/**
	 * Clears the validation cache, forcing the next isValid() call to query the database.
	 */
	private clearValidationCache(): void {
		this.validationCache = null;
	}

	/**
	 * Updates the validation cache with a new result and timestamp.
	 *
	 * @param {boolean} isValid - The validation result to cache
	 */
	private updateValidationCache(isValid: boolean): void {
		this.validationCache = {
			isValid,
			timestamp: Date.now()
		};
	}

	/**
	 * Checks if the MySQL/MariaDB event scheduler is enabled.
	 *
	 * @returns {Promise<EventSchedulerResult>} 'OK' if enabled, 'NOT_OK' if disabled, 'ERROR' on failure
	 */
	private async isDbSchedulerEnabled(): Promise<EventSchedulerResult> {
		const result = await tca(
			db.execute<EventSchedulerStatus>(sql.raw('SELECT @@event_scheduler as status;'))
		);

		if (isError(result)) {
			this.logger.error({ error: result.error }, 'Error checking event scheduler status');
			return 'ERROR';
		}

		const status = (result.data?.[0] as unknown as [EventSchedulerStatus])[0].status;

		return status === 'ON' ? 'OK' : 'NOT_OK';
	}

	/**
	 * Enables the MySQL/MariaDB event scheduler globally.
	 *
	 * @returns {Promise<EventSchedulerResult>} 'OK' on success, 'ERROR' on failure
	 */
	private async enableDbScheduler(): Promise<EventSchedulerResult> {
		const result = await tca(db.execute(sql.raw('SET GLOBAL event_scheduler = "ON";')));

		if (isError(result)) {
			this.logger.error({ error: result.error }, 'Error enabling event scheduler');
			return 'ERROR';
		}

		return 'OK';
	}

	/**
	 * Checks if the cleanup event exists and is properly configured.
	 * Validates the event definition, type, interval, and other properties.
	 *
	 * @returns {Promise<EventSchedulerResult>} 'OK' if event exists and is valid, 'NOT_OK' if invalid/missing, 'ERROR' on failure
	 */
	private async eventExists(): Promise<EventSchedulerResult> {
		const result = await tca(
			db.execute<InformationSchemaEvents>(
				sql.raw(`
					SELECT
						EVENT_DEFINITION,
						EVENT_TYPE,
						INTERVAL_VALUE,
						INTERVAL_FIELD,
						STARTS,
						ON_COMPLETION,
						EVENT_COMMENT
					FROM 
						INFORMATION_SCHEMA.EVENTS 
					WHERE 
						EVENT_NAME = 'remove_expired_whisprs';
                `)
			)
		);

		if (isError(result)) {
			this.logger.error({ error: result.error }, 'Error checking if event exists');
			return 'ERROR';
		}

		const event: InformationSchemaEvents | undefined = (
			result.data[0] as unknown as [InformationSchemaEvents]
		)[0];

		if (!event) return 'NOT_OK';

		const startsDate = tc<Date | null>(() => (event.STARTS ? new Date(event.STARTS) : null));

		if (isError(startsDate) || startsDate.data === null) return 'NOT_OK';

		if (
			event.EVENT_DEFINITION === 'DELETE FROM whispr WHERE expires_at < UTC_TIMESTAMP()' &&
			event.EVENT_TYPE === 'RECURRING' &&
			event.INTERVAL_VALUE === '1' &&
			event.INTERVAL_FIELD === 'MINUTE' &&
			event.ON_COMPLETION === 'PRESERVE' &&
			event.EVENT_COMMENT === 'Removes expired whisprs from the database' &&
			isDateInPast(startsDate.data)
		)
			return 'OK';

		return 'NOT_OK';
	}

	/**
	 * Drops the cleanup event if it exists.
	 *
	 * @returns {Promise<EventSchedulerResult>} 'OK' on success, 'ERROR' on failure
	 */
	private async dropEvent(): Promise<EventSchedulerResult> {
		const result = await tca(
			db.execute(
				sql.raw(`
            		DROP EVENT IF EXISTS remove_expired_whisprs;
				`)
			)
		);

		if (isError(result)) {
			this.logger.error({ error: result.error }, 'Error dropping event');
			return 'ERROR';
		}

		return 'OK';
	}

	/**
	 * Creates the cleanup event that removes expired whisprs from the database.
	 * The event runs every minute and deletes records where expires_at < current timestamp.
	 *
	 * @returns {Promise<EventSchedulerResult>} 'OK' on success, 'ERROR' on failure
	 */
	private async createEvent(): Promise<EventSchedulerResult> {
		const result = await tca(
			db.execute(
				sql.raw(`
                    CREATE EVENT IF NOT EXISTS remove_expired_whisprs 
                    ON SCHEDULE EVERY 1 MINUTE 
                    STARTS NOW() 
                    ON COMPLETION PRESERVE 
                    ENABLE 
                    COMMENT "Removes expired whisprs from the database" 
                    DO DELETE FROM whispr WHERE expires_at < UTC_TIMESTAMP();
                `)
			)
		);

		if (isError(result)) {
			this.logger.error({ error: result.error }, 'Error creating event');
			return 'ERROR';
		}

		return 'OK';
	}
}

export const dbEventScheduler = new DbEventScheduler();
