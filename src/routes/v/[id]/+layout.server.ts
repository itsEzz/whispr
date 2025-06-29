import { idSchema } from '$lib/schemas/view-schema';
import { db } from '$lib/server/db';
import { whispr_table } from '$lib/server/db/schema';
import type { ViewWhispr } from '$lib/types/view-whispr';
import { isDateInPast } from '$lib/utils/date-helpers';
import { isError, tca } from '@itsezz/try-catch';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

async function deleteWhispr(id: string) {
	const deleteResult = await tca(db.delete(whispr_table).where(eq(whispr_table.id, id)));
	if (isError(deleteResult)) {
		console.error('Database connection error while deleting whispr:', deleteResult.error);
		error(500, 'Database connection error while deleting whispr');
	}
}

// TODO this gets called twice when accessing /v/[id]/[pw]
// on /v/[id] it gets called only once
export const load: LayoutServerLoad = async ({ params }) => {
	console.log('=== LOAD FUNCTION CALLED ===');

	const validationResult = idSchema.safeParse(params.id);

	if (!validationResult.success) redirect(303, '/view?redirect-reason=invalid-id');

	const whispr = await tca(db.select().from(whispr_table).where(eq(whispr_table.id, params.id)));

	if (isError(whispr)) {
		console.error('Database connection error while retrieving whispr:', whispr.error);
		error(500, 'Database connection error while retrieving whispr');
	}

	if (whispr.data.length === 0) redirect(303, '/view?redirect-reason=invalid-id');

	const whisprData = whispr.data[0];

	if (isDateInPast(whisprData.expiresAt)) {
		await deleteWhispr(params.id);
		redirect(303, '/view?redirect-reason=invalid-id');
	}

	if (!whisprData.unlimitedViews && whisprData.views === 0) {
		await deleteWhispr(params.id);
		redirect(303, '/view?redirect-reason=invalid-id');
	}

	if (!whisprData.unlimitedViews && whisprData.views === 1) {
		await deleteWhispr(params.id);
		whisprData.views = 0;
	} else if (!whisprData.unlimitedViews && whisprData.views > 1) {
		const updatedWhispr = await tca(
			db
				.update(whispr_table)
				.set({ views: whisprData.views - 1 })
				.where(eq(whispr_table.id, params.id))
		);

		if (isError(updatedWhispr)) {
			console.error('Database connection error while updating whispr:', updatedWhispr.error);
			error(500, 'Database connection error while updating whispr');
		}

		whisprData.views -= 1;
	}

	const response: ViewWhispr = {
		id: whisprData.id,
		content: whisprData.content,
		views: whisprData.showViews && !whisprData.unlimitedViews ? whisprData.views : undefined,
		unlimitedViews: whisprData.unlimitedViews === true ? true : undefined,
		expiresAt: whisprData.showExpiresAt ? whisprData.expiresAt : undefined,
		showCopyButton: whisprData.showCopyButton === true ? true : undefined,
		showDownloadButton: whisprData.showDownloadButton === true ? true : undefined
	};

	return {
		whispr: response
	};
};
