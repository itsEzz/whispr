import { isError, tc, tca } from '@itsezz/try-catch';
import { db } from './index';
import { sql } from 'drizzle-orm';
import type {
	EventSchedulerResult,
	EventSchedulerStatus,
	InformationSchemaEvents
} from '$lib/types/database';
import { isDateInPast } from '$lib/utils/date-helpers';

export class DbEventScheduler {
	async initializeEventScheduler() {
		console.info('💬 [DB Event Scheduler] Checking db event scheduler status...');
		const schedulerStatus = await this.isDbSchedulerEnabled();
		console.info(`💬 [DB Event Scheduler] Status: ${schedulerStatus}`);

		if (schedulerStatus !== 'OK') {
			console.info('🔧 [DB Event Scheduler] Trying to enable db event scheduler...');
			const enableStatus = await this.enableDbScheduler();
			console.info(`💬 [DB Event Scheduler] Status: ${schedulerStatus}`);

			if (enableStatus !== 'OK') {
				console.error(
					'❌ [DB Event Scheduler] Failed to enable db event scheduler. Whispr requires this feature to function correctly. Please check your database configuration and try again.'
				);
				throw new Error('Failed to enable db event scheduler');
			}
		}

		console.info('💬 [DB Event Scheduler] Checking if cleanup event exists...');
		const eventStatus = await this.eventExists();
		console.info(`💬 [DB Event Scheduler] Status: ${eventStatus}`);

		if (eventStatus !== 'OK') {
			console.info(
				"🔧 [DB Event Scheduler] Cleanup event either doesn't exist or an error occurred. Trying to drop cleanup event..."
			);
			const dropStatus = await this.dropEvent();
			console.info(`💬 [DB Event Scheduler] Status: ${dropStatus}`);

			if (dropStatus !== 'OK')
				console.error('❌ [DB Event Scheduler] Failed to drop cleanup event.');

			console.info('🔧 [DB Event Scheduler] Trying to create cleanup event...');
			const createStatus = await this.createEvent();
			console.info(`💬 [DB Event Scheduler] Status: ${createStatus}`);

			if (createStatus !== 'OK') {
				console.error(
					'❌ [DB Event Scheduler] Failed to create cleanup event. Whispr requires this cleanup event to function correctly. Please check your database configuration and try again.'
				);
				throw new Error('Failed to create cleanup event');
			}
		}

		console.info('✅ [DB Event Scheduler] Event scheduler initialized successfully');
	}

	async isValid(): Promise<boolean> {
		const schedulerStatus = await this.isDbSchedulerEnabled();
		if (schedulerStatus !== 'OK') return false;

		const eventStatus = await this.eventExists();
		if (eventStatus !== 'OK') return false;

		return true;
	}

	private async isDbSchedulerEnabled(): Promise<EventSchedulerResult> {
		const result = await tca(
			db.execute<EventSchedulerStatus>(sql.raw('SELECT @@event_scheduler as status;'))
		);

		if (isError(result)) {
			console.error('Error checking event scheduler status:', result.error);
			return 'ERROR';
		}

		const status = (result.data?.[0] as unknown as [EventSchedulerStatus])[0].status;

		return status === 'ON' ? 'OK' : 'NOT_OK';
	}

	private async enableDbScheduler(): Promise<EventSchedulerResult> {
		const result = await tca(db.execute(sql.raw('SET GLOBAL event_scheduler = "ON";')));

		if (isError(result)) {
			console.error('Error enabling event scheduler:', result.error);
			return 'ERROR';
		}

		return 'OK';
	}

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
			console.error('Error checking if event exists:', result.error);
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

	private async dropEvent(): Promise<EventSchedulerResult> {
		const result = await tca(
			db.execute(
				sql.raw(`
            		DROP EVENT IF EXISTS remove_expired_whisprs;
				`)
			)
		);

		if (isError(result)) {
			console.error('Error dropping event:', result.error);
			return 'ERROR';
		}

		return 'OK';
	}

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
			console.error('Error creating event:', result.error);
			return 'ERROR';
		}

		return 'OK';
	}
}

export const dbEventScheduler = new DbEventScheduler();
