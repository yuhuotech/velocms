#!/bin/bash

# 端口号
PORT=3002

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  VeloCMS 开发服务器启动${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查端口是否被占用
PID=$(lsof -ti:$PORT)

if [ ! -z "$PID" ]; then
    echo -e "${YELLOW}[警告] 端口 $PORT 已被占用 (PID: $PID)${NC}"
    echo -e "${YELLOW}正在尝试终止占用进程...${NC}"

    # 强制终止进程
    kill -9 $PID 2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[成功] 已终止进程 (PID: $PID)${NC}"
        sleep 1
    else
        echo -e "${RED}[错误] 无法终止进程${NC}"
        echo -e "${RED}请手动终止占用 $PORT 端口的进程${NC}"
        exit 1
    fi
fi

# 再次检查端口
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo -e "${RED}[错误] 端口 $PORT 仍被占用${NC}"
    echo -e "${RED}请手动终止占用 $PORT 端口的进程${NC}"
    exit 1
fi

# 启动开发服务器
echo -e "${GREEN}[启动] 在端口 $PORT 启动开发服务器...${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  访问地址: http://localhost:$PORT${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 启动 Next.js 开发服务器
next dev -p $PORT
