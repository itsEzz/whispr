import { dbEventScheduler } from '$lib/server/db/event-scheduler';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const schedulerIsValid = await dbEventScheduler.isValid();
	return {
		schedulerIsValid,
		correlationId: locals.correlationId
	};
};
