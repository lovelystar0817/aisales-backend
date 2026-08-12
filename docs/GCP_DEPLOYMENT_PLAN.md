# GCP Deployment Plan - Multi-Region

**Date:** January 2026
**Author:** Engineering Team
**Status:** Planning

## Executive Summary

This document outlines the engineering effort required to deploy the Hupo SalesAI backend application to Google Cloud Platform (GCP). Three potential regions are under consideration: Thailand, Japan, and UK.

**Estimated Total Effort:** 10-15 engineering days (~2.5 weeks with buffer)
**Estimated Monthly Cost:** ~$600-900/mo (varies by region)

---

## Table of Contents

1. [Region Analysis](#region-analysis)
2. [Target Architecture](#target-architecture)
3. [Key Decisions](#key-decisions)
4. [Phase Breakdown](#phase-breakdown)
5. [Deliverables](#deliverables)
6. [Cost Estimation](#cost-estimation)
7. [Comparison: GCP vs AWS](#comparison-gcp-vs-aws)
8. [Risks and Mitigations](#risks-and-mitigations)
9. [Appendix](#appendix)

---

## Region Analysis

### Available GCP Regions

| Target Country | GCP Region | Location | Data Locality | Recommendation |
|----------------|------------|----------|---------------|----------------|
| **Thailand** | ❌ None | N/A | ❌ Not possible | Not recommended |
| **Japan** | `asia-northeast1` | Tokyo | ✅ Yes | Recommended |
| **Japan** | `asia-northeast2` | Osaka | ✅ Yes | Alternative |
| **UK** | `europe-west2` | London | ✅ Yes | Recommended |

### Thailand Limitation

> **Important:** GCP does not have a data center in Thailand. The closest regions are:
> - Singapore (`asia-southeast1`) - ~1,500 km from Bangkok
> - Jakarta (`asia-southeast2`) - ~2,400 km from Bangkok
>
> **If Thailand data locality is a strict requirement, GCP cannot meet it.** Consider AWS (no Thailand region either) or local Thai cloud providers.

### MongoDB Atlas Availability

| Region | MongoDB Atlas Support | Notes |
|--------|----------------------|-------|
| Tokyo (`asia-northeast1`) | ✅ Yes | Full support |
| Osaka (`asia-northeast2`) | ✅ Yes | Full support |
| London (`europe-west2`) | ✅ Yes | Full support |

---

## Target Architecture

### GCP Services Mapping

| Component | AWS Equivalent | GCP Service | Notes |
|-----------|---------------|-------------|-------|
| Container Compute | ECS Fargate | **Cloud Run** | Serverless, simpler |
| Container Compute (heavy) | ECS Fargate | **GKE Autopilot** | For LiveKit agent (45GB RAM) |
| Container Registry | ECR | **Artifact Registry** | |
| Load Balancer | ALB | **Cloud Load Balancing** | Global by default |
| VPC | VPC | **VPC** | Similar concepts |
| Secrets | Secrets Manager | **Secret Manager** | |
| Monitoring | CloudWatch | **Cloud Monitoring + Logging** | |
| SSL Certs | ACM | **Google-managed SSL** | |
| NAT | NAT Gateway | **Cloud NAT** | |

### Architecture Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                  GCP (asia-northeast1 / europe-west2)   │
                    │                                                         │
   Cloudflare       │   ┌─────────────────────────────────────────────────┐   │
   DNS              │   │              VPC Network                        │   │
      │             │   │                                                 │   │
      ▼             │   │  ┌──────────────────────────────────────────┐   │   │
┌──────────────┐    │   │  │         Cloud Load Balancing             │   │   │
│train-jp.hupo │────┼───┼──│         (Global HTTP(S) LB)              │   │   │
│    .co       │    │   │  └──────────────┬───────────────────────────┘   │   │
└──────────────┘    │   │                 │                               │   │
                    │   │                 ▼                               │   │
                    │   │  ┌──────────────────────────────────────────┐   │   │
                    │   │  │              Cloud Run                    │   │   │
                    │   │  │                                          │   │   │
                    │   │  │  ┌────────────────────────────────────┐  │   │   │
                    │   │  │  │      aisales-backend service       │  │   │   │
                    │   │  │  │      (auto-scaling 1-10)           │  │   │   │
                    │   │  │  └────────────────────────────────────┘  │   │   │
                    │   │  │                                          │   │   │
                    │   │  └──────────────────────────────────────────┘   │   │
                    │   │                                                 │   │
                    │   │  ┌──────────────────────────────────────────┐   │   │
                    │   │  │           GKE Autopilot                   │   │   │
                    │   │  │                                          │   │   │
                    │   │  │  ┌────────────────────────────────────┐  │   │   │
                    │   │  │  │      livekit-agent deployment      │  │   │   │
                    │   │  │  │      (45GB RAM, 6 vCPU)            │  │   │   │
                    │   │  │  └────────────────────────────────────┘  │   │   │
                    │   │  │                                          │   │   │
                    │   │  └──────────────┬───────────────────────────┘   │   │
                    │   │                 │                               │   │
                    │   └─────────────────┼───────────────────────────────┘   │
                    │                     │                                   │
                    │              VPC Peering / Private Service Connect      │
                    │                     │                                   │
                    └─────────────────────┼───────────────────────────────────┘
                                          │
                                          ▼
                               ┌──────────────────┐
                               │  MongoDB Atlas   │
                               │   (GCP region)   │
                               └──────────────────┘
```

### Why Hybrid: Cloud Run + GKE?

| Service | Use Case | Reason |
|---------|----------|--------|
| **Cloud Run** | Backend API | Simple, auto-scaling, cost-effective, max 32GB RAM is sufficient |
| **GKE Autopilot** | LiveKit Agent | Requires 45GB RAM (exceeds Cloud Run's 32GB limit) |

**Alternative:** Use GKE Autopilot for both services if you prefer unified infrastructure.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Database** | MongoDB Atlas on GCP | 100% MongoDB compatibility, managed |
| **Backend Compute** | Cloud Run | Simpler than GKE, auto-scaling, pay-per-use |
| **LiveKit Compute** | GKE Autopilot | Requires >32GB RAM (Cloud Run limit) |
| **Container Registry** | Artifact Registry | Native GCP integration |
| **Load Balancer** | Global HTTP(S) LB | SSL termination, CDN-ready |
| **Secrets** | Secret Manager | Native integration with Cloud Run/GKE |
| **CI/CD** | GitHub Actions + Cloud Build | Existing GitHub workflows |

---

## Phase Breakdown

### Phase 1: GCP Project & Networking Setup
**Effort: 1-1.5 days**

#### Tasks
- [ ] Create GCP project (e.g., `hupo-salesai-jp` or `hupo-salesai-uk`)
- [ ] Enable required APIs:
  ```bash
  gcloud services enable \
    run.googleapis.com \
    container.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    compute.googleapis.com \
    vpcaccess.googleapis.com
  ```
- [ ] Create VPC network (or use default)
- [ ] Configure Serverless VPC Access connector (for Cloud Run → Atlas)
- [ ] Create Cloud NAT (if needed for GKE outbound)
- [ ] Set up IAM service accounts:
  - Cloud Run service account
  - GKE workload identity
  - GitHub Actions deployment account

#### Outputs
- GCP Project ID
- VPC Network name
- Serverless VPC Connector name
- Service Account emails

---

### Phase 2: MongoDB Atlas Setup
**Effort: 1 day**

#### Tasks
- [ ] Create MongoDB Atlas cluster on GCP:
  - Region: `GCP / Tokyo` or `GCP / London`
  - Tier: M20 (recommended)
  - MongoDB version: 8.0
- [ ] Configure network access:
  - Option A: VPC Peering (recommended)
  - Option B: Private Service Connect
- [ ] Create database user
- [ ] Obtain connection string

#### Atlas Configuration
```
Cluster: hupo-salesai-jp (or hupo-salesai-uk)
Cloud Provider: GCP
Region: Tokyo (asia-northeast1) or London (europe-west2)
Tier: M20 (4GB RAM, 2 vCPUs)
```

#### Outputs
- MongoDB connection string
- VPC Peering connection ID

---

### Phase 3: Backend Deployment (Cloud Run)
**Effort: 3-4 days**

#### 3.1 Dockerfile

Same as AWS version:

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

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify
USER fastify

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "--import", "./dist/instrument.mjs", "--max-old-space-size=4096", "dist/server.js"]
```

#### 3.2 Cloud Run Service Configuration

```yaml
# cloudrun/service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: aisales-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "false"
        run.googleapis.com/vpc-access-connector: projects/PROJECT/locations/REGION/connectors/CONNECTOR
        run.googleapis.com/vpc-access-egress: private-ranges-only
    spec:
      containerConcurrency: 100
      timeoutSeconds: 300
      serviceAccountName: cloudrun-sa@PROJECT.iam.gserviceaccount.com
      containers:
        - image: REGION-docker.pkg.dev/PROJECT/aisales/backend:latest
          ports:
            - containerPort: 5001
          resources:
            limits:
              cpu: "2"
              memory: 8Gi
          env:
            - name: NODE_ENV
              value: production
            - name: PORT
              value: "5001"
          envFrom:
            - secretRef:
                name: aisales-secrets
          startupProbe:
            httpGet:
              path: /health
              port: 5001
            initialDelaySeconds: 10
            periodSeconds: 10
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health
              port: 5001
            periodSeconds: 30
```

#### 3.3 GitHub Actions Workflow

```yaml
# .github/workflows/deploy-gcp-jp.yml
name: Deploy to GCP Japan

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "deploy" to confirm'
        required: true

env:
  PROJECT_ID: hupo-salesai-jp
  REGION: asia-northeast1
  SERVICE: aisales-backend
  REPOSITORY: aisales

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.event.inputs.confirm == 'deploy'

    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and Push
        run: |
          docker build -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/backend:${{ github.sha }} .
          docker build -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/backend:latest .
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/backend:${{ github.sha }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/backend:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE }} \
            --image ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/backend:${{ github.sha }} \
            --region ${{ env.REGION }} \
            --platform managed \
            --allow-unauthenticated \
            --min-instances 1 \
            --max-instances 10 \
            --memory 8Gi \
            --cpu 2 \
            --port 5001 \
            --set-env-vars NODE_ENV=production \
            --set-secrets DATABASE_URL=database-url:latest,AUTH0_CLIENT_SECRET=auth0-client-secret:latest

      - name: Verify deployment
        run: |
          URL=$(gcloud run services describe ${{ env.SERVICE }} --region ${{ env.REGION }} --format 'value(status.url)')
          curl -f $URL/health || exit 1
          echo "Deployment successful: $URL"
```

#### Tasks
- [ ] Create Artifact Registry repository
- [ ] Create Dockerfile and .dockerignore
- [ ] Test Docker build locally
- [ ] Create Cloud Run service
- [ ] Configure Serverless VPC Access for Atlas connectivity
- [ ] Set up Custom Domain mapping (train-jp.hupo.co)
- [ ] Configure GitHub Actions workflow with Workload Identity Federation
- [ ] Test end-to-end deployment

#### Outputs
- Artifact Registry repository path
- Cloud Run service URL
- GitHub Actions workflow file

---

### Phase 4: LiveKit Agent Deployment (GKE Autopilot)
**Effort: 2-2.5 days**

Cloud Run has a 32GB memory limit, but LiveKit agent needs 45GB. Use GKE Autopilot.

#### 4.1 GKE Autopilot Cluster

```bash
# Create Autopilot cluster
gcloud container clusters create-auto aisales-livekit \
  --region asia-northeast1 \
  --project hupo-salesai-jp
```

#### 4.2 Kubernetes Deployment

```yaml
# k8s/livekit-agent.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: livekit-agent
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: livekit-agent
  template:
    metadata:
      labels:
        app: livekit-agent
    spec:
      serviceAccountName: livekit-agent-sa
      containers:
        - name: livekit-agent
          image: asia-northeast1-docker.pkg.dev/hupo-salesai-jp/aisales/livekit-agent:latest
          resources:
            requests:
              cpu: "5600m"
              memory: "45Gi"
            limits:
              cpu: "5600m"
              memory: "45Gi"
          env:
            - name: GOOGLE_APPLICATION_CREDENTIALS
              value: /secrets/google-credentials.json
          envFrom:
            - secretRef:
                name: livekit-secrets
          volumeMounts:
            - name: google-credentials
              mountPath: /secrets
              readOnly: true
      volumes:
        - name: google-credentials
          secret:
            secretName: google-credentials
---
apiVersion: v1
kind: Secret
metadata:
  name: livekit-secrets
type: Opaque
stringData:
  LIVEKIT_URL: "wss://your-livekit-url"
  LIVEKIT_API_KEY: "your-api-key"
  LIVEKIT_API_SECRET: "your-api-secret"
```

#### 4.3 GitHub Actions for LiveKit

```yaml
# .github/workflows/deploy-livekit-gcp-jp.yml
name: Deploy LiveKit Agent to GCP Japan

on:
  push:
    paths:
      - 'livekit-service/**'
    branches: [main]
  workflow_dispatch:

env:
  PROJECT_ID: hupo-salesai-jp
  REGION: asia-northeast1
  CLUSTER: aisales-livekit
  REPOSITORY: aisales

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev

      - name: Build and Push LiveKit Agent
        working-directory: ./livekit-service
        run: |
          docker build -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/livekit-agent:${{ github.sha }} .
          docker build -t ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/livekit-agent:latest .
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/livekit-agent:${{ github.sha }}
          docker push ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/livekit-agent:latest

      - name: Get GKE credentials
        run: |
          gcloud container clusters get-credentials ${{ env.CLUSTER }} \
            --region ${{ env.REGION }} \
            --project ${{ env.PROJECT_ID }}

      - name: Deploy to GKE
        run: |
          kubectl set image deployment/livekit-agent \
            livekit-agent=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.REPOSITORY }}/livekit-agent:${{ github.sha }}
          kubectl rollout status deployment/livekit-agent
```

#### Tasks
- [ ] Create GKE Autopilot cluster
- [ ] Create Kubernetes deployment manifest
- [ ] Configure Workload Identity for GKE
- [ ] Create Kubernetes secrets for credentials
- [ ] Push LiveKit image to Artifact Registry
- [ ] Deploy to GKE
- [ ] Create GitHub Actions workflow

#### Outputs
- GKE Cluster name
- Kubernetes deployment manifest
- GitHub Actions workflow file

---

### Phase 5: DNS & SSL Configuration
**Effort: 0.5 day**

#### Cloud Run Custom Domain

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service aisales-backend \
  --domain train-jp.hupo.co \
  --region asia-northeast1
```

#### Tasks
- [ ] Create Cloud Run domain mapping
- [ ] Add DNS records in Cloudflare:
  - Type: CNAME
  - Name: `train-jp` (or `train-uk`)
  - Target: `ghs.googlehosted.com`
- [ ] Wait for SSL certificate provisioning (automatic)
- [ ] Verify HTTPS access

#### Outputs
- Domain mapping configuration
- SSL certificate (auto-provisioned)

---

### Phase 6: Secrets Management
**Effort: 0.5-1 day**

#### Create Secrets

```bash
# Create secrets in Secret Manager
echo -n "mongodb+srv://..." | gcloud secrets create database-url --data-file=-
echo -n "secret-value" | gcloud secrets create auth0-client-secret --data-file=-
echo -n "secret-value" | gcloud secrets create admin-password --data-file=-
# ... repeat for all secrets
```

#### Required Secrets

```
database-url              # MongoDB Atlas connection string
auth0-client-secret       # Auth0 client secret
auth0-m2m-secret          # Auth0 M2M secret
admin-secret              # Admin panel secret
cookie-password           # Session cookie password
sentry-dsn                # Sentry DSN
posthog-api-key           # PostHog API key
sendgrid-api-key          # SendGrid API key
```

#### Tasks
- [ ] Create all secrets in Secret Manager
- [ ] Grant Cloud Run service account access to secrets
- [ ] Grant GKE workload identity access to secrets
- [ ] Update Cloud Run service to use secrets
- [ ] Update GKE deployment to use secrets

---

### Phase 7: Initial Data Seeding
**Effort: 0.5-1 day**

Same as AWS plan - seed configuration data only.

#### Tasks
- [ ] Export config collections from Singapore MongoDB
- [ ] Import to new Atlas cluster
- [ ] Verify seeded data

---

### Phase 8: Testing & Validation
**Effort: 2-3 days**

Same test checklist as AWS plan.

#### Tasks
- [ ] Health check verification
- [ ] Authentication flow testing
- [ ] Database operations testing
- [ ] Real-time features testing
- [ ] Background jobs verification
- [ ] Admin panel testing
- [ ] Load testing

---

### Phase 9: Monitoring & Observability
**Effort: 1 day**

#### Tasks
- [ ] Configure Cloud Logging log sinks
- [ ] Create Cloud Monitoring dashboards
- [ ] Set up alerting policies:
  - Cloud Run: Request latency > 1s
  - Cloud Run: Error rate > 1%
  - GKE: Pod restarts > 3
  - GKE: Memory utilization > 90%
- [ ] Verify Sentry integration
- [ ] Verify PostHog integration

---

## Deliverables

### New Files to Create

```
aisales-backend/
├── Dockerfile                              # Backend container (same as AWS)
├── .dockerignore                           # Docker ignore (same as AWS)
├── cloudrun/
│   └── service.yaml                        # Cloud Run config
├── k8s/
│   └── livekit-agent.yaml                  # GKE deployment
└── .github/workflows/
    ├── deploy-gcp-jp.yml                   # Backend JP deploy
    ├── deploy-gcp-uk.yml                   # Backend UK deploy
    ├── deploy-livekit-gcp-jp.yml           # LiveKit JP deploy
    └── deploy-livekit-gcp-uk.yml           # LiveKit UK deploy
```

### GCP Resources to Create

| Resource | Name | Region |
|----------|------|--------|
| Project | `hupo-salesai-jp` | Global |
| Artifact Registry | `aisales` | asia-northeast1 |
| Cloud Run Service | `aisales-backend` | asia-northeast1 |
| GKE Autopilot | `aisales-livekit` | asia-northeast1 |
| VPC Connector | `atlas-connector` | asia-northeast1 |
| Domain Mapping | `train-jp.hupo.co` | asia-northeast1 |

---

## Cost Estimation

### Monthly GCP Costs by Region

#### Japan (asia-northeast1)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| Cloud Run (Backend) | 2 vCPU, 8GB RAM, ~730 hrs | $120-180/mo |
| GKE Autopilot (LiveKit) | 6 vCPU, 45GB RAM, ~730 hrs | $250-350/mo |
| Artifact Registry | ~5GB storage | $5/mo |
| Cloud Load Balancing | 1 forwarding rule + data | $20-40/mo |
| Cloud NAT | Data processing | $30-50/mo |
| Cloud Logging | ~10GB/mo | $5-10/mo |
| Secret Manager | ~10 secrets | $1/mo |
| Data Transfer | ~100GB outbound | $40-80/mo |
| **GCP Subtotal** | | **$471-716/mo** |

#### UK (europe-west2)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| Cloud Run (Backend) | 2 vCPU, 8GB RAM | $100-150/mo |
| GKE Autopilot (LiveKit) | 6 vCPU, 45GB RAM | $220-300/mo |
| Other services | Same as above | ~$100-180/mo |
| **GCP Subtotal** | | **$420-630/mo** |

### MongoDB Atlas Costs (Same for All Regions)

| Tier | Cost |
|------|------|
| M10 (2GB) | ~$60/mo |
| M20 (4GB) - Recommended | ~$140/mo |
| M30 (8GB) | ~$280/mo |

### Total Monthly Cost Summary

| Region | GCP | Atlas (M20) | Total |
|--------|-----|-------------|-------|
| Japan | $471-716 | $140 | **$611-856/mo** |
| UK | $420-630 | $140 | **$560-770/mo** |

---

## Comparison: GCP vs AWS

| Aspect | GCP | AWS |
|--------|-----|-----|
| **Backend Compute** | Cloud Run (simpler) | ECS Fargate |
| **Heavy Workloads** | GKE Autopilot | ECS Fargate |
| **Simplicity** | ✅ Easier setup | More components |
| **Cost (Japan)** | ~$600-850/mo | ~$750-1,000/mo |
| **Cost (UK)** | ~$560-770/mo | Similar |
| **CI/CD Integration** | Workload Identity | Access Keys |
| **Serverless Containers** | ✅ Cloud Run native | Fargate (more config) |
| **Learning Curve** | Lower (if new to both) | Higher |
| **Thailand Support** | ❌ No region | ❌ No region |
| **Hong Kong Support** | ✅ asia-east2 | ✅ ap-east-1 |

### Recommendation

- **For Japan or UK:** GCP is slightly simpler and ~15-20% cheaper
- **For Hong Kong:** Use AWS (already planned)
- **For Thailand:** Neither GCP nor AWS have local regions

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cloud Run memory limit for future growth | Low | Medium | GKE Autopilot as fallback |
| GKE complexity for LiveKit | Medium | Low | Well-documented, Autopilot simplifies |
| VPC Peering setup with Atlas | Low | High | Follow Atlas documentation; test early |
| Cold start latency on Cloud Run | Low | Low | Min instances = 1 eliminates cold starts |
| First-time GCP setup | Medium | Medium | Use GCP documentation; allocate buffer |

---

## Appendix

### A. Useful gcloud Commands

```bash
# Login and set project
gcloud auth login
gcloud config set project hupo-salesai-jp

# List Cloud Run services
gcloud run services list --region asia-northeast1

# View Cloud Run logs
gcloud run services logs read aisales-backend --region asia-northeast1

# Deploy to Cloud Run
gcloud run deploy aisales-backend \
  --image asia-northeast1-docker.pkg.dev/hupo-salesai-jp/aisales/backend:latest \
  --region asia-northeast1

# Get GKE credentials
gcloud container clusters get-credentials aisales-livekit --region asia-northeast1

# View GKE pods
kubectl get pods -n default

# View GKE logs
kubectl logs -f deployment/livekit-agent

# Create secret
echo -n "secret-value" | gcloud secrets create my-secret --data-file=-

# Access secret
gcloud secrets versions access latest --secret=my-secret
```

### B. Workload Identity Federation Setup

For secure GitHub Actions → GCP authentication without long-lived keys:

```bash
# Create Workload Identity Pool
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create Provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Grant access to service account
gcloud iam service-accounts add-iam-policy-binding \
  "deploy-sa@hupo-salesai-jp.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/hupoco/aisales-backend"
```

### C. Region Codes Reference

| Location | GCP Region | AWS Region |
|----------|------------|------------|
| Tokyo, Japan | `asia-northeast1` | `ap-northeast-1` |
| Osaka, Japan | `asia-northeast2` | `ap-northeast-3` |
| London, UK | `europe-west2` | `eu-west-2` |
| Hong Kong | `asia-east2` | `ap-east-1` |
| Singapore | `asia-southeast1` | `ap-southeast-1` |

---

## Timeline Summary

| Week | Phases | Milestone |
|------|--------|-----------|
| Week 1 | 1, 2, 3 (partial) | GCP setup + Atlas ready |
| Week 2 | 3 (complete), 4, 5, 6 | Cloud Run + GKE deployed |
| Week 2.5 | 7, 8, 9 | Data seeded, tested, monitoring live |

**Target Go-Live:** ~2.5 weeks

---

*Document version: 1.0*
*Last updated: January 2026*
