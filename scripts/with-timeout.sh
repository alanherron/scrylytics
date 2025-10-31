#!/bin/bash
# Timeout wrapper script for CI operations
# Usage: ./with-timeout.sh <timeout_seconds> <command> [args...]

set -e

if [ $# -lt 2 ]; then
  echo "Usage: $0 <timeout_seconds> <command> [args...]"
  exit 1
fi

TIMEOUT="$1"
shift

echo "Running command with ${TIMEOUT}s timeout: $@"

# Use timeout command if available, otherwise fallback to a simple implementation
if command -v timeout >/dev/null 2>&1; then
  timeout "$TIMEOUT" "$@"
else
  # Fallback implementation using background process
  "$@" &
  PID=$!
  COUNT=0

  while [ $COUNT -lt $TIMEOUT ]; do
    if ! kill -0 $PID 2>/dev/null; then
      wait $PID
      exit $?
    fi
    sleep 1
    COUNT=$((COUNT + 1))
  done

  echo "Command timed out after ${TIMEOUT} seconds"
  kill -TERM $PID 2>/dev/null || true
  sleep 2
  kill -KILL $PID 2>/dev/null || true
  exit 124
fi
