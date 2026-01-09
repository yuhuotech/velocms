export default {
  schema: './packages/db/drizzle/schema.ts',
  out: process.env.DATABASE_TYPE === 'vercel' 
    ? './packages/db/drizzle/migrations/postgres'
    : './packages/db/drizzle/migrations/sqlite',
  dialect: process.env.DATABASE_TYPE === 'vercel' ? 'postgresql' : 'sqlite',
  ...(process.env.DATABASE_TYPE === 'vercel' ? {
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
