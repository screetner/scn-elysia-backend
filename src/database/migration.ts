import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, client } from '@/database/database'

await migrate(db, { migrationsFolder: './drizzle' })

await client.end()
