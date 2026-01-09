#!/usr/bin/env bash

if [[ "$1" == "-h" || "$1" == "--help" ]]; then
	echo "Usage:"
	echo "[--lan] [file]"
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

FILE="$1"

echo
echo "Serving on:"
echo "	http://${HOST_LABEL}:${PORT}/"

if [[ -n "$FILE" ]]; then
	echo
	echo "Open this file:"
	echo "	http://${HOST_LABEL}:${PORT}/${FILE}"
fi

echo
python -m http.server "$PORT" --bind "$BIND"
