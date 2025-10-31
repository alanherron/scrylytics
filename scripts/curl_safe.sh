#!/usr/bin/env bash

set -euo pipefail

# Tunables (override via environment if needed)

CONNECT_TIMEOUT="${CONNECT_TIMEOUT:-5}"      # seconds to connect

MAX_TIME="${MAX_TIME:-30}"                  # total time cap

RETRY_MAX_TIME="${RETRY_MAX_TIME:-40}"      # overall retry budget

RETRY_COUNT="${RETRY_COUNT:-5}"             # retry attempts

SPEED_TIME="${SPEED_TIME:-10}"              # abort if stalled this long

SPEED_LIMIT="${SPEED_LIMIT:-1024}"          # 1KB/s threshold

EXPECT100_TIMEOUT="${EXPECT100_TIMEOUT:-2}" # POST expect-continue delay

BACKOFF_BASE="${BACKOFF_BASE:-1}"           # base for exponential backoff

SHOW_HEADERS="${SHOW_HEADERS:-0}"           # 1 = print headers too

# timeout command detection

TIMEOUT_BIN="$(command -v timeout || true)"

if [[ -z "$TIMEOUT_BIN" && "$(uname)" == "Darwin" ]]; then

  TIMEOUT_BIN="$(command -v gtimeout || true)"

fi

KILL_AFTER="${KILL_AFTER:-5}"

HARD_TIMEOUT="${HARD_TIMEOUT:-$((MAX_TIME + 5))}"

if [[ -n "$TIMEOUT_BIN" ]]; then

  TIMEOUT_PREFIX=("$TIMEOUT_BIN" -k "${KILL_AFTER}s" "${HARD_TIMEOUT}s")

else

  TIMEOUT_PREFIX=()

fi

_redact() { sed -E 's/(Authorization:\s*)[^ ]+/\1<redacted>/I'; }

COMMON_OPTS=(

  --fail-with-body

  --show-error

  --silent

  --location

  --connect-timeout "$CONNECT_TIMEOUT"

  --max-time "$MAX_TIME"

  --retry "$RETRY_COUNT"

  --retry-all-errors

  --retry-max-time "$RETRY_MAX_TIME"

  --speed-time "$SPEED_TIME"

  --speed-limit "$SPEED_LIMIT"

  --expect100-timeout "$EXPECT100_TIMEOUT"

  --no-buffer

  --write-out "\n%{http_code}\n"

)

[[ "$SHOW_HEADERS" == "1" ]] && COMMON_OPTS+=( --include )

safe_curl() {

  local attempt=0 max="$RETRY_COUNT"

  while (( attempt <= max )); do

    (( attempt > 0 )) && sleep "$(awk "BEGIN {print (${BACKOFF_BASE}*2^${attempt-1}) + (rand())}")"

    local output
    if [[ ${#TIMEOUT_PREFIX[@]} -gt 0 ]]; then
      output="$("${TIMEOUT_PREFIX[@]}" curl "${COMMON_OPTS[@]}" "$@" 2> >( _redact >&2 ) || echo "CURL_FAILED:$?")"
    else
      output="$(curl "${COMMON_OPTS[@]}" "$@" 2> >( _redact >&2 ) || echo "CURL_FAILED:$?")"
    fi

    # Extract HTTP code and body
    local code="${output##*$'\n'}"
    local body="${output%$'\n'*}"

    if [[ "$output" == CURL_FAILED:* ]]; then
      local rc="${output#CURL_FAILED:}"
      (( attempt++ ))
      if (( attempt > max )); then
        printf 'curl_safe: gave up after %d attempts (network error)\n' "$max" >&2
        return "$rc"
      fi
      continue
    fi

    if [[ "$code" =~ ^[23][0-9][0-9]$ ]]; then
      printf '%s' "$body"
      return 0
    fi

    if [[ "$code" =~ ^4[0-9][0-9]$ && ! "$code" =~ ^40(8|9)$ && "$code" != "429" ]]; then
      printf 'curl_safe: HTTP %s (no retry)\n' "$code" >&2
      printf '%s' "$body"
      return 22
    fi

    (( attempt++ ))

    if (( attempt > max )); then
      printf 'curl_safe: gave up after %d attempts (rc=0, http=%s)\n' "$max" "${code:-none}" >&2
      printf '%s' "$body"
      return 1
    fi

  done

}

safe_curl "$@"
