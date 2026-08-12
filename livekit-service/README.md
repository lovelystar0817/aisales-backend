# LiveKit Agent Docker Setup

## Prerequisites

### Install Docker and Docker Compose V2

If you don't have Docker installed or need to upgrade to Docker Compose V2:

```bash
# Run the setup script
chmod +x setup-docker.sh
./setup-docker.sh

# Log out and log back in (or run: newgrp docker)
```

### Manual Docker Compose V2 Installation

If you prefer manual installation:

```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker compose version
```

## Initial Setup

1. **Clone your repository and navigate to it:**

   ```bash
   git clone your-repo-url
   cd your-repo
   ```

2. **Set up environment variables:**

   ```bash
   # Copy the template
   cp livekit-service/.env.template livekit-service/.env

   # Edit with your actual API keys
   nano livekit-service/.env
   ```

3. **Make deployment script executable:**
   ```bash
   chmod +x livekit-service/deploy.sh
   ```

## File Structure

Your project should look like this:

```
your-repo/
├── livekit-service/
│   ├── livekit-agent.py          # Your agent code
│   ├── requirements.txt          # Python dependencies
│   ├── start-agent.sh            # Startup script with error handling
│   ├── Dockerfile               # Docker build instructions
│   ├── docker-compose.yml       # Container orchestration
│   ├── .env.template           # Environment template
│   ├── .env                    # Your actual secrets (gitignored)
│   ├── deploy.sh               # Deployment script
│   └── logs/                   # Container logs (created automatically)
├── .gitignore                  # Git ignore rules
└── README.md
```

## Deployment

### First time deployment:

```bash
cd livekit-service
./deploy.sh
```

### Subsequent deployments:

```bash
# Just run the deploy script - it handles everything
./deploy.sh
```

## Managing the Service

### View logs:

```bash
cd livekit-service
docker compose logs -f
```

### Restart the service:

```bash
docker compose restart
```

### Stop the service:

```bash
docker compose down
```

### Check status:

```bash
docker compose ps
```

### Manual deployment steps (if needed):

```bash
git pull origin main
docker compose down
docker compose build
docker compose up -d
```

## Security Notes

- **Never commit `.env` files** - they contain your API keys
- The `.env.template` file is safe to commit - it shows the required variables without actual values
- Use strong, unique API keys for production
- Consider using Docker secrets or external secret management for production

## Troubleshooting

### Container won't start:

```bash
# Check logs
docker compose logs

# Check if environment variables are set
docker compose config
```

### Build issues:

```bash
# Clean build
docker compose build --no-cache

# Remove old containers and volumes
docker compose down -v
docker system prune
```

### Environment variable issues:

1. Verify `.env` file exists and has all required variables
2. Check for extra spaces or quotes around values
3. Ensure no trailing whitespace in `.env` file
