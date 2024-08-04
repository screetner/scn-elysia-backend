import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise';
import * as schema from './schemas';
import * as process from "node:process";


export const client = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
});
export const db = drizzle(client, { schema, mode: 'default' });