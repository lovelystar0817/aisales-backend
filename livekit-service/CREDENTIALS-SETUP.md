# Google Credentials Setup

This document explains how to set up Google credentials for the LiveKit Agent.

## Overview

Google credentials are now stored outside the repository for security reasons. They are mounted as a volume at runtime rather than being copied during build.

## Setup Instructions

### 1. Create Credentials Directory

Create a secure directory outside your repository to store credentials:

```bash
# Production example
sudo mkdir -p /etc/aisales/secrets
sudo chmod 700 /etc/aisales/secrets

# Development example  
mkdir -p ~/secrets/aisales
chmod 700 ~/secrets/aisales
```

### 2. Place Credentials File

Copy your Google credentials JSON file to the secure directory:

```bash
# Production
sudo cp google-credentials.json /etc/aisales/secrets/google-credentials.json
sudo chmod 600 /etc/aisales/secrets/google-credentials.json

# Development
cp google-credentials.json ~/secrets/aisales/google-credentials.json
chmod 600 ~/secrets/aisales/google-credentials.json
```

### 3. Update .env File

Set the `GOOGLE_CREDENTIALS_PATH` variable in your `.env` file:

```bash
# Production example
GOOGLE_CREDENTIALS_PATH=/etc/aisales/secrets/google-credentials.json

# Development example  
GOOGLE_CREDENTIALS_PATH=/home/username/secrets/aisales/google-credentials.json
```

### 4. Deploy

The deployment scripts will automatically:
- Validate that the credentials file exists
- Mount it into the container at `/app/google-credentials.json`
- Make it available to the LiveKit agent

## File Structure

```
Container: /app/google-credentials.json (mounted from host)
Host:      ${GOOGLE_CREDENTIALS_PATH} (configured in .env)
```

## Security Notes

- Credentials are never stored in the repository
- Files are mounted read-only into containers
- Proper file permissions (600) restrict access to owner only
- Directory permissions (700) restrict access to owner only

## Troubleshooting

### Error: "Google credentials file not found"

1. Check that the file exists at the specified path:
   ```bash
   ls -la $GOOGLE_CREDENTIALS_PATH
   ```

2. Verify file permissions:
   ```bash
   ls -la $(dirname $GOOGLE_CREDENTIALS_PATH)
   ```

3. Ensure the path in `.env` is absolute (starts with `/`)

### Error: "Permission denied" 

1. Check file ownership and permissions:
   ```bash
   ls -la $GOOGLE_CREDENTIALS_PATH
   ```

2. Fix permissions if needed:
   ```bash
   chmod 600 $GOOGLE_CREDENTIALS_PATH
   ```

### Error: Docker volume mount fails

1. Ensure Docker has access to the credentials directory
2. On some systems, you may need to add the directory to Docker's file sharing settings