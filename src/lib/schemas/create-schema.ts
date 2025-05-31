import type { PasswordOptions } from '$lib/types/password';
import type { TtlUnits } from '$lib/types/ttl';
import XRegExp from 'xregexp';
import { z } from 'zod';

export const ttlUnits: TtlUnits = {
	minutes: 60,
	hours: 3600,
	days: 86400
};

const passwordConfig: PasswordOptions = {
	upperCaseRequired: true,
	lowerCaseRequired: true,
	numberRequired: true,
	specialCharacterRequired: true,
	minLength: 8,
	maxLength: 200
};

const upperCaseRegex: RegExp = XRegExp('.*\\p{Lu}.*');
const lowerCaseRegex: RegExp = XRegExp('\\p{Ll}');
const numberRegex: RegExp = XRegExp('\\p{N}');
const specialCharacterRegex: RegExp = XRegExp('[\\p{P}\\p{S}]');

export const passwordSchema = z
	.string({ message: 'Must be a string' })
	.trim()
	.or(z.literal(''))
	.superRefine((val, ctx) => {
		if (val === '') return;
		if (val.length < passwordConfig.minLength) {
			ctx.addIssue({
				code: z.ZodIssueCode.too_small,
				minimum: passwordConfig.minLength,
				type: 'string',
				inclusive: true,
				message: `Must be at least ${passwordConfig.minLength} character${passwordConfig.minLength === 1 ? '' : 's'}`
			});
		}

		if (val.length > passwordConfig.maxLength) {
			ctx.addIssue({
				code: z.ZodIssueCode.too_big,
				maximum: passwordConfig.maxLength,
				type: 'string',
				inclusive: true,
				message: `Must be at most ${passwordConfig.maxLength} characters`
			});
		}

		if (passwordConfig.upperCaseRequired && !upperCaseRegex.test(val)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Must contain at least one uppercase letter'
			});
		}

		if (passwordConfig.lowerCaseRequired && !lowerCaseRegex.test(val)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Must contain at least one lowercase letter'
			});
		}

		if (passwordConfig.numberRequired && !numberRegex.test(val)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Must contain at least one number'
			});
		}

		if (passwordConfig.specialCharacterRequired && !specialCharacterRegex.test(val)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Must contain at least one special character'
			});
		}
	});

export const createSchema = z
	.object({
		content: z
			.string({ message: 'Must be a string' })
			.min(1, { message: 'Must be at least 1 character' })
			.max(1000000, { message: 'Must be at most 1 million characters' }),
		views: z
			.number({ message: 'Must be a number' })
			.min(1, { message: 'Must be at least 1' })
			.max(1000000, { message: 'Must be at most 1 million' }),
		showViews: z.boolean({ message: 'Must be a boolean' }).default(false),
		unlimitedViews: z.boolean({ message: 'Must be a boolean' }).default(false),
		ttlValue: z
			.number({ message: 'Must be a number' })
			.int({ message: 'Must be an integer' })
			.min(1, { message: 'Must be at least 1' }),
		ttlUnit: z.enum(['minutes', 'hours', 'days'], { message: 'Must be a valid unit' }),
		showTtl: z.boolean({ message: 'Must be a boolean' }).default(false),
		showCopyButton: z.boolean({ message: 'Must be a boolean' }).default(false),
		showDownloadButton: z.boolean({ message: 'Must be a boolean' }).default(false)
	})
	.superRefine((val, ctx) => {
		const ttl = val.ttlValue * ttlUnits[val.ttlUnit];
		const maxTtl = 60 * 24 * 60 * 60; // 60 days in seconds
		if (ttl > maxTtl)
			ctx.addIssue({
				code: z.ZodIssueCode.too_big,
				maximum: maxTtl,
				type: 'number',
				inclusive: true,
				message: 'Must be at most 60 days',
				path: ['ttlValue']
			});
	});

export type CreateSchema = typeof createSchema;
