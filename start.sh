#!/bin/bash
# Starts a local dev server for the Supplier Dashboard.
# Open http://localhost:8000 in your browser after running this.

PORT=8000
PID_FILE=".server.pid"

if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  echo "Server already running (PID $OLD_PID). Restarting..."
  kill "$OLD_PID" 2>/dev/null || true
  rm -f "$PID_FILE"
fi

echo "Starting Supplier Dashboard on http://localhost:$PORT"
python3 -m http.server $PORT &> .server.log &
echo $! > "$PID_FILE"
echo "Server started (PID $(cat $PID_FILE)). Run ./stop.sh to stop it."

# Open in browser (Mac)
open "http://localhost:$PORT" 2>/dev/null || true
