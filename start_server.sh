#!/usr/bin/env bash

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
	echo "Usage:	$0 [--lan] [file]"
	exit 0
fi

PORT=8000
BIND="127.0.0.1"
HOST_LABEL="localhost"

# Detect LAN mode
if [[ "$1" == "--lan" ]]; then
	BIND="0.0.0.0"
	HOST_LABEL=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1)
	shift
fi

echo "Serving on:	http://${HOST_LABEL}:${PORT}/"

FILE="$1"

if [[ -n "$FILE" ]]; then
	DIR=$(dirname "$FILE")
else
	DIR="."
fi

python -m http.server "$PORT" --bind "$BIND" --directory "$DIR"
