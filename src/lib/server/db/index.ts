import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { serverAppConfig } from '../server-app-config';

const client = await mysql.createConnection(serverAppConfig.DATABASE_URL);
export const db = drizzle(client);
