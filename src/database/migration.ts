import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, client } from '@/database/database';

await migrate(db, { migrationsFolder: './drizzle' });

await client.end();