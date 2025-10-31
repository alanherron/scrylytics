#!/bin/bash
# Retry wrapper script for CI operations with exponential backoff
# Usage: ./retry.sh <max_attempts> <command> [args...]

set -e

if [ $# -lt 2 ]; then
  echo "Usage: $0 <max_attempts> <command> [args...]"
  exit 1
fi

MAX_ATTEMPTS="$1"
shift

ATTEMPT=1
DELAY=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: $@"

  if "$@"; then
    echo "Command succeeded on attempt $ATTEMPT"
    exit 0
  fi

  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "Command failed after $MAX_ATTEMPTS attempts"
    exit 1
  fi

  echo "Command failed, retrying in ${DELAY}s..."
  sleep $DELAY

  ATTEMPT=$((ATTEMPT + 1))
  DELAY=$((DELAY * 2))  # Exponential backoff
done
