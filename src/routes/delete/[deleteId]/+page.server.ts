import { deleteIdSchema, deleteSchema } from '$lib/schemas/delete-schema';
import { db } from '$lib/server/db';
import { whispr_table } from '$lib/server/db/schema';
import { isError, tryCatch } from '@itsezz/try-catch';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { deleteId } = params;

	const form = await superValidate(
		{
			id: deleteId,
			confirm: false
		},
		zod(deleteSchema)
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

	const foundWhispr = await tryCatch(
		db.select().from(whispr_table).where(eq(whispr_table.deleteId, deleteId)).execute()
	);

	if (isError(foundWhispr)) {
		console.error('Database error while retrieving whispr:', foundWhispr.error);
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
	default: async ({ request }) => {
		const form = await superValidate(request, zod(deleteSchema));
		if (!form.valid) {
			return fail(400, {
				form,
				error: {
					title: 'Invalid form submission',
					description: 'Please ensure you have filled out the form correctly.'
				}
			});
		}

		const deletedWhispr = await tryCatch(
			db.delete(whispr_table).where(eq(whispr_table.deleteId, form.data.id)).execute()
		);

		if (isError(deletedWhispr)) {
			console.error('Database error while deleting whispr:', deletedWhispr.error);
			return fail(500, {
				form,
				error: {
					title: 'Unable to delete whispr',
					description: 'Something went wrong while trying to delete your whispr. Please try again.'
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
