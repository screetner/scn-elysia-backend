import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/database/schemas.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DB_HOST || 'host',
        user: process.env.DB_USER || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'name',
    },
});