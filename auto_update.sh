#!/usr/bin/env bash

if [[ "$#" != 1 ]]; then
	echo "Usage: <project path>"
	exit 0
fi

REPO_DIR="$1"
SERVER_PORT=8000

cd "$REPO_DIR" || exit

while true; do
	git fetch origin main
	LOCAL=$(git rev-parse HEAD)
	REMOTE=$(git rev-parse origin/main)

	if [ "$LOCAL" != "$REMOTE" ]; then
		echo "New changes detected. Pulling..."
		git reset --hard origin/main
		echo "Restarting server..."
		pkill -f "python -m http.server $SERVER_PORT"
		python -m http.server $SERVER_PORT &
		echo "Done."
	fi

	sleep 5 # check every 5 seconds
done
