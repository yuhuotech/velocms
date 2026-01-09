# VeloCMS

<div align="center">
  <h3>📝 A flexible, multi-theme blog/CMS system for content creators</h3>
  <p>Built with Next.js 15, TypeScript, and a powerful custom template language</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
</div>

## ✨ Features

- **🎨 Multi-Theme Support** - Create and switch between multiple themes with a powerful template language
- **⚡ Next.js Powered** - Built on Next.js 15 with App Router for optimal performance and SEO
- **🎬 Video Integration** - Seamlessly link blog posts with YouTube, Bilibili, and other platforms
- **🔧 Easy Deployment** - Deploy to Vercel with one click, or run locally with SQLite
- **📝 Code Snippets** - Share code snippets from your videos with syntax highlighting
- **🏷️ Tag System** - Organize your content with tags and categories
- **🔍 Search** - Full-text search across all your content
- **🌙 Dark Mode** - Built-in dark mode support
- **📱 Responsive** - Mobile-first responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/velocms.git
cd velocms

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

- [Architecture](./docs/architecture.md) - Overall system architecture
- [Template Language](./docs/template-language.md) - Custom template language specification
- [Theme System](./docs/theme-system.md) - Theme development guide
- [Database Layer](./docs/database-layer.md) - Data storage abstraction

## 🏗️ Project Structure

```
velocms/
├── apps/
│   ├── web/                    # Frontend theme rendering
│   └── admin/                  # Admin panel
├── packages/
│   ├── core/                   # Core business logic
│   ├── db/                     # Database abstraction layer
│   ├── template-lang/          # Template language implementation
│   ├── theme-system/           # Theme system
│   └── ui/                     # Shared UI components
├── themes/                     # Theme directory
│   └── default/                # Default theme
├── docs/                       # Documentation
└── src/                        # Next.js app
```

## 🎯 Key Features

### Template Language

VeloCMS features a custom template language (VT) that allows you to create powerful, dynamic themes:

```vt
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <vt:each item="post" in="posts">
      <article class="post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt | truncate(200) }}</p>
        <a href="{{ post.url }}">Read more</a>
      </article>
    </vt:each>
  </vt-slot>
</vt-extends>
```

### Multi-Database Support

- **Vercel Postgres** - For production deployments on Vercel
- **SQLite** - For local development and self-hosting

The abstraction layer allows you to switch between databases without changing your application code.

### Video Integration

Easily embed videos from various platforms:

```vt
<vt-video
  url="{{ post.videoUrl }}"
  platform="youtube"
  autoplay="false"
/>
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on Vercel
3. Configure environment variables:
   - `DATABASE_URL`: Your Vercel Postgres connection string
   - `KV_REST_API_URL`: Your Vercel KV REST API URL
   - `KV_REST_API_TOKEN`: Your Vercel KV REST API token
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
4. Deploy!

See the [Vercel deployment guide](./docs/deployment.md) for more details.

### Local Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🛠️ Development

```bash
# Run development server
npm run dev

# Run type checking
npm run typecheck

# Run linter
npm run lint

# Generate database migrations
npm run db:generate

# Push database schema
npm run db:push

# Open database studio
npm run db:studio
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Hosting platform

## 📞 Support

- 📖 [Documentation](./docs)
- 💬 [Discord](https://discord.gg/yourdiscord) (coming soon)
- 🐛 [Issue Tracker](https://github.com/yourusername/velocms/issues)

---

<div align="center">
  Built with ❤️ by the VeloCMS community
</div>
