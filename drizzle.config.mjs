// 💡 改进检测逻辑，适配 Vercel 的环境变量注入
const getDbType = () => {
  if (process.env.POSTGRES_URL || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'))) return 'postgresql';
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql')) return 'mysql';
  return 'sqlite';
}

const dialect = getDbType();
const outDir = dialect === 'postgresql' ? 'postgres' : dialect;
const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

export default {
  schema: './packages/db/drizzle/schema.ts',
  out: `./packages/db/drizzle/migrations/${outDir}`,
  dialect: dialect,
  dbCredentials: {
    url: dialect === 'sqlite' ? (process.env.DATABASE_PATH || './data/velocms.db') : dbUrl,
  },
  verbose: true,
  strict: true,
}