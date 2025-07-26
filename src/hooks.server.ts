import { building } from '$app/environment';
import { validateEnv } from '$lib/server/env-validation.js';

if (!building) {
	validateEnv();
}
