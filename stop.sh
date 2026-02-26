#!/bin/bash
# Stops the local dev server started by ./start.sh

PID_FILE=".server.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "No server running (no .server.pid found)."
  exit 0
fi

PID=$(cat "$PID_FILE")
kill "$PID" 2>/dev/null && echo "Server stopped (PID $PID)." || echo "Process $PID not found — may have already stopped."
rm -f "$PID_FILE"

# Also kill anything still holding the port
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
