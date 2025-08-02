import { ttlUnits } from '$lib/constants/ttl-units';
import {
	lowerCaseRegex,
	numberRegex,
	specialCharacterRegex,
	upperCaseRegex
} from '$lib/crypto/pw-strength';
import { clientAppConfig } from '$lib/utils/client-app-config';
import { z } from 'zod';

export const passwordSchema = z
	.string({ message: 'Must be a string' })
	.trim()
	.min(clientAppConfig.PUBLIC_PASSWORD_MIN_LENGTH, {
		message: `Must be at least ${clientAppConfig.PUBLIC_PASSWORD_MIN_LENGTH.toLocaleString()} character${clientAppConfig.PUBLIC_PASSWORD_MIN_LENGTH === 1 ? '' : 's'}`
	})
	.max(clientAppConfig.PUBLIC_PASSWORD_MAX_LENGTH, {
		message: `Must be at most ${clientAppConfig.PUBLIC_PASSWORD_MAX_LENGTH.toLocaleString()} character${clientAppConfig.PUBLIC_PASSWORD_MAX_LENGTH === 1 ? '' : 's'}`
	})
	.or(z.literal(''))
	.check((ctx) => {
		if (ctx.value === '') return;

		if (clientAppConfig.PUBLIC_PASSWORD_UPPER_CASE_REQUIRED && !upperCaseRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one uppercase letter',
				input: ctx.value
			});
		}

		if (clientAppConfig.PUBLIC_PASSWORD_LOWER_CASE_REQUIRED && !lowerCaseRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one lowercase letter',
				input: ctx.value
			});
		}

		if (clientAppConfig.PUBLIC_PASSWORD_NUMBER_REQUIRED && !numberRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one number',
				input: ctx.value
			});
		}

		if (
			clientAppConfig.PUBLIC_PASSWORD_SPECIAL_CHARACTER_REQUIRED &&
			!specialCharacterRegex.test(ctx.value)
		) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one special character',
				input: ctx.value
			});
		}
	});

export const createSchema = z
	.object({
		content: z
			.string({ message: 'Must be a string' })
			.min(clientAppConfig.PUBLIC_CONTENT_MIN_LENGTH, {
				message: `Must be at least ${clientAppConfig.PUBLIC_CONTENT_MIN_LENGTH.toLocaleString()} character${clientAppConfig.PUBLIC_CONTENT_MIN_LENGTH === 1 ? '' : 's'}`
			})
			.max(clientAppConfig.PUBLIC_CONTENT_MAX_LENGTH, {
				message: `Must be at most ${clientAppConfig.PUBLIC_CONTENT_MAX_LENGTH.toLocaleString()} character${clientAppConfig.PUBLIC_CONTENT_MAX_LENGTH === 1 ? '' : 's'}`
			}),
		views: z
			.number({ message: 'Must be a number' })
			.min(clientAppConfig.PUBLIC_VIEWS_MIN, {
				message: `Must be at least ${clientAppConfig.PUBLIC_VIEWS_MIN.toLocaleString()}`
			})
			.max(clientAppConfig.PUBLIC_VIEWS_MAX, {
				message: `Must be at most ${clientAppConfig.PUBLIC_VIEWS_MAX.toLocaleString()}`
			}),
		showViews: z.boolean({ message: 'Must be a boolean' }).default(false),
		unlimitedViews: z.boolean({ message: 'Must be a boolean' }).default(false),
		ttlValue: z
			.number({ message: 'Must be a number' })
			.int({ message: 'Must be an integer' })
			.min(1, { message: 'Must be at least 1' }),
		ttlUnit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months'], {
			message: 'Must be a valid unit'
		}),
		showTtl: z.boolean({ message: 'Must be a boolean' }).default(false),
		showCopyButton: z.boolean({ message: 'Must be a boolean' }).default(false),
		showDownloadButton: z.boolean({ message: 'Must be a boolean' }).default(false)
	})
	.check((ctx) => {
		const ttl = ctx.value.ttlValue * ttlUnits[ctx.value.ttlUnit];
		const maxTtl =
			clientAppConfig.PUBLIC_EXPIRES_IN_MAX_VALUE *
			ttlUnits[clientAppConfig.PUBLIC_EXPIRES_IN_MAX_UNIT];
		if (ttl > maxTtl)
			ctx.issues.push({
				code: 'too_big',
				maximum: maxTtl,
				origin: 'number',
				inclusive: true,
				message: `Must be at most ${clientAppConfig.PUBLIC_EXPIRES_IN_MAX_VALUE} ${clientAppConfig.PUBLIC_EXPIRES_IN_MAX_UNIT}`,
				path: ['ttlValue'],
				input: ctx.value
			});
	});

export type CreateSchema = typeof createSchema;
