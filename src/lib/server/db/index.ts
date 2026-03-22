import { building } from '$app/environment';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { serverAppConfig } from '../server-app-config';
import * as schema from './schema';

export let db:
	| null
	| (MySql2Database<typeof schema> & {
			$client: mysql.Pool;
	  }) = null;

if (!building) {
	const client = mysql.createPool(serverAppConfig.DATABASE_URL);
	db = drizzle(client, { schema, mode: 'default' });
}
