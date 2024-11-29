import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '@/database/schemas'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
export const client = postgres(connectionString ?? '')
export const db = drizzle(client, { schema })
