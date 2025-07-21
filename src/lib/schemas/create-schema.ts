import type { PasswordOptions } from '$lib/types/password';
import type { TtlUnits } from '$lib/types/ttl';
import XRegExp from 'xregexp';
import { z } from 'zod';

export const ttlUnits: TtlUnits = {
	minutes: 60,
	hours: 3600,
	days: 86400,
	weeks: 604800,
	months: 2629800
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
	.check((ctx) => {
		if (ctx.value === '') return;
		if (ctx.value.length < passwordConfig.minLength) {
			ctx.issues.push({
				code: 'too_small',
				minimum: passwordConfig.minLength,
				origin: 'string',
				inclusive: true,
				message: `Must be at least ${passwordConfig.minLength} character${passwordConfig.minLength === 1 ? '' : 's'}`,
				input: ctx.value
			});
		}

		if (ctx.value.length > passwordConfig.maxLength) {
			ctx.issues.push({
				code: 'too_big',
				maximum: passwordConfig.maxLength,
				origin: 'string',
				inclusive: true,
				message: `Must be at most ${passwordConfig.maxLength} characters`,
				input: ctx.value
			});
		}

		if (passwordConfig.upperCaseRequired && !upperCaseRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one uppercase letter',
				input: ctx.value
			});
		}

		if (passwordConfig.lowerCaseRequired && !lowerCaseRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one lowercase letter',
				input: ctx.value
			});
		}

		if (passwordConfig.numberRequired && !numberRegex.test(ctx.value)) {
			ctx.issues.push({
				code: 'custom',
				message: 'Must contain at least one number',
				input: ctx.value
			});
		}

		if (passwordConfig.specialCharacterRequired && !specialCharacterRegex.test(ctx.value)) {
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
		ttlUnit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months'], {
			message: 'Must be a valid unit'
		}),
		showTtl: z.boolean({ message: 'Must be a boolean' }).default(false),
		showCopyButton: z.boolean({ message: 'Must be a boolean' }).default(false),
		showDownloadButton: z.boolean({ message: 'Must be a boolean' }).default(false)
	})
	.check((ctx) => {
		const ttl = ctx.value.ttlValue * ttlUnits[ctx.value.ttlUnit];
		const maxTtl = 2 * ttlUnits.months;
		if (ttl > maxTtl)
			ctx.issues.push({
				code: 'too_big',
				maximum: maxTtl,
				origin: 'number',
				inclusive: true,
				message: 'Must be at most 60 days',
				path: ['ttlValue'],
				input: ctx.value
			});
	});

export type CreateSchema = typeof createSchema;
