import { neon } from '@neondatabase/serverless';

// Use a dummy connection string during build if DATABASE_URL is not available
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

export const sql = neon(databaseUrl);
