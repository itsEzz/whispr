import { dbEventScheduler } from '$lib/server/db/event-scheduler.js';
import { validateEnv } from '$lib/server/env-validation.js';
import { getLogger } from '$lib/server/logger.js';
import type { Handle, HandleServerError, ServerInit } from '@sveltejs/kit';
import { humanId } from 'human-id';

export const handle: Handle = async ({ event, resolve }) => {
	const correlationId = humanId({ separator: '-', capitalize: false });
	event.locals.correlationId = correlationId;

	const response = await resolve(event);
	response.headers.set('X-Correlation-ID', correlationId);

	return response;
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const correlationId = event.locals.correlationId;

	const logger = getLogger();
	logger.error(
		{ correlationId, path: event.url.pathname, method: event.request.method, status, error },
		message
	);
};

export const init: ServerInit = async () => {
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
};
