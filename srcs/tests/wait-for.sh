#!/bin/bash

set -e

host="$1"
shift
cmd="$@"

until curl -s "$host" > /dev/null; do
  >&2 echo "Waiting for $host to be available..."
  sleep 5
done

>&2 echo "$host is up - executing command"
exec $cmd
