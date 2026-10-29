import { building } from '$app/env';
import * as privateEnv from '$env/dynamic/private';
import { serverEnvSchema } from '#lib/schemas/env-schema.js';
import type { ServerAppConfig } from '#lib/types/app-config.js';
import { emptyStringsToUndefined } from '#lib/utils/env.js';

const result = serverEnvSchema.safeParse(
	// During build time, provide dummy values for required env vars to satisfy the schema
	// At runtime, the real env vars will be used
	building
		? {
				DATABASE_URL: 'mysql://user:password@localhost:3306/db'
			}
		: emptyStringsToUndefined(privateEnv.env)
);

if (!result.success) {
	throw new Error(
		'Invalid server environment variables. Restart the server and check the console for more details.'
	);
}

export const serverAppConfig: ServerAppConfig = result.data;
