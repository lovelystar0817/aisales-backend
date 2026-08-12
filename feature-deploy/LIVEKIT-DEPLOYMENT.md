# LiveKit Feature Deployment Guide

This guide explains how to deploy LiveKit agents alongside feature branches for fully isolated testing environments.

## Overview

The feature deployment system now supports deploying LiveKit agents from the same feature branch as your backend code. This enables:

- **Full feature isolation**: Backend + LiveKit agent from the same branch
- **Independent testing**: Test LiveKit changes without affecting production
- **Automatic configuration**: Agent names and URLs configured automatically
- **Easy cleanup**: Remove backend and agent together

## Quick Start

### Deploy Backend + LiveKit Together

```bash
./deploy-feature feature/my-feature --with-livekit
```

This will:

1. Deploy backend from `feature/my-feature` branch
2. Deploy LiveKit agent from the same branch
3. Configure agent to connect to feature backend
4. Set agent name to `aisales-livekit-agent-my-feature`

### Deploy LiveKit Agent Only

If you've already deployed the backend and want to add LiveKit:

```bash
./deploy-livekit-feature my-feature
```

### Remove Deployment

Remove both backend and LiveKit:

```bash
./remove-feature my-feature
```

Remove only LiveKit agent:

```bash
./remove-livekit-feature my-feature
```

## How It Works

### Agent Naming Convention

- **Backend**: `LIVEKIT_AGENT_NAME=aisales-livekit-agent-<feature-name>`
- **Agent**: `AGENT_NAME=aisales-livekit-agent-<feature-name>`
- **Container**: `aisales-livekit-agent-<feature-name>`

Example for `feature/auth-improvements`:

- Agent Name: `aisales-livekit-agent-auth-improvements`
- Container: `aisales-livekit-agent-auth-improvements`

### Backend URL Pattern

Feature backends follow Netlify's pattern:

```
https://feature-<feature-name>--huposalesai.netlify.app
```

The LiveKit agent's `BASE_URL` is automatically configured to this URL.

### Environment Variables

**Backend (.env)**:

```env
LIVEKIT_AGENT_NAME=aisales-livekit-agent-my-feature
LIVEKIT_API_KEY=<shared-with-production>
LIVEKIT_API_SECRET=<shared-with-production>
LIVEKIT_URL=<shared-with-production>
```

**LiveKit Agent (.env)**:

```env
AGENT_NAME=aisales-livekit-agent-my-feature
BASE_URL=https://feature-my-feature--huposalesai.netlify.app
ENVIRONMENT=dev
LIVEKIT_API_KEY=<same-as-backend>
LIVEKIT_API_SECRET=<same-as-backend>
LIVEKIT_URL=<same-as-backend>
```

### Docker Configuration

LiveKit agents are deployed with:

- **Environment**: `dev` (enables debug logging)
- **Idle Processes**: `1` (reduced from production's 8)
- **Container Name**: `aisales-livekit-agent-<feature-name>`

## Prerequisites

1. **Docker must be running**

   ```bash
   docker ps  # Should not error
   ```

2. **Main project has LiveKit .env**

   ```bash
   ls livekit-service/.env  # Should exist
   ```

3. **Backend feature is deployed first** (when using `deploy-livekit-feature` standalone)

## Examples

### Example 1: New Feature with LiveKit Changes

```bash
# Deploy everything together
./deploy-feature feature/realtime-voice --with-livekit

# Test your changes
# Backend: https://feature03.trainapi.hupo.co
# LiveKit connects to: https://feature-realtime-voice--huposalesai.netlify.app

# View LiveKit logs
docker logs -f aisales-livekit-agent-realtime-voice

# Cleanup when done
./remove-feature realtime-voice
```

### Example 2: Backend Already Deployed, Add LiveKit

```bash
# Backend was deployed without --with-livekit
./deploy-feature feature/audio-fix

# Later, add LiveKit
./deploy-livekit-feature audio-fix

# Remove only LiveKit when testing complete
./remove-livekit-feature audio-fix
```

### Example 3: Update LiveKit Code

```bash
# Make changes to livekit-agent.py in your branch
git commit -am "Update agent logic"
git push origin feature/my-feature

# Redeploy backend to get latest code
./deploy-feature feature/my-feature --force --with-livekit

# Or just redeploy LiveKit
./deploy-livekit-feature my-feature --force
```

## Troubleshooting

### Agent Not Connecting to Backend

**Check BASE_URL configuration:**

```bash
docker exec aisales-livekit-agent-my-feature env | grep BASE_URL
```

Should show: `BASE_URL=https://feature-my-feature--huposalesai.netlify.app`

**Check agent name matches:**

```bash
# Backend
grep LIVEKIT_AGENT_NAME /path/to/worktree/.env

# Agent
docker exec aisales-livekit-agent-my-feature env | grep AGENT_NAME
```

Both should be: `aisales-livekit-agent-my-feature`

### Docker Container Not Starting

**View logs:**

```bash
docker logs aisales-livekit-agent-my-feature
```

**Check if deploy.sh exists:**

```bash
ls livekit-service/deploy.sh
```

**Ensure Docker is running:**

```bash
docker ps
```

### Agent Name Mismatch

If backend dispatches to wrong agent:

1. Check backend env:

   ```bash
   grep LIVEKIT_AGENT_NAME /path/to/worktree/.env
   ```

2. Check agent registration:

   ```bash
   docker logs aisales-livekit-agent-my-feature | grep "AGENT_NAME"
   ```

3. Ensure they match exactly

## Resource Management

### Reduce Resource Usage

Feature agents use reduced resources:

- 1 idle process (vs 8 in production)
- Development logging level
- Shared LiveKit server (not separate instances)

### Monitor Resource Usage

```bash
# View all running agents
docker ps --filter "name=aisales-livekit-agent"

# Check resource usage
docker stats
```

### Cleanup Old Deployments

```bash
# List all features
./list-features

# Remove unused ones
./remove-feature old-feature-1
./remove-feature old-feature-2
```

## Advanced Usage

### Deploy Multiple Features with LiveKit

```bash
# Feature 1
./deploy-feature feature/experiment-1 --with-livekit

# Feature 2
./deploy-feature feature/experiment-2 --with-livekit

# All agents connect to same LiveKit server but with different names
# experiment-1: aisales-livekit-agent-experiment-1
# experiment-2: aisales-livekit-agent-experiment-2
```

### Force Rebuild

```bash
# Rebuild both backend and LiveKit
./deploy-feature feature/my-feature --force --with-livekit

# Rebuild only LiveKit
./deploy-livekit-feature my-feature --force
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  LiveKit Server                     │
│              (Shared Production Instance)           │
└─────────────────┬────────────────┬──────────────────┘
                  │                │
    ┌─────────────┴──────┐   ┌─────┴──────────────┐
    │  Production Agent  │   │  Feature Agent     │
    │  name: voice-agent │   │  name: aisales-    │
    │                    │   │  livekit-agent-    │
    │                    │   │  my-feature        │
    └────────────────────┘   └─────┬──────────────┘
                                   │
                          ┌────────┴───────────┐
                          │ Feature Backend    │
                          │ https://feature-   │
                          │ my-feature--       │
                          │ huposalesai.       │
                          │ netlify.app        │
                          └────────────────────┘
```

## File Locations

- **Deploy Script**: `feature-deploy/scripts/deploy-livekit-feature.sh`
- **Remove Script**: `feature-deploy/scripts/remove-livekit-feature.sh`
- **Wrapper Scripts**: `./deploy-livekit-feature`, `./remove-livekit-feature`
- **Agent .env**: `<worktree>/livekit-service/.env` (auto-configured)
- **Backend .env**: `<worktree>/.env` (includes `LIVEKIT_AGENT_NAME`)

## Environment Variables Reference

### Required in Main Project

**livekit-service/.env**:

```env
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://...
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
GOOGLE_API_KEY=...
GOOGLE_CREDENTIALS_PATH=/path/to/creds.json
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET=...
```

### Auto-Configured in Feature Deployment

These are set automatically:

- `AGENT_NAME` - Set to `aisales-livekit-agent-<feature>`
- `BASE_URL` - Set to feature backend URL
- `ENVIRONMENT` - Set to `dev`

## Best Practices

1. **Always deploy backend first** before adding LiveKit
2. **Use `--with-livekit`** for new features that need both
3. **Check logs** after deployment to verify connection
4. **Clean up old deployments** to free resources
5. **Use `--force`** to update existing deployments

## Limitations

- Maximum concurrent deployments limited by host resources
- All agents share the same LiveKit server
- Docker must be running on the deployment host
- Feature backend must follow Netlify URL pattern
