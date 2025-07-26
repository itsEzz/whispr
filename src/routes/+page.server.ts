import { ttlUnits } from '$lib/constants/ttl-units';
import { createSchema } from '$lib/schemas/create-schema';
import { db } from '$lib/server/db';
import { dbEventScheduler } from '$lib/server/db/event-scheduler';
import { whispr_table } from '$lib/server/db/schema';
import { rateLimiter } from '$lib/server/rate-limiter';
import type { CreatedWhispr } from '$lib/types/created-whispr';
import { clientAppConfig } from '$lib/utils/client-app-config';
import { isError, tca } from '@itsezz/try-catch';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(
		{
			views: clientAppConfig.PUBLIC_VIEWS_DEFAULT,
			ttlValue: clientAppConfig.PUBLIC_EXPIRES_IN_VALUE_DEFAULT,
			ttlUnit: clientAppConfig.PUBLIC_EXPIRES_IN_UNIT_DEFAULT,
			showViews: clientAppConfig.PUBLIC_VIEWS_SHOW_RECIPIENTS_DEFAULT,
			showTtl: clientAppConfig.PUBLIC_EXPIRES_IN_SHOW_RECIPIENTS_DEFAULT,
			showCopyButton: clientAppConfig.PUBLIC_SHOW_COPY_BUTTON_DEFAULT,
			showDownloadButton: clientAppConfig.PUBLIC_SHOW_DOWNLOAD_BUTTON_DEFAULT
		},
		zod4(createSchema)
	);

	return { form };
};

export const actions = {
	default: async (event) => {
		const status = await rateLimiter.check(event);
		const form = await superValidate(event.request, zod4(createSchema));
		if (status.limited) {
			return fail(429, {
				form,
				error: {
					title: 'Rate limit exceeded',
					description: `Too many requests. Please wait ${status.retryAfter} seconds before creating another whispr.`
				}
			});
		}

		if (!(await dbEventScheduler.isValid())) {
			return fail(503, {
				form,
				error: {
					title: 'Service Unavailable',
					description: 'The whispr service is currently unavailable. Please try again later.'
				}
			});
		}

		if (!form.valid) {
			return fail(400, {
				form,
				error: {
					title: 'Invalid form submission',
					description: 'Please ensure you have filled out the form correctly.'
				}
			});
		}

		const ttl: number = form.data.ttlValue * ttlUnits[form.data.ttlUnit];
		const ttlDate = new Date(Date.now() + ttl * 1000);

		const whisprId = await tca(
			db
				.insert(whispr_table)
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

		if (isError(whisprId) || whisprId.data.length === 0) {
			console.error('Failed to create whispr in database', whisprId.error);
			return fail(500, {
				form,
				error: {
					title: 'Failed to create whispr',
					description: "We couldn't save your whispr right now. Please try again in a few moments."
				}
			});
		}

		const whispr = await tca(
			db.select().from(whispr_table).where(eq(whispr_table.id, whisprId.data[0].id))
		);

		if (isError(whispr) || whispr.data.length === 0) {
			console.error('Failed to retrieve whispr from database', whispr.error);
			return fail(500, {
				form,
				error: {
					title: 'Failed to retrieve whispr',
					description:
						"Your whispr was created but we couldn't retrieve its details. Please try again in a few moments."
				}
			});
		}

		const whisprData = whispr.data[0];

		const response: CreatedWhispr = {
			id: whisprData.id,
			deleteId: whisprData.deleteId,
			views: whisprData.views,
			showViews: whisprData.showViews,
			unlimitedViews: whisprData.unlimitedViews,
			expiresAt: whisprData.expiresAt,
			showExpiresAt: whisprData.showExpiresAt,
			showCopyButton: whisprData.showCopyButton,
			showDownloadButton: whisprData.showDownloadButton
		};

		return {
			form,
			response
		};
	}
};
