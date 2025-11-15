import { db } from '$lib/server/db';
import { dbEventScheduler } from '$lib/server/db/event-scheduler';
import type { HealthResponse } from '$lib/types/health';
import { isError, isSuccess, tca } from '@itsezz/try-catch';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

async function checkDatabase(): Promise<boolean> {
	if (!db) return false;

	const result = await tca(
		Promise.race([
			db.execute('SELECT 1 as health_check'),
			new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 3000))
		])
	);

	return isSuccess(result);
}

async function checkEventScheduler(): Promise<boolean> {
	if (!dbEventScheduler) return false;

	const result = await tca(dbEventScheduler.isValid());

	return isSuccess(result) && result.data === true;
}

async function checkHealth(): Promise<HealthResponse> {
	const result = await tca<HealthResponse>(async () => {
		if (typeof process.uptime !== 'function') throw new Error('Process uptime check failed');

		const uptime = process.uptime();
		if (uptime < 1) throw new Error('Process uptime too short, possible restart detected');

		const [dbHealthy, schedulerHealthy] = await Promise.all([
			checkDatabase(),
			checkEventScheduler()
		]);

		if (!dbHealthy || !schedulerHealthy) throw new Error('Critical dependency check failed');

		return {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0'
		};
	});

	if (isError(result))
		return {
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0'
		};

	return result.data;
}

export const GET: RequestHandler = async () => {
	const health = await checkHealth();
	const statusCode = health.status === 'healthy' ? 200 : 500;

	return json(health, {
		status: statusCode,
		headers: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Content-Type': 'application/json'
		}
	});
};

export const HEAD: RequestHandler = async () => {
	const health = await checkHealth();
	const statusCode = health.status === 'healthy' ? 200 : 500;

	return new Response(null, {
		status: statusCode,
		headers: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Content-Type': 'application/json'
		}
	});
};
