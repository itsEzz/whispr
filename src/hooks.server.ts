import { building } from '$app/environment';
import { dbEventScheduler } from '$lib/server/db/event-scheduler.js';
import { validateEnv } from '$lib/server/env-validation.js';
import { getLogger } from '$lib/server/logger.js';
import type { Handle } from '@sveltejs/kit';
import { humanId } from 'human-id';

export const handle: Handle = async ({ event, resolve }) => {
	const correlationId = humanId({ separator: '-', capitalize: false });
	event.locals.correlationId = correlationId;

	const response = await resolve(event);
	response.headers.set('X-Correlation-ID', correlationId);

	return response;
};

if (!building) {
	const logger = getLogger();

	try {
		logger.info('App initializing...');
		await validateEnv();
		await dbEventScheduler.initializeEventScheduler();
		logger.info('App initialization complete');
	} catch (error) {
		logger.error(error, 'App initialization failed');
		throw error;
	}
}
