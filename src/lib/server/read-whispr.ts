import { idSchema } from '$lib/schemas/view-schema';
import type { ViewWhispr } from '$lib/types/view-whispr';
import { isError, tryCatch } from '@itsezz/try-catch';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { whispr_table } from './db/schema';

export async function readWhispr(id: string): Promise<ViewWhispr> {
	const validationResult = idSchema.safeParse(id);

	if (!validationResult.success) redirect(307, '/view?redirect-reason=invalid-id');

	const whispr = await tryCatch(db.select().from(whispr_table).where(eq(whispr_table.id, id)));

	if (isError(whispr)) {
		console.error(whispr.error);
		error(500, 'Error fetching whispr');
	}

	if (whispr.data.length === 0) redirect(307, '/view?redirect-reason=invalid-id');

	const whisprData = whispr.data[0];

	const response: ViewWhispr = {
		id: whisprData.id,
		content: whisprData.content,
		views: whisprData.showViews && !whisprData.unlimitedViews ? whisprData.views : undefined,
		unlimitedViews: whisprData.unlimitedViews === true ? true : undefined,
		expiresAt: whisprData.showExpiresAt ? whisprData.expiresAt : undefined,
		showCopyButton: whisprData.showCopyButton === true ? true : undefined,
		showDownloadButton: whisprData.showDownloadButton === true ? true : undefined
	};

	return response;
}
