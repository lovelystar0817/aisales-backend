# Feature Deployment System

A subdomain-based feature deployment system for testing multiple features in isolation with Cloudflare-compatible routing and SSL protection.

## Quick Start

1. **Setup DNS & Nginx**
   - Add DNS A records in Cloudflare for feature03-feature15.trainapi.hupo.co (point to your server IP)
   - Install nginx configuration:
     ```bash
     sudo cp deploy/config/nginx-feature-subdomains.conf /etc/nginx/sites-available/
     sudo ln -s /etc/nginx/sites-available/nginx-feature-subdomains.conf /etc/nginx/sites-enabled/
     sudo nginx -t
     sudo systemctl reload nginx
     ```

2. **Initial Setup**

   ```bash
   cd deploy
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Set Up Environment Files**

   ```bash
   # Make sure you have .env.prod in your project root (base config)
   ls -la ../.env.prod

   # Create the shared feature overrides file (staging DATABASE_URL, etc.)
   # This file is gitignored - it lives only on the server.
   cat > .env.feature-overrides <<EOF
   DATABASE_URL=mongodb+srv://user:pass@staging-cluster/dbname
   EOF
   ```

4. **Sync Reference Data to Staging DB** (first time only, or when prod data changes)

   ```bash
   # Create .env.sync with both DB URIs (gitignored)
   cat > feature-deploy/scripts/.env.sync <<EOF
   PROD_DATABASE_URL=mongodb+srv://user:pass@prod-cluster/dbname
   STAGING_DATABASE_URL=mongodb+srv://user:pass@staging-cluster/dbname
   EOF

   # Sync reference collections (additive only - never deletes)
   ./feature-deploy/scripts/sync-prod-to-staging.sh
   ```

5. **Deploy a Feature**

   ```bash
   ./feature-deploy/scripts/deploy-feature.sh feature/my-new-feature
   ```

5. **View Active Deployments**
   ```bash
   ./feature-deploy/scripts/list-features.sh
   ```

## Overview

This system allows you to:

- Deploy feature branches to isolated subdomain environments (feature03-feature15)
- Test features with full SSL/Cloudflare protection
- Automatically manage subdomain allocation and PM2 processes
- Clean up deployments easily when done

Each feature deployment:

- Gets its own git worktree (isolated file system)
- Gets a unique subdomain (e.g., feature03.trainapi.hupo.co)
- Runs on a dedicated internal port (5003-5015)
- Has its own PM2 process
- Uses copied environment variables from project root
- Maintains separate logs

## Commands

### Main Commands (from project root)

```bash
./feature-deploy/scripts/deploy-feature.sh <branch>     # Deploy a feature branch
./feature-deploy/scripts/list-features.sh               # Show all active deployments
./feature-deploy/scripts/remove-feature.sh <name>       # Remove a deployment
```

### Additional Scripts (feature-deploy/scripts/)

```bash
./feature-deploy/scripts/restart-feature.sh <name>   # Restart PM2 process
./feature-deploy/scripts/logs-feature.sh <name>      # View application logs
./feature-deploy/scripts/health-check.sh             # System health check
./feature-deploy/scripts/sync-prod-to-staging.sh     # Sync reference data to staging DB
```

## Deployment Examples

### Deploy a Feature Branch

```bash
# Push your branch first
git push origin feature/auth-improvements

# Deploy it
./deploy-feature feature/auth-improvements
# Output: ✨ Feature deployed on subdomain feature03

# Access at: https://feature03.trainapi.hupo.co
```

### Deploy with Options

```bash
# Specify custom subdomain
./deploy-feature feature/payments --subdomain feature05

# Skip build step (faster for quick tests)
./deploy-feature feature/ui-tweaks --skip-build

# Force redeploy
./deploy-feature feature/bugfix --force

# Use production PM2 environment
./deploy-feature feature/release-candidate --production
```

### Update a Running Deployment

```bash
# After pushing new commits to the branch
./feature-deploy/scripts/deploy-feature.sh feature/auth-improvements --force
```

## Subdomain & Port Management

- **Subdomain Range**: feature03-feature15.trainapi.hupo.co (nginx/public access)
- **App Port Range**: 5003-5015 (internal, used by PM2)
- **Mapping**: feature03↔5003, feature04↔5004, ... feature15↔5015
- **13 concurrent deployments** max
- **Auto-assignment**: System finds first available subdomain slot
- **Manual assignment**: Use `--subdomain` flag (e.g., feature05)
- **Reserved ports**: 3000 (production), 5000-5002 (reserved)

## File Structure

```
feature-deploy/
├── scripts/
│   ├── deploy-feature.sh          # Main deployment script (also used for updates)
│   ├── remove-feature.sh          # Cleanup script
│   ├── list-features.sh           # List deployments
│   ├── restart-feature.sh         # Restart process
│   ├── logs-feature.sh            # View logs
│   ├── health-check.sh            # System diagnostics
│   ├── sync-prod-to-staging.sh    # Sync reference data to staging DB
│   ├── .env.sync                  # DB URIs for sync script (gitignored, server only)
│   └── lib/
│       ├── colors.sh              # Terminal colors
│       └── ports.sh               # Port management
├── logs/                          # Deployment logs
├── setup.sh                       # Initial setup
└── README.md                      # This file

# Project root (gitignored, server only):
.env.prod                          # Base environment (all config values)
.env.feature-overrides             # Common overrides for all features (staging DB, etc.)
.env.feature-overrides.<name>      # Optional per-feature overrides

# External files (outside repository):
../feature-deployment-mappings.json  # Single source of truth for deployments
```

## Configuration

### Environment Variables

Feature deployments use a **layered environment** approach:

1. **Base file** - copied from the project root (priority order):
   - `.env` (highest priority)
   - `.env.local`
   - `.env.prod`
   - `.env.staging`

2. **Common overrides** - `.env.feature-overrides` (project root, gitignored)
   Applied to all feature deployments. Use this for values that should differ from production, e.g. staging `DATABASE_URL`.

3. **Per-feature overrides** (optional) - `.env.feature-overrides.<feature-name>` (project root, gitignored)
   Applied only to a specific feature. Use this when a single feature needs a unique config value.

4. **Auto-appended** - feature deployment metadata added automatically:
   ```bash
   PORT=5003-5015              # Auto-assigned app port (internal)
   FEATURE_ENV=feature-name    # Feature identifier
   FEATURE_BRANCH=branch-name  # Git branch name
   SENTRY_PROFILING_ENABLED=false
   ```

**Example `.env.feature-overrides`** (shared by all features):
```bash
DATABASE_URL=mongodb+srv://user:pass@staging-cluster/dbname
# Add any other staging-specific overrides here
```

**Example `.env.feature-overrides.my-feature`** (optional, one specific feature):
```bash
SOME_EXPERIMENTAL_FLAG=true
```

All `.env.feature-overrides*` files are gitignored and live only on the server.

### Staging Database Setup

Feature deployments use a **staging database** instead of production. Reference data (companies, modules, personas, etc.) must be synced from production first.

#### Sync Script

`sync-prod-to-staging.sh` copies reference/seed data collections from production to staging. It is **additive only** - it inserts missing documents but never deletes or overwrites existing ones. This means clients actively testing on staging will not be affected.

**Setup** (one-time, on the server):
```bash
# Create .env.sync with DB URIs (gitignored)
cat > feature-deploy/scripts/.env.sync <<EOF
PROD_DATABASE_URL=mongodb+srv://user:pass@prod-cluster/dbname
STAGING_DATABASE_URL=mongodb+srv://user:pass@staging-cluster/dbname
EOF
```

**Usage:**
```bash
# Dry run - see what would be synced without making changes
./feature-deploy/scripts/sync-prod-to-staging.sh --dry-run

# Run the sync
./feature-deploy/scripts/sync-prod-to-staging.sh

# Sync only specific collections
./feature-deploy/scripts/sync-prod-to-staging.sh --collections companies,modules,personas
```

**Collections synced** (reference/seed data only):
| Collection | Purpose |
|---|---|
| `companies` | Multi-tenant root entities |
| `modules` | Sales training modules |
| `personas` | Customer personas for roleplay |
| `salesproducts` | Products referenced by scenarios |
| `scorecards` | Assessment rubrics |
| `scenarios` | Training scenarios (module + persona + product + scorecard) |
| `voices` | ElevenLabs voice configurations |
| `salesproductcompetitors` | Competitive intelligence data |

**Not synced** (user-generated / transient):
Users, sessions, messages, standings, feedback, caches, logs, etc. These are created naturally during testing.

### PM2 Configuration

The deployment system automatically detects and uses PM2 config files:

- `pm2.config.cjs` (highest priority)
- `pm2.config.js`
- `ecosystem.config.js`

When using `.env.prod` or `--production` flag:

- PM2 starts with `--env production`
- Equivalent to: `pm2 start pm2.config.cjs --env=production`

### CORS Configuration

Ensure your application's CORS settings allow requests from:

- Feature subdomains: feature03-feature15.trainapi.hupo.co
- Frontend deployment domains (Netlify, etc.)

## Working with Frontend

The system includes automatic frontend integration with dynamic API resolution:

### Automatic Backend Detection

Frontend deployments automatically connect to matching feature backends:

- **Netlify URL Pattern**: `feature-auth--huposalesai.netlify.app`
- **Branch Mapping**: `feature-auth` → `feature/auth` → backend deployment lookup
- **Fallback**: Uses production backend if no feature deployment found

### How Frontend Integration Works

1. **Branch Detection**: Frontend extracts branch name from Netlify hostname
2. **Mapping Fetch**: Queries `/api/feature-mapping.json` from production backend
3. **Dynamic Switching**: Switches all API calls to feature backend if mapping exists
4. **Visual Feedback**: Shows backend indicator in sidebar (`🚧 feature-name` or `🚀 Production`)

### Frontend Configuration

The frontend automatically handles:
- **Detection**: Only activates on `.netlify.app` domains
- **Exclusions**: Skips `staging--huposalesai.netlify.app` and localhost
- **State Management**: Real-time backend URL updates
- **Error Handling**: Graceful fallback to production backend

### API Endpoints for Frontend

```javascript
// Get deployment mapping (used automatically by frontend)
fetch('/api/feature-mapping.json')
// Returns: { "feature/auth": "https://feature03.trainapi.hupo.co", ... }

// Get detailed deployment info
fetch('/api/deployments')
// Returns: [{ name, branch, appPort, subdomain, deployedAt, ... }]
```

## Monitoring & Debugging

### View All Deployments

```bash
./list-features
# Shows: name, branch, port, status, memory, CPU, uptime
```

### Check System Health

```bash
./deploy/scripts/health-check.sh
# Shows: PM2 status, deployments count, available ports
```

### View Logs

```bash
# Follow logs (like tail -f)
./deploy/scripts/logs-feature.sh auth-feature --follow

# Show last 50 lines
./deploy/scripts/logs-feature.sh auth-feature --lines 50
```

### PM2 Management

```bash
pm2 list                    # Show all processes
pm2 logs aisales-feature-name   # View logs
pm2 restart aisales-feature-name # Restart specific feature
pm2 monit                   # Real-time monitoring
```

## Troubleshooting

### Common Issues

**"No available ports"**

```bash
./list-features  # Check active deployments
./remove-feature old-feature  # Clean up unused ones
```

**"Worktree already exists"**

```bash
./remove-feature feature-name
./deploy-feature feature/branch --force
```

**Build failures**

```bash
# Deploy without build, then debug manually
./deploy-feature feature/branch --skip-build

# Debug in worktree directory
cd ../aisales-backend-feature-name
npm run build
pm2 restart aisales-feature-name
```

**Process not starting**

```bash
# Check PM2 logs
pm2 logs aisales-feature-name

# Check port conflicts
lsof -i :5003

# Verify environment variables
cd ../aisales-backend-feature-name
cat .env
```

### Getting Help

**View deployment status:**

```bash
./list-features --all  # Detailed view
```

**Check what's using ports:**

```bash
./deploy/scripts/lib/ports.sh
```

**System diagnostics:**

```bash
./deploy/scripts/health-check.sh
```

## Best Practices

### Development Workflow

#### Naming Convention (Critical)

**Branch names must match exactly between frontend and backend repos for automatic connection:**

- ✅ Frontend: `feature/auth-improvements` → Backend: `feature/auth-improvements` 
- ❌ Frontend: `feature/auth-improvements` → Backend: `feature/auth-flow` (won't auto-connect)

#### Deployment Scenarios

**Scenario 1: Feature Frontend + Production Backend**

1. **Create and push frontend branch**
   ```bash
   # In frontend repo
   git checkout -b feature/new-payment-flow
   git push origin feature/new-payment-flow
   ```

2. **Frontend auto-deploys to Netlify**
   - **URL**: `https://new-payment-flow--huposalesai.netlify.app`
   - **Backend**: Automatically uses production API (`https://trainapi.hupo.co`)
   - **UI Indicator**: 🚀 Production (blue indicator in sidebar)

**Scenario 2: Feature Frontend + Feature Backend (Full Isolation)**

1. **Create matching branches in both repos**
   ```bash
   # Backend repo - create and push branch
   git checkout -b feature/new-payment-flow
   git push origin feature/new-payment-flow
   
   # Frontend repo - create matching branch name
   git checkout -b feature/new-payment-flow
   git push origin feature/new-payment-flow
   ```

2. **Deploy backend first**
   ```bash
   # In backend repo
   ./feature-deploy/scripts/deploy-feature.sh feature/new-payment-flow
   # ✨ Deployed to: https://feature03.trainapi.hupo.co
   ```

3. **Frontend auto-deploys and connects**
   - **Frontend URL**: `https://new-payment-flow--huposalesai.netlify.app`
   - **Backend**: Automatically detects and connects to `https://feature03.trainapi.hupo.co`
   - **UI Indicator**: 🚧 new-payment-flow (orange indicator in sidebar)

**Scenario 3: Production Frontend + Feature Backend (Advanced)**

*Use case: Test backend changes with stable frontend*

1. **Deploy backend feature**
   ```bash
   # Backend repo - create and deploy backend branch
   git checkout -b feature/api-improvements
   git push origin feature/api-improvements
   ./feature-deploy/scripts/deploy-feature.sh feature/api-improvements
   # ✨ Deployed to: https://feature04.trainapi.hupo.co
   ```

2. **Create dummy frontend branch**
   ```bash
   # Frontend repo - create matching branch with minimal change
   git checkout -b feature/api-improvements
   # Add a dummy comment or update a comment in any file
   echo "// Testing backend feature" >> src/util/api.ts
   git add . && git commit -m "Dummy change to test backend feature"
   git push origin feature/api-improvements
   ```

3. **Frontend connects to feature backend**
   - **Frontend URL**: `https://api-improvements--huposalesai.netlify.app`
   - **Backend**: Automatically connects to `https://feature04.trainapi.hupo.co`
   - **UI Indicator**: 🚧 api-improvements (orange indicator in sidebar)
   - **Benefit**: Production-quality frontend testing new backend APIs

#### Testing Your Deployment

**Check Frontend URLs:**
```bash
# Feature frontend (always available after git push)
https://new-payment-flow--huposalesai.netlify.app

# Production frontend 
https://train.hupo.co
```

**Check Backend URLs:**
```bash
# Feature backend (after deploying)
https://feature03.trainapi.hupo.co

# Production backend
https://trainapi.hupo.co

# Check active deployments
./feature-deploy/scripts/list-features.sh
```

**Verify Connection:**
1. Open frontend URL in browser
2. Look for indicator in sidebar:
   - 🚀 **Production** = Using production backend
   - 🚧 **feature-name** = Using feature backend
3. Check browser network tab to confirm API calls go to correct backend

#### Iterating on Features

**Frontend-only changes:**
```bash
# Just push frontend changes - Netlify auto-deploys
git push origin feature/new-payment-flow
```

**Backend-only changes:**
```bash
# Update backend deployment
git push origin feature/new-payment-flow
./feature-deploy/scripts/deploy-feature.sh feature/new-payment-flow --force
```

**Both frontend and backend changes:**
```bash
# Push both repos with same branch name
# Frontend auto-deploys, backend needs manual update
git push origin feature/new-payment-flow  # (in both repos)
./feature-deploy/scripts/deploy-feature.sh feature/new-payment-flow --force
```

#### Clean Up When Done

```bash
# Remove backend deployment
./feature-deploy/scripts/remove-feature.sh new-payment-flow

# Frontend cleanup happens automatically when branch is deleted
git branch -d feature/new-payment-flow
git push origin --delete feature/new-payment-flow
```

### Team Coordination

**Share deployment info:**

```bash
./list-features --json > deployments.json
# Share this file with team
```

**Document deployments:**

| Feature    | Developer | Port | Status      | Notes        |
| ---------- | --------- | ---- | ----------- | ------------ |
| auth-flow  | Alice     | 5003 | Testing     | Ready for QA |
| payment-ui | Bob       | 5004 | Development | WIP          |

### Resource Management

- **Limit concurrent deployments**: Max 13 (ports 5003-5015)
- **Clean up regularly**: Remove unused deployments
- **Monitor resources**: Use `pm2 monit` to check memory/CPU
- **Use staging DB**: All features use staging DB via `.env.feature-overrides`. Re-run `sync-prod-to-staging.sh` when new reference data is added in production

## Security Considerations

- **Database isolation**: Features use staging DB via `.env.feature-overrides`. Never put production `DATABASE_URL` in this file
- **Credentials on server only**: `.env.feature-overrides`, `.env.feature-overrides.*`, and `.env.sync` are all gitignored
- **Port access**: Ensure ports 5003-5015 are properly firewalled
- **Environment isolation**: Each deployment has isolated environment
- **Clean up**: Remove deployments when no longer needed

## Migration & Scaling

### If You Outgrow This System

1. **Docker**: Move to containerized deployments
2. **Kubernetes**: Use namespaces for isolation
3. **CI/CD Pipeline**: Automated testing and deployment
4. **Preview Environments**: Cloud-based preview deployments

### For Larger Teams

- Increase port range (5003-5015)
- Add deployment queuing
- Implement automatic cleanup
- Create deployment dashboard
- Add resource limits per deployment

## API Reference

The backend provides these endpoints:

### GET /api/feature-mapping.json

Returns branch to backend URL mapping (used by frontend)

```json
{
  "feature/auth": "https://feature03.trainapi.hupo.co",
  "feature/payments": "https://feature04.trainapi.hupo.co"
}
```

### GET /api/deployments

Returns list of active deployments

```json
[
  {
    "name": "auth-feature",
    "branch": "feature/auth-improvements",
    "appPort": 5003,
    "subdomain": "feature03",
    "deployedAt": "2024-01-15T10:30:00.000Z",
    "deployedBy": "alice",
    "lastUpdated": "2024-01-15T14:20:00.000Z"
  }
]
```

### GET /api/deployments/:name

Returns specific deployment details

### GET /api/deployments/health

Returns system health status

```json
{
  "status": "ok",
  "deploymentsFile": true,
  "activeDeployments": 3,
  "availablePorts": [5004, 5005, 5006, 5007, 5008, 5009, 5010, 5011, 5012, 5013, 5014, 5015],
  "pm2Available": true
}
```

## Contributing

### Adding New Scripts

1. Create script in `deploy/scripts/`
2. Make it executable: `chmod +x script.sh`
3. Source helper libraries:
   ```bash
   source "$SCRIPT_DIR/lib/colors.sh"
   source "$SCRIPT_DIR/lib/ports.sh"
   ```
4. Follow existing patterns for argument parsing
5. Update this documentation

### Modifying Port Range

Edit `deploy/scripts/lib/ports.sh`:

```bash
APP_PORT_RANGE_START=5003
APP_PORT_RANGE_END=5020     # Increase max concurrent deployments
# Also update nginx config and DNS records for additional subdomains
```

## DNS Setup (Cloudflare)

### Required DNS Records

Create these A records in Cloudflare pointing to your server IP:

| Subdomain                  | Type | Value          | Proxy Status |
| -------------------------- | ---- | -------------- | ------------ |
| feature03.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature04.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature05.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature06.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature07.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature08.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature09.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature10.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature11.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature12.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature13.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature14.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |
| feature15.trainapi.hupo.co | A    | YOUR_SERVER_IP | Proxied ✅   |

**Benefits of keeping Cloudflare proxy enabled:**

- SSL termination handled by Cloudflare
- DDoS protection and CDN
- No need to expose additional ports
- Full security features maintained

## Support

For issues or questions:

1. Check this documentation
2. Run `./deploy/scripts/health-check.sh`
3. View logs: `./deploy/scripts/logs-feature.sh <name>`
4. Check PM2 status: `pm2 list`

---

**Happy deploying!** 🚀

_This system is designed for teams of 10-15 developers testing 5-10 concurrent features. It provides the right balance of simplicity and functionality for small to medium teams._
