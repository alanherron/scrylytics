#!/usr/bin/env bash
echo "🧹 Killing local dev servers..."
pkill -f "node|vite|next|react-scripts|python|flask|bun|deno" 2>/dev/null || true
pkill -f "redis-server|postgres|mongod" 2>/dev/null || true

sleep 1
echo "✅ All local servers stopped."

echo "🚀 Restarting dev environment..."
cd "$(git rev-parse --show-toplevel)" || exit 1

EXTERNAL_LOCKFILE="${HOME}/package-lock.json"
if [ -f "$EXTERNAL_LOCKFILE" ]; then
  BACKUP_PATH="${EXTERNAL_LOCKFILE}.bak"
  echo "⚙️  Detected extra package-lock.json at ~$HOME; moving it to ${BACKUP_PATH} to silence Next.js root warning."
  mv -n "$EXTERNAL_LOCKFILE" "$BACKUP_PATH" || rm -f "$EXTERNAL_LOCKFILE"
fi

npm run dev
