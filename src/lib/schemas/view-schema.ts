import { z } from 'zod';

const idRegex: RegExp = /^[a-z]+\-[a-z]+\-[a-z]+$/i;

export const idSchema = z
	.string()
	.trim()
	.min(1, { message: 'Required' })
	.refine((val) => (val.length > 0 ? idRegex.test(val) : true), {
		message: 'Invalid ID'
	});

export const viewPasswordSchema = z.string().trim().min(1, { message: 'Required' });

export const viewSchema = z.object({
	id: idSchema
});

export type ViewSchema = typeof viewSchema;
