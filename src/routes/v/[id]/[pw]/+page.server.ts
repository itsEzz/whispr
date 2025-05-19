import { readWhispr } from '$lib/server/read-whispr';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const response = await readWhispr(id);

	return {
		whispr: response
	};
};
