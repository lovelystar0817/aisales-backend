# AWS Hong Kong Deployment Plan

**Date:** January 2026
**Author:** Engineering Team
**Status:** Planning

## Executive Summary

This document outlines the engineering effort required to deploy the Hupo SalesAI backend application to AWS Hong Kong (ap-east-1) region. The primary goal is **data locality** - ensuring both application servers and database reside within the Hong Kong region for compliance and latency requirements.

**Estimated Total Effort:** 12-17 engineering days (~3 weeks with buffer)
**Estimated Monthly Cost:** ~$750-1,000/mo

---

## Table of Contents

1. [Current Infrastructure](#current-infrastructure)
2. [Target Architecture](#target-architecture)
3. [Key Decisions](#key-decisions)
4. [Phase Breakdown](#phase-breakdown)
5. [Deliverables](#deliverables)
6. [Cost Estimation](#cost-estimation)
7. [Risks and Mitigations](#risks-and-mitigations)
8. [Appendix](#appendix)

---

## Current Infrastructure

### DigitalOcean Singapore (SGP1)

| Component | Specification | Notes |
|-----------|---------------|-------|
| **App Server** | 64GB RAM, 200GB disk, Ubuntu 20.04 | PM2 cluster mode, Node.js |
| **MongoDB** | 2GB RAM, 1vCPU, 34GB disk | Primary + 2 Standbys (MongoDB 8) |
| **Load Balancer** | Regional HTTP | 2 droplets attached |
| **LiveKit Agent** | Docker container | 45GB memory limit, Python |

### Current Deployment Flow

```
GitHub (main) → SSH to server → git pull → npm ci → npm build → pm2 restart
```

- Manual trigger via GitHub Actions (self-hosted runner)
- No containerization for main backend
- LiveKit agent already containerized

### External Services (Global - No Migration Required)

- Auth0 (authentication)
- AWS S3 (file storage - already using)
- LiveKit Cloud (real-time communication)
- Sentry (error tracking)
- PostHog (analytics)
- SendGrid (email)
- Slack (notifications)

---

## Target Architecture

### AWS Hong Kong (ap-east-1)

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  AWS Hong Kong (ap-east-1)          │
                    │                                                     │
   Cloudflare       │   ┌─────────────────────────────────────────────┐   │
   DNS              │   │              VPC (10.0.0.0/16)              │   │
      │             │   │                                             │   │
      ▼             │   │  ┌─────────────┐      ┌─────────────────┐   │   │
┌──────────────┐    │   │  │   Public    │      │     Private     │   │   │
│train-hk.hupo │────┼───┼──│   Subnet    │      │     Subnet      │   │   │
│    .co       │    │   │  │             │      │                 │   │   │
└──────────────┘    │   │  │  ┌───────┐  │      │  ┌───────────┐  │   │   │
                    │   │  │  │  ALB  │──┼──────┼──│    ECS    │  │   │   │
                    │   │  │  └───────┘  │      │  │  Cluster  │  │   │   │
                    │   │  │             │      │  │           │  │   │   │
                    │   │  │             │      │  │ ┌───────┐ │  │   │   │
                    │   │  │             │      │  │ │Backend│ │  │   │   │
                    │   │  │             │      │  │ │Service│ │  │   │   │
                    │   │  │             │      │  │ └───┬───┘ │  │   │   │
                    │   │  │             │      │  │     │     │  │   │   │
                    │   │  │             │      │  │ ┌───────┐ │  │   │   │
                    │   │  │             │      │  │ │LiveKit│ │  │   │   │
                    │   │  │             │      │  │ │ Agent │ │  │   │   │
                    │   │  │             │      │  │ └───────┘ │  │   │   │
                    │   │  │             │      │  └─────┬─────┘  │   │   │
                    │   │  └─────────────┘      └────────┼────────┘   │   │
                    │   │                                │            │   │
                    │   └────────────────────────────────┼────────────┘   │
                    │                                    │                │
                    │                           VPC Peering / PrivateLink │
                    │                                    │                │
                    └────────────────────────────────────┼────────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │  MongoDB Atlas   │
                                              │  (AWS ap-east-1) │
                                              └──────────────────┘
```

### Target Deployment Flow

```
GitHub (main) → GitHub Actions → Build Docker Image → Push to ECR → Deploy to ECS
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database** | MongoDB Atlas | 100% MongoDB compatibility (vs DocumentDB ~95%), managed service, no code changes required |
| **Compute** | ECS Fargate | Containerized, serverless compute, scalable, future-proof for multi-region |
| **Container Registry** | Amazon ECR | Native integration with ECS, same region |
| **Load Balancer** | Application Load Balancer (ALB) | Layer 7, SSL termination, health checks |
| **DNS** | Cloudflare (existing) | Already in use, add new subdomain |
| **Secrets** | AWS Secrets Manager | Secure storage for env vars and credentials |
| **CI/CD** | GitHub Actions | Existing tooling, add new workflows for HK |

---

## Phase Breakdown

### Phase 1: AWS Foundation & Networking
**Effort: 1-2 days**

#### Tasks
- [ ] Set up AWS account/organization for HK region (`ap-east-1`)
- [ ] Create VPC with CIDR `10.0.0.0/16`
- [ ] Configure public subnets (3 AZs) for ALB
- [ ] Configure private subnets (3 AZs) for ECS tasks
- [ ] Set up NAT Gateway for outbound internet access
- [ ] Configure security groups:
  - ALB: Allow 80/443 inbound
  - ECS Backend: Allow 5001 from ALB
  - ECS LiveKit: Internal only
- [ ] Create IAM roles:
  - ECS Task Execution Role
  - ECS Task Role (S3, Secrets Manager access)
  - GitHub Actions deployment role

#### Outputs
- VPC ID
- Subnet IDs (public and private)
- Security Group IDs
- IAM Role ARNs

---

### Phase 2: MongoDB Atlas Setup
**Effort: 1 day**

#### Tasks
- [ ] Create MongoDB Atlas organization/project (if not exists)
- [ ] Deploy cluster in AWS `ap-east-1`:
  - Cluster tier: M20 (recommended) or M10 (minimum)
  - MongoDB version: 8.0 (match current)
  - Replica set: 3 nodes
- [ ] Configure network access:
  - Option A: VPC Peering with AWS VPC
  - Option B: AWS PrivateLink (more secure)
- [ ] Create database user with appropriate permissions
- [ ] Obtain connection string

#### Configuration
```
Cluster: hupo-salesai-hk
Region: AWS / Hong Kong (ap-east-1)
Tier: M20 Cluster (4GB RAM, 2 vCPUs)
Storage: 10GB (auto-scaling enabled)
Backup: Continuous backup enabled
```

#### Outputs
- MongoDB connection string
- VPC Peering connection ID (if applicable)

---

### Phase 3: Backend Containerization & ECS Setup
**Effort: 4-5 days**

#### 3.1 Dockerfile Creation

```dockerfile
# Dockerfile
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify
USER fastify

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "--import", "./dist/instrument.mjs", "--max-old-space-size=4096", "dist/server.js"]
```

#### 3.2 Docker Ignore

```
# .dockerignore
node_modules
.git
.github
*.md
.env*
.vscode
coverage
*.log
livekit-service
feature-deploy
analytics
```

#### 3.3 ECS Task Definition

```json
{
  "family": "aisales-backend-hk",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "2048",
  "memory": "8192",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/aisalesTaskRole",
  "containerDefinitions": [
    {
      "name": "aisales-backend",
      "image": "ACCOUNT.dkr.ecr.ap-east-1.amazonaws.com/aisales-backend:latest",
      "portMappings": [
        {
          "containerPort": 5001,
          "protocol": "tcp"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/aisales-backend-hk",
          "awslogs-region": "ap-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:ap-east-1:ACCOUNT:secret:aisales-hk/database-url"},
        {"name": "AUTH0_CLIENT_SECRET", "valueFrom": "arn:aws:secretsmanager:ap-east-1:ACCOUNT:secret:aisales-hk/auth0-client-secret"}
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "5001"}
      ]
    }
  ]
}
```

#### 3.4 GitHub Actions Workflow

```yaml
# .github/workflows/deploy-hk.yml
name: Deploy to AWS HK

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "deploy" to confirm HK deployment'
        required: true
        type: string

env:
  AWS_REGION: ap-east-1
  ECR_REPOSITORY: aisales-backend
  ECS_SERVICE: aisales-backend-hk
  ECS_CLUSTER: aisales-hk
  CONTAINER_NAME: aisales-backend

jobs:
  deploy:
    name: Deploy to HK
    runs-on: ubuntu-latest
    if: github.event.inputs.confirm == 'deploy'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_HK_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_HK_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to Amazon ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ecs/task-definition-hk.json
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Verify deployment
        run: |
          echo "Waiting for service to stabilize..."
          sleep 30
          curl -f https://train-hk.hupo.co/health || exit 1
          echo "Deployment successful!"
```

#### Tasks
- [ ] Create Dockerfile for aisales-backend
- [ ] Create .dockerignore
- [ ] Test Docker build locally
- [ ] Create ECR repository
- [ ] Create ECS Cluster (Fargate)
- [ ] Create ECS Task Definition
- [ ] Create ECS Service with ALB target group
- [ ] Configure auto-scaling (min: 1, max: 4)
- [ ] Create GitHub Actions workflow for HK deployment
- [ ] Test end-to-end deployment pipeline

#### Outputs
- ECR Repository URI
- ECS Cluster ARN
- ECS Service ARN
- GitHub Actions workflow file

---

### Phase 4: LiveKit Agent Deployment with CI/CD
**Effort: 1.5-2 days**

#### Tasks
- [ ] Create ECR repository for LiveKit agent
- [ ] Create ECS Task Definition for LiveKit agent:
  - Memory: 45GB (match current)
  - CPU: 5.6 vCPU equivalent
- [ ] Create ECS Service (no ALB, internal only)
- [ ] Configure AWS Secrets Manager for:
  - Google credentials JSON
  - LiveKit API credentials
  - Environment variables
- [ ] Create GitHub Actions workflow for LiveKit HK deployment

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-livekit-hk.yml
name: Deploy LiveKit Agent to AWS HK

on:
  push:
    paths:
      - 'livekit-service/**'
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: ap-east-1
  ECR_REPOSITORY: aisales-livekit-agent
  ECS_SERVICE: aisales-livekit-agent-hk
  ECS_CLUSTER: aisales-hk

jobs:
  deploy:
    name: Deploy LiveKit Agent
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_HK_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_HK_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push LiveKit agent
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        working-directory: ./livekit-service
        run: |
          docker build \
            --build-arg COMMIT_HASH=${{ github.sha }} \
            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
            -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
            -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Deploy to Amazon ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ecs/livekit-task-definition-hk.json
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

#### Outputs
- LiveKit ECR Repository URI
- LiveKit ECS Service ARN
- GitHub Actions workflow file

---

### Phase 5: DNS & SSL Configuration
**Effort: 0.5 day**

#### Tasks
- [ ] Request SSL certificate in AWS Certificate Manager for `train-hk.hupo.co`
- [ ] Validate certificate via DNS (Cloudflare)
- [ ] Configure ALB HTTPS listener with ACM certificate
- [ ] Add Cloudflare DNS record:
  - Type: CNAME
  - Name: `train-hk`
  - Target: ALB DNS name
  - Proxy: Enabled (orange cloud)
- [ ] Test SSL/TLS connection

#### Outputs
- ACM Certificate ARN
- ALB DNS name
- Cloudflare DNS record

---

### Phase 6: Environment & Secrets Management
**Effort: 0.5-1 day**

#### Required Secrets (AWS Secrets Manager)

```
aisales-hk/database-url          # MongoDB Atlas connection string
aisales-hk/auth0-client-secret   # Auth0 client secret
aisales-hk/auth0-m2m-secret      # Auth0 M2M secret
aisales-hk/admin-secret          # Admin panel secret
aisales-hk/cookie-password       # Session cookie password
aisales-hk/sentry-dsn            # Sentry DSN
aisales-hk/posthog-api-key       # PostHog API key
aisales-hk/sendgrid-api-key      # SendGrid API key
```

#### Required Environment Variables (ECS Task Definition)

```
NODE_ENV=production
PORT=5001
HOST=0.0.0.0
AUTH0_DOMAIN=<same-as-prod>
AUTH0_AUDIENCE=<same-as-prod>
AUTH0_CLIENT_ID=<same-as-prod>
AUTH0_M2M_CLIENT_ID=<same-as-prod>
ADMIN_EMAIL=<admin-email>
```

#### Tasks
- [ ] Create secrets in AWS Secrets Manager
- [ ] Update ECS task definition with secret references
- [ ] Verify application starts with all env vars

---

### Phase 7: Initial Data Seeding
**Effort: 0.5-1 day**

This is a **new independent instance**, not a migration. Only configuration data needs to be seeded.

#### Collections to Seed

| Collection | Action | Notes |
|------------|--------|-------|
| Companies | Seed HK client(s) | New company records |
| Modules | Copy shared modules | Or create HK-specific |
| SalesProducts | Copy if shared | Or create HK-specific |
| Personas | Copy if shared | Or create HK-specific |

#### Tasks
- [ ] Identify which configuration data to copy
- [ ] Export from Singapore MongoDB:
  ```bash
  mongoexport --uri="<SG_URI>" --collection=modules --out=modules.json
  ```
- [ ] Import to HK Atlas:
  ```bash
  mongoimport --uri="<HK_URI>" --collection=modules --file=modules.json
  ```
- [ ] Verify seeded data in Atlas
- [ ] Test application with seeded data

---

### Phase 8: Testing & Validation
**Effort: 2-3 days**

#### Test Checklist

- [ ] **Health Check**: `GET /health` returns 200
- [ ] **Authentication**:
  - [ ] Auth0 JWT validation works
  - [ ] Guest token authentication works
- [ ] **Database**:
  - [ ] Read operations work
  - [ ] Write operations work
  - [ ] Aggregation pipelines work
- [ ] **API Endpoints**:
  - [ ] Sessions CRUD
  - [ ] User management
  - [ ] Feedback generation
- [ ] **Real-time**:
  - [ ] Socket.io connections work
  - [ ] LiveKit integration works
- [ ] **Background Jobs**:
  - [ ] Agenda jobs execute
  - [ ] Job scheduling works
- [ ] **Admin Panel**:
  - [ ] `/admin` accessible
  - [ ] Login works
  - [ ] CRUD operations work
- [ ] **File Uploads**:
  - [ ] S3 uploads work
  - [ ] Pre-signed URLs generate correctly
- [ ] **External Services**:
  - [ ] Sentry error reporting
  - [ ] PostHog analytics
  - [ ] SendGrid emails
  - [ ] Slack notifications

#### Load Testing
- [ ] Run basic load test (50 concurrent users)
- [ ] Verify response times < 500ms p95
- [ ] Monitor ECS metrics during load

---

### Phase 9: Monitoring & Observability
**Effort: 1 day**

#### Tasks
- [ ] Create CloudWatch Log Groups:
  - `/ecs/aisales-backend-hk`
  - `/ecs/aisales-livekit-agent-hk`
- [ ] Create CloudWatch Alarms:
  - CPU utilization > 80%
  - Memory utilization > 80%
  - 5xx error rate > 1%
  - Unhealthy host count > 0
- [ ] Create CloudWatch Dashboard
- [ ] Verify Sentry integration captures errors
- [ ] Verify PostHog captures events
- [ ] Set up PagerDuty/Slack alerts (optional)

---

## Deliverables

### New Files to Create

```
aisales-backend/
├── Dockerfile                              # Backend container
├── .dockerignore                           # Docker ignore rules
├── ecs/
│   ├── task-definition-hk.json            # Backend task def
│   └── livekit-task-definition-hk.json    # LiveKit task def
└── .github/workflows/
    ├── deploy-hk.yml                       # Backend HK deploy
    └── deploy-livekit-hk.yml              # LiveKit HK deploy
```

### AWS Resources to Create

| Resource | Name | Region |
|----------|------|--------|
| VPC | `aisales-hk-vpc` | ap-east-1 |
| ECS Cluster | `aisales-hk` | ap-east-1 |
| ECR Repository | `aisales-backend` | ap-east-1 |
| ECR Repository | `aisales-livekit-agent` | ap-east-1 |
| ALB | `aisales-hk-alb` | ap-east-1 |
| ECS Service | `aisales-backend-hk` | ap-east-1 |
| ECS Service | `aisales-livekit-agent-hk` | ap-east-1 |
| ACM Certificate | `train-hk.hupo.co` | ap-east-1 |

### MongoDB Atlas Resources

| Resource | Name | Region |
|----------|------|--------|
| Cluster | `hupo-salesai-hk` | AWS ap-east-1 |

---

## Cost Estimation

### Monthly AWS Costs (ap-east-1)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| ECS Fargate (Backend) | 2 vCPU, 8GB RAM, ~730 hrs | $150-250/mo |
| ECS Fargate (LiveKit) | 6 vCPU, 45GB RAM, ~730 hrs | $300-400/mo |
| Application Load Balancer | 1 ALB + LCUs | $30-50/mo |
| NAT Gateway | 1 NAT + data processing | $50-80/mo |
| ECR | ~5GB storage | $5-10/mo |
| CloudWatch Logs | ~10GB/mo | $10-20/mo |
| Secrets Manager | ~10 secrets | $5/mo |
| Data Transfer | ~100GB outbound | $50-100/mo |
| **AWS Subtotal** | | **$600-915/mo** |

### Monthly MongoDB Atlas Costs

| Tier | Configuration | Cost |
|------|---------------|------|
| M10 | 2GB RAM, shared | ~$60/mo |
| M20 (recommended) | 4GB RAM, dedicated | ~$140/mo |
| M30 | 8GB RAM, dedicated | ~$280/mo |

### Total Monthly Cost

| Scenario | Cost |
|----------|------|
| Minimum (M10 Atlas) | ~$660-975/mo |
| **Recommended (M20 Atlas)** | **~$750-1,055/mo** |
| With headroom (M30 Atlas) | ~$880-1,195/mo |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| MongoDB Atlas connection issues with VPC | Low | High | Test VPC peering early; have PrivateLink as backup |
| Docker build issues | Medium | Medium | Test Dockerfile locally before CI/CD |
| First-time AWS setup delays | Medium | Medium | Allocate buffer time; use AWS documentation |
| LiveKit agent memory issues in Fargate | Low | High | Monitor closely; have EC2 fallback plan |
| Unexpected AWS costs | Medium | Low | Set up AWS Budgets alerts immediately |

---

## Appendix

### A. Environment Variables Reference

See `src/env.ts` for complete list. Key variables:

```typescript
// Required
PORT: string;
DATABASE_URL: string;
ADMIN_EMAIL: string;
ADMIN_PASSWORD: string;
COOKIE_PASSWORD: string;

// Auth0
AUTH0_DOMAIN: string;
AUTH0_AUDIENCE: string;
AUTH0_CLIENT_ID: string;
AUTH0_CLIENT_SECRET: string;
AUTH0_M2M_CLIENT_ID: string;
AUTH0_M2M_CLIENT_SECRET: string;

// External Services
SENTRY_DSN: string;
POSTHOG_API_KEY: string;
SENDGRID_API_KEY: string;
```

### B. Useful Commands

```bash
# Build Docker image locally
docker build -t aisales-backend:local .

# Run locally with env file
docker run -p 5001:5001 --env-file .env.local aisales-backend:local

# Push to ECR
aws ecr get-login-password --region ap-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.ap-east-1.amazonaws.com
docker tag aisales-backend:local ACCOUNT.dkr.ecr.ap-east-1.amazonaws.com/aisales-backend:latest
docker push ACCOUNT.dkr.ecr.ap-east-1.amazonaws.com/aisales-backend:latest

# Force new ECS deployment
aws ecs update-service --cluster aisales-hk --service aisales-backend-hk --force-new-deployment --region ap-east-1

# View ECS logs
aws logs tail /ecs/aisales-backend-hk --follow --region ap-east-1
```

### C. References

- [AWS ECS Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [MongoDB Atlas VPC Peering](https://www.mongodb.com/docs/atlas/security-vpc-peering/)
- [GitHub Actions ECS Deploy](https://github.com/aws-actions/amazon-ecs-deploy-task-definition)

---

## Timeline Summary

| Week | Phases | Milestone |
|------|--------|-----------|
| Week 1 | 1, 2, 3 (partial) | AWS foundation + Atlas ready |
| Week 2 | 3 (complete), 4, 5, 6 | Containers deployed, DNS working |
| Week 3 | 7, 8, 9 | Data seeded, tested, monitoring live |

**Target Go-Live:** End of Week 3

---

*Document version: 1.0*
*Last updated: January 2026*
