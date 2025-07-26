import { deleteIdSchema, deleteSchema } from '$lib/schemas/delete-schema';
import { db } from '$lib/server/db';
import { dbEventScheduler } from '$lib/server/db/event-scheduler';
import { whispr_table } from '$lib/server/db/schema';
import { createChildLogger } from '$lib/server/logger.js';
import { rateLimiter } from '$lib/server/rate-limiter';
import { isError, tca } from '@itsezz/try-catch';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

const logger = createChildLogger('routes.delete');

export const load: PageServerLoad = async (event) => {
	const correlationId = event.locals.correlationId;

	const status = await rateLimiter.check(event);
	if (status.limited) {
		error(
			429,
			`Rate limit exceeded. Please wait ${status.retryAfter} seconds before trying again.`
		);
	}

	if (!(await dbEventScheduler.isValid()))
		error(503, 'The whispr service is currently unavailable. Please try again later.');

	const { deleteId } = event.params;

	const form = await superValidate(
		{
			id: deleteId,
			confirm: false
		},
		zod4(deleteSchema)
	);

	const validationResult = deleteIdSchema.safeParse(deleteId);
	if (!validationResult.success) {
		return {
			form,
			notFound: true,
			error: {
				title: 'Invalid delete link',
				description: 'The delete link you accessed is not valid or has been corrupted.'
			}
		};
	}

	const foundWhispr = await tca(
		db.select().from(whispr_table).where(eq(whispr_table.deleteId, deleteId))
	);

	if (isError(foundWhispr)) {
		logger.error(
			{ correlationId, error: foundWhispr.error },
			'Database error while retrieving whispr'
		);
		error(500, 'Database connection error while retrieving whispr information');
	}

	if (foundWhispr.data.length === 0) {
		return {
			form,
			notFound: true,
			error: {
				title: 'Whispr not found',
				description: 'This whispr may have already been deleted or the delete link is invalid.'
			}
		};
	}

	return {
		form
	};
};

export const actions = {
	default: async (event) => {
		const correlationId = event.locals.correlationId;

		const status = await rateLimiter.check(event);
		if (status.limited) {
			const form = await superValidate(event.request, zod4(deleteSchema));
			return fail(429, {
				form,
				error: {
					title: 'Rate limit exceeded',
					description: `Too many requests. Please wait ${status.retryAfter} seconds before trying to delete again.`
				}
			});
		}

		const form = await superValidate(event.request, zod4(deleteSchema));
		if (!form.valid) {
			return fail(400, {
				form,
				error: {
					title: 'Invalid form submission',
					description: 'Please ensure you have filled out the form correctly.'
				}
			});
		}

		const deletedWhispr = await tca(
			db.delete(whispr_table).where(eq(whispr_table.deleteId, form.data.id))
		);

		if (isError(deletedWhispr)) {
			logger.error(
				{ correlationId, error: deletedWhispr.error },
				'Database error while deleting whispr'
			);
			return fail(500, {
				form,
				error: {
					title: 'Unable to delete whispr',
					description: `Something went wrong while trying to delete your whispr. Please try again. Reference ID: ${correlationId}`
				}
			});
		}

		if (!deletedWhispr.data || deletedWhispr.data[0].affectedRows === 0) {
			return fail(404, {
				form,
				error: {
					title: 'Whispr not found',
					description: 'This whispr may have already been deleted or the delete link is invalid.'
				}
			});
		}

		return { form };
	}
};
