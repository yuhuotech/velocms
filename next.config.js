/** @type {import('next').NextConfig} */
const path = require('path')
const nextConfig = {
  reactStrictMode: true,

  // 移除 transpilePackages，改用 esbuild 优化依赖
  // zod 等流行库不需要 transpile

  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // 输出模式
  output: process.env.VERCEL ? 'standalone' : undefined,

  // 环境变量
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  },

  // 类型化路由（暂时禁用）
  typedRoutes: false,

  // 服务器操作（在 Next.js 15 中已稳定，不需要放在 experimental 中）
  // serverActions: true,

  // 重定向
  async redirects() {
    return [
      // 示例：旧路由重定向
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ]
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },

  // Webpack 配置
  webpack: (config, { isServer }) => {
    const appDir = process.cwd()

    // 支持 better-sqlite3 (仅客户端)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    // Add aliases for packages - 使用与 tsconfig 相同的别名格式
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/theme-system': path.join(appDir, 'packages', 'theme-system'),
      '@/template-lang': path.join(appDir, 'packages', 'template-lang'),
    }

    return config
  },
}

module.exports = nextConfig
