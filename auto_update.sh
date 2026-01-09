#!/usr/bin/env bash

LOG_DIR="$HOME/.web_fractals_logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/auto_update.log"

echo_log() {
	local type="${1:-INFO}"
	shift
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$type] $*" | tee -a "$LOG_FILE"
}

if [[ "$1" == "--show_logfile" ]]; then
	echo "$LOG_FILE"
	exit
fi

if [[ "$#" -eq 1 ]]; then
	REPO_DIR="$1"
	cd "$REPO_DIR" || { echo_log "Cannot cd into $REPO_DIR"; exit 1; }
else
	REPO_DIR="$PWD"
fi

SERVER_SCRIPT="$REPO_DIR/start_server.sh"
INDEX_FILE="src/index.html"
SERVER_PORT=8000

echo_log INFO "=== Starting auto_update ==="

echo_log INFO "Stopping any existing HTTP servers on port $SERVER_PORT"
pkill -f "python -m http.server $SERVER_PORT" 2>/dev/null

start_server() {
	local file="$1"
	bash "$SERVER_SCRIPT" --lan "$file" >> "$LOG_FILE" 2>&1 &
	SERVER_PID=$!
	echo_log INFO "Server started (PID=$SERVER_PID)"
}

start_server "$INDEX_FILE"
trap '[[ -n "$SERVER_PID" ]] && kill $SERVER_PID 2>/dev/null' EXIT

START_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo_log INFO "Monitoring branch '$START_BRANCH' at commit $(git rev-parse HEAD)"

if [[ -t 1 ]]; then
	USE_STATUS=true
else
	USE_STATUS=false
fi
status () {
	$USE_STATUS || return
	printf "\r[%s] Watching '%s'" "$(date '+%H:%M:%S')" "$START_BRANCH"
}
status_clear() {
	printf "\r\033[K"
}

while true; do
	CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
	if [[ "$CURRENT_BRANCH" != "$START_BRANCH" ]]; then
		status_clear
		echo_log WARN "Branch changed from $START_BRANCH to $CURRENT_BRANCH. Exiting for safety."
		kill "$SERVER_PID" 2>/dev/null
		exit 1
	fi

	status
	git fetch origin "$START_BRANCH" >/dev/null 2>&1
		# some setups may need
		# `git fetch origin "$START_BRANCH":"$START_BRANCH"`
		# to update the local tracking branch properly.

	LOCAL=$(git rev-parse HEAD)
	REMOTE=$(git rev-parse "origin/$START_BRANCH")

	if [[ "$LOCAL" != "$REMOTE" ]]; then
		status_clear
		echo_log INFO "New changes detected. Pulling latest commits..."
		git reset --hard "origin/$START_BRANCH" >> "$LOG_FILE" 2>&1

		echo_log INFO "Restarting server..."
		kill "$SERVER_PID" 2>/dev/null
		start_server "$INDEX_FILE"
		echo_log INFO "Server restarted."
	fi

	sleep 5 # check every 5 seconds
done
