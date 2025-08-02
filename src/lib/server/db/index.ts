import { building } from '$app/environment';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { serverAppConfig } from '../server-app-config';

export let db: null | MySql2Database = null;

if (!building) {
	const client = await mysql.createConnection(serverAppConfig.DATABASE_URL);
	db = drizzle(client);
}
