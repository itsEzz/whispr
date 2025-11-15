import { dev } from '$app/environment';
import { dbEventScheduler } from '$lib/server/db/event-scheduler.js';
import { validateEnv } from '$lib/server/env-validation.js';
import { getLogger } from '$lib/server/logger.js';
import type { Handle, HandleServerError, ServerInit } from '@sveltejs/kit';
import { humanId } from 'human-id';

export const handle: Handle = async ({ event, resolve }) => {
	const correlationId = humanId({ separator: '-', capitalize: false });
	event.locals.correlationId = correlationId;

	const response = await resolve(event);

	// Set correlation ID header
	response.headers.set('X-Correlation-ID', correlationId);

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	// Content Security Policy - allowing inline styles for CSS-in-JS
	const isDevelopment = dev || process.env.NODE_ENV === 'development';
	const csp = isDevelopment
		? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws: wss:; img-src 'self' data: https:; font-src 'self' data:;"
		: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self' data:;";

	response.headers.set('Content-Security-Policy', csp);

	// HSTS header (only in production)
	if (!isDevelopment) {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload'
		);
	}

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
