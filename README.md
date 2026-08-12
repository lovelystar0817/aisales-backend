# AI Sales Training Backend

AI-powered sales training platform backend built with Fastify and TypeScript, providing real-time sales roleplay sessions, feedback, and assessments.

## Tech Stack

- **Fastify 5** with TypeScript and ES modules
- **MongoDB** with Mongoose ODM
- **Auth0** for authentication (JWT Bearer tokens)
- **LangChain** with Anthropic/OpenAI for AI features
- **LiveKit** for real-time communication
- **AdminJS** for admin panel at `/admin`

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/README.md) directory:

- **[System Overview](./docs/SYSTEM_OVERVIEW.md)**
- **[Backend Architecture](./docs/ARCHITECTURE_BACKEND.md)**
- **[Traffic Light Dashboard](./docs/DM_TRAFFIC_LIGHT.md)**

Additional component documentation:
- **[Analytics](./analytics/README.md)**
- **[LiveKit Service](./livekit-service/README.md)**
- **[Deployment](./feature-deploy/README.md)**

## Development

### Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run dev:nowatch` - Start development server without watching files
- `npm run build` - Compile TypeScript to JavaScript (output in `dist/`)
- `npm run start` - Start production server
- `npm run lint` - Check code formatting with Prettier
- `npm run format` - Auto-format code with Prettier
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Deployment

### Environment Setup

The application supports multiple environments:
- Development: `.env.local`
- Testing: `.env.test`
- Staging: `.env.staging`
- Production: `.env.prod`

### PM2 Configuration

The project includes PM2 configuration for both production and staging environments:

1. **Production**: Runs on port 5001
2. **Staging**: Runs on port 5002

Start staging environment:
```bash
pm2 start pm2.config.cjs --env staging
```

Start production environment:
```bash
pm2 start pm2.config.cjs --env production
```

### Nginx Configuration

#### Prerequisites

1. **Rate Limiting Setup**: Add this to your main nginx config (`/etc/nginx/nginx.conf`) in the http block:

```nginx
http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # ... rest of your config
}
```

#### Installation

1. **Copy the nginx configuration**:
```bash
sudo cp deployment/nginx/aisales.conf /etc/nginx/sites-available/
```

2. **Enable the site**:
```bash
sudo ln -s /etc/nginx/sites-available/aisales.conf /etc/nginx/sites-enabled/
```

3. **Update SSL certificate paths** in the config file to match your certificate locations.

4. **Update domain names** in the config file:
   - Production: `trainapi.hupo.co`
   - Staging: `staging.trainapi.hupo.co`

5. **Test the configuration**:
```bash
sudo nginx -t
```

6. **Reload nginx**:
```bash
sudo systemctl reload nginx
```

#### SSL Certificate Requirements

The nginx configuration assumes you have SSL certificates that cover both domains. You'll need either:

- **Wildcard certificate**: `*.trainapi.hupo.co`
- **SAN certificate**: Including both `trainapi.hupo.co` and `staging.trainapi.hupo.co`

#### Domain Configuration

Make sure your DNS is configured:
- `trainapi.hupo.co` → Production server IP
- `staging.trainapi.hupo.co` → Production server IP (same server, different port)

### Deployment Flow

1. **Pull latest changes**:
```bash
git pull origin main
```

2. **Install dependencies** (if package.json changed):
```bash
npm install
```

3. **Build the application**:
```bash
npm run build
```

4. **Restart PM2 processes**:
```bash
# For staging
pm2 restart aisales-staging

# For production
pm2 restart aisales
```

## Architecture

### Route Organization (`src/routes/`)
- Each route module exports a Fastify plugin
- Uses Zod for request/response validation
- Authentication via `onRequest: [fastify.authenticate]`

### AI Integration (`src/prompts/`)
- Prompts organized by feature (sales techniques, product knowledge, roleplay)
- Sales frameworks: MEDDPICC, 4C, 3F, Strategic Pitch, Verify Plus 4C

### Models (`src/models/`)
- User, Company, SalesSession, Message, Module, Persona, SalesProduct
- Mongoose schemas with TypeScript interfaces

### Background Jobs (`src/jobs/`)
- Uses Agenda for job scheduling

### Real-time Features
- Socket.io for real-time updates
- LiveKit for voice/video sessions
- Python-based LiveKit agent in `livekit-service/`

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `DATABASE_URL` - MongoDB connection string
- `AUTH0_*` - Auth0 configuration
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` - Admin panel credentials
- `COOKIE_PASSWORD` - Session cookie secret
- `POSTHOG_API_KEY` - Analytics
- `SENTRY_DSN` - Error tracking

## Multi-language Support

Supported languages:
- English (EN)
- Indonesian (ID)
- Malay (MS)

## Important Notes

- Always use ES module imports (`.js` extensions in TypeScript imports)
- Auth middleware must be explicitly added to protected routes
- PDF generation uses React components with Puppeteer