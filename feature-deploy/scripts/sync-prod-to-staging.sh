#!/bin/bash

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/colors.sh"

# Collections to sync from production to staging.
# These are reference/seed data required for the app to function.
# User-generated data (sessions, messages, users, etc.) is NOT synced.
COLLECTIONS=(
  "companies"
  "modules"
  "personas"
  "salesproducts"
  "scorecards"
  "scenarios"
  "voices"
  "salesproductcompetitors"
)

show_usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Syncs reference data from production DB to staging DB (additive only)."
  echo "Inserts missing documents. Never deletes or overwrites existing data."
  echo ""
  echo "DB URIs are read from feature-deploy/scripts/.env.sync file:"
  echo "  PROD_DATABASE_URL=mongodb+srv://..."
  echo "  STAGING_DATABASE_URL=mongodb+srv://..."
  echo ""
  echo "Options:"
  echo "  --dry-run            Show what would be synced without making changes"
  echo "  --collections <list> Comma-separated list of collections (overrides defaults)"
  echo "  -h, --help           Show this help message"
  echo ""
  echo "Default collections:"
  for col in "${COLLECTIONS[@]}"; do
    echo "  - $col"
  done
  exit 0
}

# Parse arguments
DRY_RUN=false
CUSTOM_COLLECTIONS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --collections)
      CUSTOM_COLLECTIONS="$2"
      shift 2
      ;;
    -h|--help)
      show_usage
      ;;
    *)
      echo_error "Unknown option: $1"
      show_usage
      ;;
  esac
done

# Load DB URIs from .env.sync file
ENV_SYNC_FILE="$SCRIPT_DIR/.env.sync"
if [ ! -f "$ENV_SYNC_FILE" ]; then
  echo_error "Missing .env.sync file at: $ENV_SYNC_FILE"
  echo ""
  echo_info "Create it with:"
  echo "  PROD_DATABASE_URL=mongodb+srv://user:pass@prod-cluster/dbname"
  echo "  STAGING_DATABASE_URL=mongodb+srv://user:pass@staging-cluster/dbname"
  echo ""
  echo_info "This file is gitignored and stays only on the server."
  exit 1
fi

# Source the env file (exports PROD_DATABASE_URL and STAGING_DATABASE_URL)
set -a
source "$ENV_SYNC_FILE"
set +a

# Override collections if custom list provided
if [ -n "$CUSTOM_COLLECTIONS" ]; then
  IFS=',' read -ra COLLECTIONS <<< "$CUSTOM_COLLECTIONS"
fi

# Validate URIs
if [ -z "$PROD_DATABASE_URL" ]; then
  echo_error "PROD_DATABASE_URL not set in .env.sync"
  exit 1
fi

if [ -z "$STAGING_DATABASE_URL" ]; then
  echo_error "STAGING_DATABASE_URL not set in .env.sync"
  exit 1
fi

# Safety check - don't allow same URI for both
if [ "$PROD_DATABASE_URL" == "$STAGING_DATABASE_URL" ]; then
  echo_error "Production and staging URIs are the same! Aborting."
  exit 1
fi

# Extract display-safe URIs (hide credentials)
PROD_DISPLAY=$(echo "$PROD_DATABASE_URL" | sed 's|mongodb+srv://[^@]*@|mongodb+srv://***@|' | sed 's|mongodb://[^@]*@|mongodb://***@|')
STAGING_DISPLAY=$(echo "$STAGING_DATABASE_URL" | sed 's|mongodb+srv://[^@]*@|mongodb+srv://***@|' | sed 's|mongodb://[^@]*@|mongodb://***@|')

echo ""
echo_info "Sync Reference Data: Production -> Staging (additive only)"
echo ""
echo "  Source (prod):    $PROD_DISPLAY"
echo "  Target (staging): $STAGING_DISPLAY"
echo ""
echo "  Mode: INSERT ONLY - existing documents are never modified or deleted"
echo ""
echo "  Collections to sync:"
for col in "${COLLECTIONS[@]}"; do
  echo "    - $col"
done
echo ""

if [ "$DRY_RUN" == "true" ]; then
  echo_warning "DRY RUN - No changes will be made"
  echo ""

  for col in "${COLLECTIONS[@]}"; do
    COUNT=$(mongosh "$PROD_DATABASE_URL" --quiet --eval "db.getCollection('$col').countDocuments()")
    echo_info "  $col: $COUNT documents in production"
  done

  echo ""
  echo_success "Dry run complete. Run without --dry-run to execute."
  exit 0
fi

# Create temp directory for dump
DUMP_DIR=$(mktemp -d)
trap "rm -rf $DUMP_DIR" EXIT

echo_info "Starting sync..."

FAILED=()
SUCCESS=()
SKIPPED=()

for col in "${COLLECTIONS[@]}"; do
  echo ""
  echo_info "Syncing: $col"

  # Dump from production
  if ! mongodump --uri="$PROD_DATABASE_URL" --collection="$col" --out="$DUMP_DIR" --quiet 2>/dev/null; then
    echo_error "  Failed to dump $col from production"
    FAILED+=("$col")
    continue
  fi

  # Find the dumped database directory
  DUMP_DB_DIR=$(find "$DUMP_DIR" -type d -mindepth 1 -maxdepth 1 | head -1)

  if [ -z "$DUMP_DB_DIR" ] || [ ! -f "$DUMP_DB_DIR/$col.bson" ]; then
    echo_warning "  No data found for $col in production (empty or missing)"
    SKIPPED+=("$col")
    rm -rf "$DUMP_DIR"/*
    continue
  fi

  # Restore to staging in insert-only mode (no --drop, default mode=insert).
  # Duplicate _id documents are silently skipped - existing staging data is preserved.
  # mongorestore returns non-zero when there are duplicate key "errors" (which are
  # expected and fine for us), so we capture output instead of failing on exit code.
  RESTORE_OUTPUT=$(mongorestore \
    --uri="$STAGING_DATABASE_URL" \
    --collection="$col" \
    --nsFrom="*.$col" \
    --nsTo="*.$col" \
    "$DUMP_DB_DIR/$col.bson" \
    2>&1) || true

  # Parse counts from mongorestore output
  INSERTED=$(echo "$RESTORE_OUTPUT" | grep -oE '[0-9]+ document\(s\) restored' | grep -oE '[0-9]+' || echo "0")
  FAILED_COUNT=$(echo "$RESTORE_OUTPUT" | grep -oE '[0-9]+ document\(s\) failed' | grep -oE '[0-9]+' || echo "0")

  # Check for actual errors (not just duplicate key skips)
  if echo "$RESTORE_OUTPUT" | grep -q "error" && ! echo "$RESTORE_OUTPUT" | grep -q "duplicate key"; then
    echo_error "  Unexpected error restoring $col"
    echo "  $RESTORE_OUTPUT"
    FAILED+=("$col")
  else
    echo_success "  $col: $INSERTED new documents inserted, $FAILED_COUNT already existed (skipped)"
    SUCCESS+=("$col")
  fi

  # Clean up dump for next iteration
  rm -rf "$DUMP_DIR"/*
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo_info "Sync Summary"
echo ""

if [ ${#SUCCESS[@]} -gt 0 ]; then
  echo_success "Synced (${#SUCCESS[@]}):"
  for col in "${SUCCESS[@]}"; do
    echo "  + $col"
  done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo ""
  echo_warning "Skipped - empty in production (${#SKIPPED[@]}):"
  for col in "${SKIPPED[@]}"; do
    echo "  ~ $col"
  done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo_error "Failed (${#FAILED[@]}):"
  for col in "${FAILED[@]}"; do
    echo "  x $col"
  done
  echo ""
  exit 1
fi

echo ""
echo_success "Sync complete! Staging DB has all reference data from production."
echo_info "No existing staging data was modified or deleted."
