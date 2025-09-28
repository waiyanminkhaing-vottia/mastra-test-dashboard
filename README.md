# Mastra Test Dashboard

A modern, secure, and production-ready Next.js dashboard application built with enterprise-grade development practices.

## 🌟 Features

- **🔐 Security-First Design**: OWASP security headers, request validation, input sanitization
- **🚀 Modern Stack**: Next.js 15, React 19, TypeScript with ES2020, Turbopack
- **🐳 Container-Native**: Multi-stage Docker builds, health checks, automatic rollback
- **📊 Quality-Assured**: Comprehensive ESLint rules, SonarJS complexity analysis, automated testing
- **🛠️ Developer-Optimized**: Hot reloading, debugging tools, detailed error reporting
- **⚡ Performance-Focused**: Registry caching, standalone builds, optimized assets

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Database**: PostgreSQL with Prisma ORM, pgvector extension
- **Logging**: Structured logging with Pino
- **Development**: Turbopack, ESLint, Prettier, Husky
- **Infrastructure**: Docker, AWS Lightsail, Nginx

### Security Features

- OWASP-compliant security headers
- Request size validation (50KB limit)
- Input sanitization with Zod schemas
- Non-root container execution
- Vulnerability scanning with Trivy

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Docker (for containerized development)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mastra-test-dashboard
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate Prisma client**

   ```bash
   pnpm prisma:generate
   ```

5. **Start development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🐳 Docker Development

### Local Docker Build

```bash
# Build the image
docker build -t mastra-test-dashboard .

# Run the container
docker run -p 3000:3000 mastra-test-dashboard
```

### Development with Docker Compose

```bash
# Start all services
docker-compose up

# Run in background
docker-compose up -d
```

## 🚢 Deployment

### Manual Deployment

The project includes a sophisticated GitHub Actions workflow for manual deployment:

1. **Deploy via GitHub Actions**
   - Go to GitHub Actions → "Deploy Mastra Test Dashboard"
   - Click "Run workflow"
   - Select "development" environment
   - Click "Run workflow"

### Deployment Features

- ✅ **Branch-aware deployment**: Deploys from any branch
- ✅ **Environment-specific builds**: Development-optimized containers
- ✅ **Automatic rollback**: Health check validation with recovery
- ✅ **Build caching**: Registry-based caching for faster builds
- ✅ **Security scanning**: Trivy vulnerability assessment
- ✅ **Health validation**: 30-attempt health check with detailed logging

### Infrastructure Requirements

- AWS Lightsail instance with Docker
- Private Docker registry (SSH tunnel access)
- PostgreSQL with pgvector extension
- Nginx reverse proxy

## 🛠️ Development Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking
pnpm check-all        # Run all quality checks

# Database
pnpm prisma:generate  # Generate Prisma client

# Docker
docker build -t mastra-test-dashboard .
docker run -p 3000:3000 mastra-test-dashboard
```

## 📁 Project Structure

```
├── .github/workflows/     # GitHub Actions CI/CD
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   └── health/   # Health check endpoint
│   │   └── (dashboard)/  # Dashboard pages
│   ├── components/       # React components
│   │   └── ui/          # Reusable UI components
│   └── lib/             # Utility libraries
│       ├── api-utils.ts  # API helpers
│       ├── logger.ts     # Structured logging
│       └── security-utils.ts # Security utilities
├── public/              # Static assets
├── Dockerfile           # Multi-stage container build
├── docker-compose.yml   # Development orchestration
└── .env.development     # Development environment
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Development environment
NODE_ENV=development
LOG_LEVEL=debug

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Environment Files

- `.env.development` - Development-specific configuration
- `.env.example` - Template for environment setup

## 🔍 Health Monitoring

The application includes comprehensive health monitoring:

- **Health Endpoint**: `GET /api/health`

  ```json
  {
    "status": "healthy",
    "timestamp": "2025-01-09T10:30:00.000Z",
    "service": "mastra-test-dashboard"
  }
  ```

- **Container Health**: Built-in Docker health checks
- **Deployment Validation**: Automatic health verification with rollback

## 🛡️ Security

### Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'`

### Request Validation

- Request size limits (50KB)
- Zod schema validation
- Input sanitization
- Error handling

### Container Security

- Non-root user execution
- Minimal Alpine Linux base
- Security vulnerability scanning
- Secrets management

## 📊 Code Quality

### Linting & Formatting

- **ESLint**: 100+ rules including SonarJS complexity analysis
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode with ES2020 target
- **Husky**: Pre-commit hooks for quality gates

### Quality Metrics

- **Cognitive Complexity**: Limited to 15 per function
- **Type Coverage**: 100% TypeScript coverage
- **Security**: OWASP compliance
- **Performance**: Optimized builds and caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks (`pnpm check-all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write JSDoc documentation for public functions
- Maintain test coverage
- Follow security best practices
- Use conventional commit messages

## 📈 Performance

### Build Optimizations

- **Turbopack**: Fast development builds
- **Standalone Output**: Minimal production bundles
- **Static Asset Optimization**: Automatic image and font optimization
- **Registry Caching**: Docker layer caching for faster builds

### Runtime Performance

- **Next.js 15**: Latest performance improvements
- **React 19**: Concurrent features and optimizations
- **Alpine Linux**: Minimal container footprint
- **Health Monitoring**: Proactive issue detection

## 🔗 Related Projects

- [Mastra Test Common](https://github.com/waiyanminkhaing-vottia/mastra-test-common) - Shared utilities and types

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:

1. Check the health endpoint: `/api/health`
2. Review application logs
3. Check GitHub Actions deployment logs
4. Refer to this documentation

---

**Built with ❤️ for modern development workflows**

Last Updated: January 2025 | Version: 0.1.0
