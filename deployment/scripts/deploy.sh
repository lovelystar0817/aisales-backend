#!/bin/sh

# Usage: ./deploy.sh
# Default: production

ENVIRONMENT='production'
FILE_PATH="history.txt"

# Get the current date and time
CURRENT_DATE=$(date "+%Y-%m-%d %H:%M:%S")
CURRENT_USER=$(whoami)

cd aisales-backend/

echo "Starting ${ENVIRONMENT} deploy"

# Determine branch and PM2 app name based on environment
BRANCH="main"
PM2_APP="aisales"

echo
echo "Step 1. Pulling latest changes"
git pull origin ${BRANCH}

echo
echo "Step 2. Install new modules if needed"
if git diff --name-only HEAD@{1} HEAD | grep -qE 'package.json|package-lock.json'; then
    echo "Changes detected in package.json or package-lock.json, running npm install"
    npm ci --loglevel=error
else
    echo "No changes detected in package.json or package-lock.json, skipping npm install"
fi

echo
echo "Step 3. Assemble build"
npm run build

echo
echo "Step 4. Restart ${PM2_APP} process"
pm2 restart ${PM2_APP}

echo
echo "Step 5. Health check - verifying application started correctly"
RESTART_COUNT=0
MAX_RESTARTS=3
SUCCESS=false

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    echo "  Checking application health (attempt $((RESTART_COUNT + 1))/$MAX_RESTARTS)..."
    
    # Clear any previous logs and capture new ones
    pm2 flush ${PM2_APP} > /dev/null 2>&1
    sleep 2  # Give the app a moment to start
    
    # Check logs for successful startup message within 5 seconds
    TIMEOUT=5
    ELAPSED=0
    
    while [ $ELAPSED -lt $TIMEOUT ]; do
        if pm2 logs ${PM2_APP} --nostream --lines 50 2>/dev/null | grep -q "Server listening at http://127.0.0.1:5001"; then
            echo "  ✓ Application started successfully!"
            SUCCESS=true
            break 2
        fi
        sleep 1
        ELAPSED=$((ELAPSED + 1))
    done
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
        echo "  ⚠ Application did not start properly, attempting restart..."
        pm2 restart ${PM2_APP}
    fi
done

if [ "$SUCCESS" = false ]; then
    echo
    echo "═══════════════════════════════════════════════════════════════"
    echo "❌ DEPLOYMENT FAILED - APPLICATION DID NOT START SUCCESSFULLY ❌"
    echo "═══════════════════════════════════════════════════════════════"
    echo
    echo "Error messages from pm2 logs:"
    echo "-------------------------------"
    pm2 logs ${PM2_APP} --nostream --lines 30 --err 2>/dev/null || echo "Could not retrieve error logs"
    echo "-------------------------------"
    echo
    echo "Please investigate the issue and try deploying again."
    echo "You may need to check:"
    echo "  - Environment variables"
    echo "  - Database connectivity"
    echo "  - Build errors"
    echo "  - Port conflicts"
    echo
    exit 1
fi

echo
echo "Step 6. Send sourcemaps to sentry (silent)"
npm run sentry:sourcemaps > /dev/null 2>&1 || true

echo
echo "Step 7. Record deploy history"
COMMIT_INFO=$(git log -1 --pretty=format:"%h - %an : %s")
echo "${CURRENT_DATE} ${CURRENT_USER} ${ENVIRONMENT} ${COMMIT_INFO}" >> "../${FILE_PATH}"

cd ..

echo
echo "${ENVIRONMENT} deploy finished successfully ✓"
echo "Deployed commit: ${COMMIT_INFO}"
