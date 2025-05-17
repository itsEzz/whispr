import {
	boolean,
	index,
	int,
	mediumtext,
	mysqlTable,
	timestamp,
	varchar
} from 'drizzle-orm/mysql-core';
import { humanId } from 'human-id';
import { nanoid } from 'nanoid';

export const whispr = mysqlTable(
	'whispr',
	{
		id: varchar('id', { length: 50 })
			.primaryKey()
			.$defaultFn(() => humanId({ separator: '-', capitalize: false })),
		deleteId: varchar('delete_id', { length: 30 })
			.unique()
			.notNull()
			.$defaultFn(() => nanoid(30)),
		content: mediumtext('content').notNull(),
		views: int('views').notNull(),
		showViews: boolean('show_views').notNull(),
		unlimitedViews: boolean('unlimited_views').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		showExpiresAt: boolean('show_expires_at').notNull(),
		showCopyButton: boolean('show_copy_button').notNull(),
		showDownloadButton: boolean('show_download_button').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [index('expires_at_index').on(table.expiresAt)]
);
