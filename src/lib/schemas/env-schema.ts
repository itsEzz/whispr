import { ttlUnits } from '$lib/constants/ttl-units';
import { isError, tc } from '@itsezz/try-catch';
import { z } from 'zod/v4';

const rateUnitSchema = z.enum([
	'ms',
	'100ms',
	'250ms',
	'500ms',
	's',
	'2s',
	'5s',
	'10s',
	'15s',
	'30s',
	'45s',
	'm',
	'2m',
	'5m',
	'10m',
	'15m',
	'30m',
	'45m',
	'h',
	'2h',
	'6h',
	'12h',
	'd'
]);

const positiveNumberFromString = z.coerce.number().positive().min(1, 'Must be at least 1');

const rateSchema = z.union([
	z.tuple([positiveNumberFromString, rateUnitSchema]),
	z.array(z.tuple([positiveNumberFromString, rateUnitSchema]))
]);

const rateFromString = z.string().transform((val, ctx) => {
	const result = tc(() => {
		const parsed = JSON.parse(val);
		return rateSchema.parse(parsed);
	});
	if (isError(result)) {
		ctx.addIssue({
			code: 'custom',
			message: `Invalid rate limiter format. Expected JSON array like [30, "m"] or [[30, "m"], [100, "h"]]`
		});
		return z.NEVER;
	}

	return result.data;
});

export const serverEnvSchema = z.object({
	DATABASE_URL: z
		.url('Must be a valid URL')
		.refine((url) => new URL(url).protocol === 'mysql:', {
			message: "Protocol must be 'mysql:'"
		})
		.refine(
			(url) => {
				const { pathname } = new URL(url);
				return pathname.length > 1;
			},
			{
				message: 'Database name is required in path (e.g., mysql://.../dbname)'
			}
		),

	RATE_LIMITER_IP: rateFromString.optional().default([30, 'm']),
	RATE_LIMITER_IPUA: rateFromString.optional().default([20, 'm'])
});

export const clientEnvSchema = z
	.object({
		PUBLIC_CONTENT_MIN_LENGTH: positiveNumberFromString.optional().default(1),
		PUBLIC_CONTENT_MAX_LENGTH: positiveNumberFromString.optional().default(1000000),

		PUBLIC_PASSWORD_MIN_LENGTH: positiveNumberFromString.optional().default(1),
		PUBLIC_PASSWORD_MAX_LENGTH: positiveNumberFromString
			.min(30, 'Must be at least 30')
			.max(255, 'Must be at most 255')
			.optional()
			.default(255),
		PUBLIC_PASSWORD_UPPER_CASE_REQUIRED: z.coerce.boolean().optional().default(false),
		PUBLIC_PASSWORD_LOWER_CASE_REQUIRED: z.coerce.boolean().optional().default(false),
		PUBLIC_PASSWORD_NUMBER_REQUIRED: z.coerce.boolean().optional().default(false),
		PUBLIC_PASSWORD_SPECIAL_CHARACTER_REQUIRED: z.coerce.boolean().optional().default(false),

		PUBLIC_VIEWS_MIN: positiveNumberFromString.optional().default(1),
		PUBLIC_VIEWS_MAX: positiveNumberFromString
			.max(1000, 'Must be at most 1000')
			.optional()
			.default(1000),
		PUBLIC_VIEWS_DEFAULT: positiveNumberFromString.optional().default(10),
		PUBLIC_VIEWS_SHOW_RECIPIENTS_DEFAULT: z.coerce.boolean().optional().default(true),
		PUBLIC_VIEWS_UNLIMITED_DEFAULT: z.coerce.boolean().optional().default(false),

		PUBLIC_EXPIRES_IN_MAX_VALUE: positiveNumberFromString.optional().default(2),
		PUBLIC_EXPIRES_IN_MAX_UNIT: z
			.enum(['minutes', 'hours', 'days', 'weeks', 'months'])
			.optional()
			.default('months'),
		PUBLIC_EXPIRES_IN_VALUE_DEFAULT: positiveNumberFromString.optional().default(1),
		PUBLIC_EXPIRES_IN_UNIT_DEFAULT: z
			.enum(['minutes', 'hours', 'days', 'weeks', 'months'])
			.optional()
			.default('hours'),
		PUBLIC_EXPIRES_IN_SHOW_RECIPIENTS_DEFAULT: z.coerce.boolean().optional().default(true),

		PUBLIC_SHOW_COPY_BUTTON_DEFAULT: z.coerce.boolean().optional().default(true),
		PUBLIC_SHOW_DOWNLOAD_BUTTON_DEFAULT: z.coerce.boolean().optional().default(true)
	})
	.check((ctx) => {
		// Custom content checks
		if (ctx.value.PUBLIC_CONTENT_MIN_LENGTH >= ctx.value.PUBLIC_CONTENT_MAX_LENGTH) {
			ctx.issues.push({
				code: 'custom',
				message: 'CONTENT_MIN_LENGTH must be less than CONTENT_MAX_LENGTH',
				input: ctx.value.PUBLIC_CONTENT_MIN_LENGTH
			});
		}

		// Custom password checks
		if (ctx.value.PUBLIC_PASSWORD_MIN_LENGTH >= ctx.value.PUBLIC_PASSWORD_MAX_LENGTH) {
			ctx.issues.push({
				code: 'custom',
				message: 'PASSWORD_MIN_LENGTH must be less than PASSWORD_MAX_LENGTH',
				input: ctx.value.PUBLIC_PASSWORD_MIN_LENGTH
			});
		}

		// Custom views checks
		if (ctx.value.PUBLIC_VIEWS_MIN >= ctx.value.PUBLIC_VIEWS_MAX) {
			ctx.issues.push({
				code: 'custom',
				message: 'VIEWS_MIN must be less than VIEWS_MAX',
				input: ctx.value.PUBLIC_VIEWS_MIN
			});
		}

		if (ctx.value.PUBLIC_VIEWS_DEFAULT < ctx.value.PUBLIC_VIEWS_MIN) {
			ctx.issues.push({
				code: 'custom',
				message: 'VIEWS_DEFAULT cannot be less than VIEWS_MIN',
				input: ctx.value.PUBLIC_VIEWS_DEFAULT
			});
		}

		if (ctx.value.PUBLIC_VIEWS_DEFAULT > ctx.value.PUBLIC_VIEWS_MAX) {
			ctx.issues.push({
				code: 'custom',
				message: 'VIEWS_DEFAULT cannot be greater than VIEWS_MAX',
				input: ctx.value.PUBLIC_VIEWS_DEFAULT
			});
		}

		// Custom expires in checks
		const maxTtl =
			ctx.value.PUBLIC_EXPIRES_IN_MAX_VALUE * ttlUnits[ctx.value.PUBLIC_EXPIRES_IN_MAX_UNIT];
		const defaultTtl =
			ctx.value.PUBLIC_EXPIRES_IN_VALUE_DEFAULT *
			ttlUnits[ctx.value.PUBLIC_EXPIRES_IN_UNIT_DEFAULT];
		if (defaultTtl > maxTtl) {
			ctx.issues.push({
				code: 'custom',
				message: `EXPIRES_IN_VALUE_DEFAULT (${ctx.value.PUBLIC_EXPIRES_IN_VALUE_DEFAULT} ${ctx.value.PUBLIC_EXPIRES_IN_UNIT_DEFAULT}) cannot exceed EXPIRES_IN_MAX_VALUE (${ctx.value.PUBLIC_EXPIRES_IN_MAX_VALUE} ${ctx.value.PUBLIC_EXPIRES_IN_MAX_UNIT})`,
				input: ctx.value.PUBLIC_EXPIRES_IN_VALUE_DEFAULT
			});
		}
	});
