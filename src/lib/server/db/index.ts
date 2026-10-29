import { building } from '$app/env';
import { DATABASE_URL } from '$app/env/private';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

export let db: null | (MySql2Database<typeof schema> & { $client: mysql.Pool }) = null;

if (!building) {
	const client = mysql.createPool(DATABASE_URL);
	db = drizzle(client, { schema, mode: 'default' });
}
