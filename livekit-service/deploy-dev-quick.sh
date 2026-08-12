#!/bin/bash

# Quick development deployment that skips the build if image exists
# This is useful for restarting the container without rebuilding
./deploy.sh dev --skip-build