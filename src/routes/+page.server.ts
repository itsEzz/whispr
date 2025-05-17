import { db } from '$lib/server/db';
import { whispr } from '$lib/server/db/schema';
import type { CreatedWhispr } from '$lib/types/created-whispr';
import { isError, tryCatch } from '$lib/utils/try-catch';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createSchema, ttlUnits } from '../lib/schemas/create-schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(
		{
			views: 10,
			ttlValue: 1,
			ttlUnit: 'hours',
			showViews: true,
			showTtl: true,
			showCopyButton: true,
			showDownloadButton: true
		},
		zod(createSchema)
	);
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(createSchema));
		if (!form.valid) {
			return fail(400, {
				form,
				error: {
					title: 'Invalid form data',
					description: 'Please check the form for errors and try again.'
				}
			});
		}

		const ttl: number = form.data.ttlValue * ttlUnits[form.data.ttlUnit];
		const now = new Date();
		const ttlDate = new Date(now.getTime() + ttl * 1000);

		const whisprId = await tryCatch(
			db
				.insert(whispr)
				.values({
					content: form.data.content,
					views: form.data.views,
					showViews: form.data.showViews,
					unlimitedViews: form.data.unlimitedViews,
					expiresAt: ttlDate,
					showExpiresAt: form.data.showTtl,
					showCopyButton: form.data.showCopyButton,
					showDownloadButton: form.data.showDownloadButton
				})
				.$returningId()
		);

		if (isError(whisprId)) {
			console.error('Failed to create whispr in database', whisprId.error);
			return fail(500, {
				form,
				error: {
					title: 'Failed to create whispr',
					description: "We couldn't save your whispr right now. Please try again in a few moments."
				}
			});
		}

		const createdWhispr = await tryCatch(
			db.select().from(whispr).where(eq(whispr.id, whisprId.data[0].id))
		);

		if (isError(createdWhispr)) {
			console.error('Failed to retrieve whispr from database', createdWhispr.error);
			return fail(500, {
				form,
				error: {
					title: 'Failed to retrieve whispr',
					description:
						"Your whispr was created but we couldn't retrieve its details. Please try again in a few moments."
				}
			});
		}

		const createdWhisprData = createdWhispr.data[0];

		const response: CreatedWhispr = {
			id: createdWhisprData.id,
			deleteId: createdWhisprData.deleteId,
			views: createdWhisprData.views,
			showViews: createdWhisprData.showViews,
			unlimitedViews: createdWhisprData.unlimitedViews,
			expiresAt: createdWhisprData.expiresAt,
			showExpiresAt: createdWhisprData.showExpiresAt,
			showCopyButton: createdWhisprData.showCopyButton,
			showDownloadButton: createdWhisprData.showDownloadButton
		};

		return {
			form,
			response
		};
	}
};
