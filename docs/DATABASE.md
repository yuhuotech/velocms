# 数据库配置指南

VeloCMS 支持多种数据库后端，通过环境变量 `DATABASE_TYPE` 进行切换。

## 🗄️ 支持的数据库

| 数据库 | `DATABASE_TYPE` | 适用场景 |
|--------|----------------|---------|
| **SQLite** | `sqlite` (默认) | 本地开发、小型部署 |
| **Postgres** | `postgres` | 生产环境、自建服务器 |
| **Vercel Postgres** | `vercel` | Vercel 部署 |

---

## 📝 环境变量配置

### 1. SQLite（默认）

```bash
# .env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/velocms.db
```

**特点：**
- ✅ 无需额外服务
- ✅ 开箱即用
- ✅ 适合本地开发
- ⚠️ 不支持并发写入

---

### 2. PostgreSQL

```bash
# .env
DATABASE_TYPE=postgres
POSTGRES_URL=postgresql://user:password@localhost:5432/velocms
```

**特点：**
- ✅ 支持高并发
- ✅ 生产环境推荐
- ✅ 丰富的数据类型
- ⚠️ 需要单独安装和配置

**Docker 快速启动：**
```bash
docker run -d \
  --name velocms-postgres \
  -e POSTGRES_USER=velocms \
  -e POSTGRES_PASSWORD=velocms \
  -e POSTGRES_DB=velocms \
  -p 5432:5432 \
  postgres:15-alpine
```

---

### 3. Vercel Postgres

```bash
# .env (Vercel 自动注入)
DATABASE_TYPE=vercel
POSTGRES_URL=postgres://[user]:[password]@[host]/[database]?sslmode=require
```

**特点：**
- ✅ Vercel 原生支持
- ✅ 自动扩缩容
- ✅ 免费额度充足
- ✅ 自动备份

**Vercel 配置步骤：**
1. 在 Vercel 项目设置中添加 "Postgres"
2. Vercel 会自动注入 `POSTGRES_URL` 环境变量
3. 设置 `DATABASE_TYPE=vercel`

---

## 🔧 Schema 兼容性

VeloCMS 使用 Drizzle ORM，所有数据库共享同一个 Schema 定义：

```typescript
// packages/db/drizzle/schema.ts

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // ...
})
```

Drizzle 会自动处理不同数据库的类型映射：

| Drizzle 类型 | SQLite | Postgres |
|-------------|---------|----------|
| `integer()` | INTEGER | INTEGER |
| `text()` | TEXT | TEXT |
| `timestamp()` | INTEGER | TIMESTAMP |
| `boolean()` | INTEGER (0/1) | BOOLEAN |

---

## 🚀 部署示例

### 本地开发
```bash
# 使用 SQLite
DATABASE_TYPE=sqlite
npm run dev
```

### Docker 生产部署
```bash
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: velocms
      POSTGRES_PASSWORD: velocms
      POSTGRES_DB: velocms
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_TYPE: postgres
      POSTGRES_URL: postgresql://velocms:velocms@postgres:5432/velocms
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  postgres-data:
```

### Vercel 部署
```bash
# vercel.json
{
  "env": {
    "DATABASE_TYPE": "vercel"
  }
}
```

---

## 📊 数据库迁移

VeloCMS 使用 Drizzle Kit 管理数据库迁移：

```bash
# 生成迁移文件
npm run db:generate

# 应用迁移（SQLite）
npm run db:push

# 应用迁移（Postgres）
POSTGRES_URL=... npm run db:push
```

**注意：** Vercel Postgres 需要连接到数据库服务器执行迁移。

---

## 🔍 故障排查

### 问题1：连接失败
```bash
# 检查环境变量
echo $DATABASE_TYPE
echo $POSTGRES_URL
```

### 问题2：表不存在
```bash
# 重新推送 schema
npm run db:push
```

### 问题3：权限错误
```bash
# 检查数据库用户权限
# PostgreSQL 需要以下权限：
# - CREATE TABLE
# - SELECT, INSERT, UPDATE, DELETE
# - INDEX
```

---

## 📚 更多资源

- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
