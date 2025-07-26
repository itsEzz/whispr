import * as publicEnv from '$env/dynamic/public';
import { clientEnvSchema } from '$lib/schemas/env-schema';
import type { ClientAppConfig } from '$lib/types/app-config';

const result = clientEnvSchema.safeParse(publicEnv.env);

if (!result.success) {
	throw new Error(
		'Invalid client environment variables. Restart the server and check the console for more details.'
	);
}

export const clientAppConfig: ClientAppConfig = result.data;
