export default {
  schema: './packages/db/drizzle/schema.ts',
  out: process.env.DATABASE_TYPE === 'vercel' || process.env.DATABASE_TYPE === 'postgres'
    ? './packages/db/drizzle/migrations/postgres'
    : process.env.DATABASE_TYPE === 'mysql'
      ? './packages/db/drizzle/migrations/mysql'
      : './packages/db/drizzle/migrations/sqlite',
  dialect: process.env.DATABASE_TYPE === 'vercel' || process.env.DATABASE_TYPE === 'postgres'
    ? 'postgresql'
    : process.env.DATABASE_TYPE === 'mysql'
      ? 'mysql'
      : 'sqlite',
  ...(process.env.DATABASE_TYPE === 'vercel' || process.env.DATABASE_TYPE === 'postgres' || process.env.DATABASE_TYPE === 'mysql' ? {
    dbCredentials: {
      url: process.env.DATABASE_URL,
    }
  } : {
    dbCredentials: {
      url: process.env.DATABASE_PATH || './data/velocms.db',
    }
  }),
  verbose: true,
  strict: true,
}
