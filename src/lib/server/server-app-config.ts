import * as privateEnv from '$env/dynamic/private';
import { serverEnvSchema } from '$lib/schemas/env-schema';
import type { ServerAppConfig } from '$lib/types/app-config';
import { emptyStringsToUndefined } from '$lib/utils/env';

const result = serverEnvSchema.safeParse(emptyStringsToUndefined(privateEnv.env));

if (!result.success) {
	throw new Error(
		'Invalid server environment variables. Restart the server and check the console for more details.'
	);
}

export const serverAppConfig: ServerAppConfig = result.data;
