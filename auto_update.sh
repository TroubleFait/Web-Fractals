#!/usr/bin/env bash

if [[ "$#" != 1 ]]; then
	echo "Usage: $0 <project path>"
	exit 1
fi

REPO_DIR="$1"
SERVER_SCRIPT="$REPO_DIR/start_server.sh"
INDEX_FILE="src/index.html"
SERVER_PORT=8000

cd "$REPO_DIR" || { echo "Cannot cd into $REPO_DIR"; exit 1; }

bash "$SERVER_SCRIPT" --lan "$INDEX_FILE" &
SERVER_PID=$!

START_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Monitoring branch '$START_BRANCH' at commit $(git rev-parse HEAD)"

while true; do
	CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
	if [[ "$CURRENT_BRANCH" != "$START_BRANCH" ]]; then
		echo "Branch changed from $START_BRANCH to $CURRENT_BRANCH."
		echo "Exiting for safety."
		kill "$SERVER_PID" 2>/dev/null
		exit 1
	fi

	git fetch origin "$START_BRANCH" >/dev/null 2>&1
		# some setups may need
		# `git fetch origin "$START_BRANCH":"$START_BRANCH"`
		# to update the local tracking branch properly.

	LOCAL=$(git rev-parse HEAD)
	REMOTE=$(git rev-parse "origin/$START_BRANCH")

	if [[ "$LOCAL" != "$REMOTE" ]]; then
		echo "New changes detected. Pulling latest commits..."
		git reset --hard "origin/$START_BRANCH"

		echo "Restarting server..."
		kill "$SERVER_PID" 2>/dev/null
		bash "$SERVER_SCRIPT" --lan "$INDEX_FILE" &
		SERVER_PID=$!
		echo "Server restarted."
	fi

	sleep 5 # check every 5 seconds
done
