import { viewSchema } from '$lib/schemas/view-schema';
import { rateLimiter } from '$lib/server/rate-limiter';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(viewSchema), { errors: true });
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const status = await rateLimiter.check(event);
		const form = await superValidate(event.request, zod4(viewSchema));
		if (status.limited) {
			return fail(429, {
				form,
				error: {
					title: 'Rate limit exceeded',
					description: `Too many requests. Please wait ${status.retryAfter} seconds before trying to view another whispr.`
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

		redirect(303, `/v/${form.data.id.trim().toLowerCase()}`);
	}
};
