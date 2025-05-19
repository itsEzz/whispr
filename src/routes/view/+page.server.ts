import { viewSchema } from '$lib/schemas/view-schema';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(viewSchema), { errors: true });
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(viewSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: {
					title: 'Invalid Whispr ID',
					description: 'Please enter a valid Whispr ID.'
				}
			});
		}

		redirect(307, `/v/${form.data.id.trim().toLowerCase()}`);
	}
};
