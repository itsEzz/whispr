import { viewPasswordSchema } from '$lib/schemas/view-schema';
import { readWhispr } from '$lib/server/read-whispr';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const whispr = await readWhispr(id);

	const form = await superValidate(zod(viewPasswordSchema), { errors: true });

	return {
		form,
		whispr
	};
};
