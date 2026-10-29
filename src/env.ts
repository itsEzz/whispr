import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod/v4';

const rateUnits = z.enum([
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
const rate = z.union([
	z.tuple([z.coerce.number().positive().min(1), rateUnits]),
	z.array(z.tuple([z.coerce.number().positive().min(1), rateUnits]))
]);

const positiveNumber = (fallback: number, min = 1, max?: number) => {
	let schema = z.number().positive().min(1, 'Must be at least 1');
	if (min > 1) schema = schema.min(min, `Must be at least ${min}`);
	if (max !== undefined) schema = schema.max(max, `Must be at most ${max}`);

	return z
		.string()
		.optional()
		.transform((value) => Number(value?.trim() || fallback))
		.pipe(schema);
};

const boolean = (fallback: boolean) =>
	z
		.string()
		.optional()
		.transform((value) => (value?.trim() ? Boolean(value) : fallback));

const enumValue = <const T extends readonly [string, ...string[]]>(
	values: T,
	fallback: T[number]
) =>
	z
		.string()
		.optional()
		.transform((value) => value?.trim() || fallback)
		.pipe(z.enum(values));

const rateLimiter = (fallback: [number, z.infer<typeof rateUnits>]) =>
	z
		.string()
		.optional()
		.transform((value, ctx) => {
			if (!value?.trim()) return fallback;

			try {
				return rate.parse(JSON.parse(value));
			} catch {
				ctx.addIssue({
					code: 'custom',
					message:
						'Invalid rate limiter format. Expected JSON array like [30, "m"] or [[30, "m"], [100, "h"]]'
				});
				return z.NEVER;
			}
		});

export const variables = defineEnvVars({
	DATABASE_URL: {
		schema: z
			.string()
			.optional()
			.transform((value, ctx) => {
				const url = value?.trim() || (building ? 'mysql://localhost/db' : undefined);
				if (url) return url;

				ctx.addIssue({ code: 'custom', message: 'Database URL is required' });
				return z.NEVER;
			})
			.pipe(
				z
					.url('Must be a valid URL')
					.refine((url) => new URL(url).protocol === 'mysql:', {
						message: "Protocol must be 'mysql:'"
					})
					.refine((url) => new URL(url).pathname.length > 1, {
						message: 'Database name is required in path (e.g., mysql://.../dbname)'
					})
			)
	},
	RATE_LIMITER_IP: {
		schema: rateLimiter([30, 'm'])
	},
	RATE_LIMITER_IPUA: {
		schema: rateLimiter([20, 'm'])
	},

	PUBLIC_CONTENT_MIN_LENGTH: {
		public: true,
		schema: positiveNumber(1)
	},
	PUBLIC_CONTENT_MAX_LENGTH: {
		public: true,
		schema: positiveNumber(1000000)
	},
	PUBLIC_PASSWORD_MIN_LENGTH: {
		public: true,
		schema: positiveNumber(1)
	},
	PUBLIC_PASSWORD_MAX_LENGTH: {
		public: true,
		schema: positiveNumber(255, 30, 255)
	},
	PUBLIC_PASSWORD_UPPER_CASE_REQUIRED: {
		public: true,
		schema: boolean(false)
	},
	PUBLIC_PASSWORD_LOWER_CASE_REQUIRED: {
		public: true,
		schema: boolean(false)
	},
	PUBLIC_PASSWORD_NUMBER_REQUIRED: {
		public: true,
		schema: boolean(false)
	},
	PUBLIC_PASSWORD_SPECIAL_CHARACTER_REQUIRED: {
		public: true,
		schema: boolean(false)
	},

	PUBLIC_VIEWS_MIN: {
		public: true,
		schema: positiveNumber(1)
	},
	PUBLIC_VIEWS_MAX: {
		public: true,
		schema: positiveNumber(1000, 1, 1000)
	},
	PUBLIC_VIEWS_DEFAULT: {
		public: true,
		schema: positiveNumber(10)
	},
	PUBLIC_VIEWS_SHOW_RECIPIENTS_DEFAULT: {
		public: true,
		schema: boolean(true)
	},
	PUBLIC_VIEWS_UNLIMITED_DEFAULT: {
		public: true,
		schema: boolean(false)
	},

	PUBLIC_EXPIRES_IN_MAX_VALUE: {
		public: true,
		schema: positiveNumber(2)
	},
	PUBLIC_EXPIRES_IN_MAX_UNIT: {
		public: true,
		schema: enumValue(['minutes', 'hours', 'days', 'weeks', 'months'], 'months')
	},
	PUBLIC_EXPIRES_IN_VALUE_DEFAULT: {
		public: true,
		schema: positiveNumber(1)
	},
	PUBLIC_EXPIRES_IN_UNIT_DEFAULT: {
		public: true,
		schema: enumValue(['minutes', 'hours', 'days', 'weeks', 'months'], 'hours')
	},
	PUBLIC_EXPIRES_IN_SHOW_RECIPIENTS_DEFAULT: {
		public: true,
		schema: boolean(true)
	},
	PUBLIC_SHOW_COPY_BUTTON_DEFAULT: {
		public: true,
		schema: boolean(true)
	},
	PUBLIC_SHOW_DOWNLOAD_BUTTON_DEFAULT: {
		public: true,
		schema: boolean(true)
	}
});
