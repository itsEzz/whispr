import { ttlUnits } from '#lib/constants/ttl-units.js';
import {
	lowerCaseRegex,
	numberRegex,
	specialCharacterRegex,
	upperCaseRegex
} from '#lib/crypto/pw-strength.js';
import {
	PUBLIC_CONTENT_MAX_LENGTH,
	PUBLIC_CONTENT_MIN_LENGTH,
	PUBLIC_EXPIRES_IN_MAX_UNIT,
	PUBLIC_EXPIRES_IN_MAX_VALUE,
	PUBLIC_PASSWORD_LOWER_CASE_REQUIRED,
	PUBLIC_PASSWORD_MAX_LENGTH,
	PUBLIC_PASSWORD_MIN_LENGTH,
	PUBLIC_PASSWORD_NUMBER_REQUIRED,
	PUBLIC_PASSWORD_SPECIAL_CHARACTER_REQUIRED,
	PUBLIC_PASSWORD_UPPER_CASE_REQUIRED,
	PUBLIC_VIEWS_MAX,
	PUBLIC_VIEWS_MIN
} from '$app/env/public';
import { z } from 'zod/v4';

export const passwordSchema = z
	.string({ message: 'Must be a string' })
	.trim()
	.min(PUBLIC_PASSWORD_MIN_LENGTH, {
		message: `Must be at least ${PUBLIC_PASSWORD_MIN_LENGTH.toLocaleString()} character${PUBLIC_PASSWORD_MIN_LENGTH === 1 ? '' : 's'}`
	})
	.max(PUBLIC_PASSWORD_MAX_LENGTH, {
		message: `Must be at most ${PUBLIC_PASSWORD_MAX_LENGTH.toLocaleString()} character${PUBLIC_PASSWORD_MAX_LENGTH === 1 ? '' : 's'}`
	})
	.or(z.literal(''))
	.check((ctx) => {
		if (ctx.value === '') return;

		if (PUBLIC_PASSWORD_UPPER_CASE_REQUIRED && !upperCaseRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one uppercase letter',
				input: ctx.value
			});
		}

		if (PUBLIC_PASSWORD_LOWER_CASE_REQUIRED && !lowerCaseRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one lowercase letter',
				input: ctx.value
			});
		}

		if (PUBLIC_PASSWORD_NUMBER_REQUIRED && !numberRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one number',
				input: ctx.value
			});
		}

		if (PUBLIC_PASSWORD_SPECIAL_CHARACTER_REQUIRED && !specialCharacterRegex.test(ctx.value)) {
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
			.min(PUBLIC_CONTENT_MIN_LENGTH, {
				message: `Must be at least ${PUBLIC_CONTENT_MIN_LENGTH.toLocaleString()} character${PUBLIC_CONTENT_MIN_LENGTH === 1 ? '' : 's'}`
			})
			.max(PUBLIC_CONTENT_MAX_LENGTH, {
				message: `Must be at most ${PUBLIC_CONTENT_MAX_LENGTH.toLocaleString()} character${PUBLIC_CONTENT_MAX_LENGTH === 1 ? '' : 's'}`
			}),
		views: z
			.number({ message: 'Must be a number' })
			.min(PUBLIC_VIEWS_MIN, {
				message: `Must be at least ${PUBLIC_VIEWS_MIN.toLocaleString()}`
			})
			.max(PUBLIC_VIEWS_MAX, {
				message: `Must be at most ${PUBLIC_VIEWS_MAX.toLocaleString()}`
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
		const maxTtl = PUBLIC_EXPIRES_IN_MAX_VALUE * ttlUnits[PUBLIC_EXPIRES_IN_MAX_UNIT];
		if (ttl > maxTtl)
			ctx.issues.push({
				code: 'too_big',
				maximum: maxTtl,
				origin: 'number',
				inclusive: true,
				message: `Must be at most ${PUBLIC_EXPIRES_IN_MAX_VALUE} ${PUBLIC_EXPIRES_IN_MAX_UNIT}`,
				path: ['ttlValue'],
				input: ctx.value
			});
	});

export type CreateSchema = typeof createSchema;
