import { building } from '$app/environment';
import { validateEnv } from '$lib/server/env-validation.js';
import { dbEventScheduler } from '$lib/server/db/event-scheduler.js';

if (!building) {
	console.info('💬 [App] Initializing...');
	validateEnv();
	await dbEventScheduler.initializeEventScheduler();
	console.info('✅ [App] Initialization complete');
}
