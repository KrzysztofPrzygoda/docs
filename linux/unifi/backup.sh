#!/bin/bash

set -euo pipefail

datestamp="$(date +%m-%d-%Y)"
backup_dir="/path/to/your/backup/dir"
output_file="${backup_dir}/unifi_backup_${datestamp}.unifi"

unifi_address="https://<YOUR IP ADDRESS OR DOMAIN HERE>"
unifi_admin="<admin username>"
unifi_pass="<admin user pass>"


if [ ! -d "$backup_dir" ] || [ ! -w "$backup_dir" ]; then
        echo "Backup dir does not exist or is not writeable"
        exit 1
    fi


COOKIE_JAR=$(mktemp)
trap 'rm -f "$COOKIE_JAR"' EXIT


if [ ! -f "$COOKIE_JAR" ] || [ ! -w "$COOKIE_JAR" ]; then
    echo "Failed to create temp cookie jar"
    exit 1
fi


RESPONSE_HEADERS=$(curl -sk -X POST "$(unifi_address)/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"$(unifi_admin)","password":"$(unifi_pass)"}' \
  -c "$COOKIE_JAR" \
  -D - \
  -o /dev/null)


CSRF=$(echo "$RESPONSE_HEADERS" | grep 'x-csrf-token' | awk '{print $2}' | tr -d '\r')


if [ -z "$CSRF" ]; then
    echo "Failed to get CSRF token — check credentials or controller address"
    exit 1
fi


curl -sk "$(unifi_address)/api/backup/download" \
  -H "X-CSRF-Token: $CSRF" \
  -b "$COOKIE_JAR" \
  -o "$output_file"


# Delete every other old backup, only keeping the latest
# Adjust find command as necessary if you want extras kept
if [ -f "$output_file" ]; then
    echo "Backup successful: $output_file"
    find "$backup_dir" -mindepth 1 -type f ! -samefile "$output_file" -delete
else
    echo "Backup unsuccessful"
    exit 1
fi


curl -sk -X POST "$(unifi_address)/api/auth/logout" \
  -H "X-CSRF-Token: $CSRF" \
  -H "Content-Length: 0" \
  -b "$COOKIE_JAR" \
  -o /dev/null

echo "Logout successful"