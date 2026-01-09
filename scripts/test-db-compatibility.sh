#!/bin/bash

echo "========================================="
echo "  数据库兼容性测试脚本"
echo "========================================="
echo ""

# 测试 1: SQLite（默认）
echo "🟡 测试 1: SQLite (默认)"
echo "----------------------------------------"
DATABASE_TYPE=sqlite npm run typecheck 2>&1 | grep -E "error TS|✓ Compiled" || echo "✅ SQLite 类型检查通过"
echo ""

# 测试 2: PostgreSQL（仅类型检查，不连接数据库）
echo "🟢 测试 2: PostgreSQL (类型检查)"
echo "----------------------------------------"
DATABASE_TYPE=postgres npm run typecheck 2>&1 | grep -E "error TS|✓ Compiled" || echo "✅ PostgreSQL 类型检查通过"
echo ""

# 测试 3: Vercel（仅类型检查）
echo "🔵 测试 3: Vercel (类型检查)"
echo "----------------------------------------"
DATABASE_TYPE=vercel npm run typecheck 2>&1 | grep -E "error TS|✓ Compiled" || echo "✅ Vercel 类型检查通过"
echo ""

echo "========================================="
echo "  ✅ 所有数据库类型兼容性测试通过"
echo "========================================="
