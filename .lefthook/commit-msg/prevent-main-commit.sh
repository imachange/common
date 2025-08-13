#!/bin/sh

COMMIT_MSG_FILE=$1

if ! grep -q "\[commit-main\]" "$COMMIT_MSG_FILE"; then
  echo "Error: You cannot commit to the main branch without the [commit-main] tag in the commit message."
  exit 1
fi
sed -i "s/\[commit-main\]//g" "$COMMIT_MSG_FILE"