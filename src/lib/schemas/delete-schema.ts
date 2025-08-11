import { z } from 'zod/v4';

export const deleteIdSchema = z.coerce
	.string()
	.trim()
	.min(30, { message: 'Invalid ID' })
	.max(30, { message: 'Invalid ID' });

export const deleteSchema = z.object({
	id: deleteIdSchema,
	confirm: z.boolean().refine((val) => val === true, {
		message: 'Approval required'
	})
});

export type DeleteSchema = typeof deleteSchema;
