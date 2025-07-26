import * as privateEnv from '$env/dynamic/private';
import * as publicEnv from '$env/dynamic/public';
import { clientEnvSchema, serverEnvSchema } from '$lib/schemas/env-schema';
import { isError, tc } from '@itsezz/try-catch';
import { z } from 'zod';

function formatValidationError(error: z.ZodError): string {
	const errorMessages = error.issues.map((err: z.ZodIssue) => {
		const path = err.path.join('.');
		return `- ${path}: ${err.message}`;
	});

	return `❌ [Config] Environment Validation Failed:\n${errorMessages.join('\n')}\n\nPlease check your .env file and ensure all required variables are set with valid values.`;
}

export function validateEnv() {
	console.info('💬 [Config] Validating environment variables...');
	const result = tc(() => {
		serverEnvSchema.parse(privateEnv.env);
		clientEnvSchema.parse(publicEnv.env);
	});

	if (isError(result)) {
		if (result.error instanceof z.ZodError) {
			console.error(formatValidationError(result.error));
			process.exit(1);
		}

		console.error(
			`❌ [Config] Environment Validation Error: ${result.error instanceof Error ? result.error.message : String(result.error)}`
		);
		process.exit(1);
	}
	console.info('✅ [Config] Environment variables are valid');
}
