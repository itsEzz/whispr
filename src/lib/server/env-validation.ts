import * as privateEnv from '$env/dynamic/private';
import * as publicEnv from '$env/dynamic/public';
import { clientEnvSchema, serverEnvSchema } from '$lib/schemas/env-schema';
import { isError, tc } from '@itsezz/try-catch';
import { z } from 'zod';
import { createChildLogger } from './logger';

function formatValidationError(error: z.ZodError): string {
	const errorMessages = error.issues.map((err) => {
		const path = err.path.join('.');
		return `- ${path}: ${err.message}`;
	});

	return `Environment Validation Failed:\n${errorMessages.join('\n')}\n\nPlease check your .env file and ensure all required variables are set with valid values.`;
}

export async function validateEnv() {
	const logger = createChildLogger('env-validation');

	logger.info('Validating environment variables...');

	const result = tc(() => {
		serverEnvSchema.parse(privateEnv.env);
		clientEnvSchema.parse(publicEnv.env);
	});

	if (isError(result)) {
		if (result.error instanceof z.ZodError) {
			logger.error(result.error, formatValidationError(result.error));
			process.exit(1);
		}

		logger.error(
			`Environment Validation Error: ${result.error instanceof Error ? result.error.message : String(result.error)}`
		);

		process.exit(1);
	}

	logger.info('Environment variables are valid');
}
