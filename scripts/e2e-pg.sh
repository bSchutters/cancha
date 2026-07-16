#!/usr/bin/env bash
# Start a throwaway local Postgres for E2E tests on 127.0.0.1:55432.
# Never touches the shared Supabase database. Idempotent: re-run to (re)start.
set -euo pipefail

PGDATA="${PGDATA:-/tmp/cancha-e2e-pg}"
SOCK="/tmp/cpg"           # short path (Unix socket path is limited to ~103 bytes)
PORT=55432

mkdir -p "$SOCK"

if [ ! -d "$PGDATA/base" ]; then
  echo "[e2e-pg] initdb → $PGDATA"
  initdb -D "$PGDATA" -U postgres --auth=trust >/dev/null
  {
    echo "port = $PORT"
    echo "unix_socket_directories = '$SOCK'"
    echo "listen_addresses = '127.0.0.1'"
  } >> "$PGDATA/postgresql.conf"
fi

if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  echo "[e2e-pg] already running on :$PORT"
else
  pg_ctl -D "$PGDATA" -o "-k $SOCK" -w start
  echo "[e2e-pg] started on 127.0.0.1:$PORT"
fi

# Ensure the test database exists BEFORE Playwright boots the app (the isolated
# server connects to it and pushes the schema). Idempotent.
createdb -h 127.0.0.1 -p "$PORT" -U postgres cancha_test 2>/dev/null && \
  echo "[e2e-pg] created database cancha_test" || echo "[e2e-pg] database cancha_test ready"
