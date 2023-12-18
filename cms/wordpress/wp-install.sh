#!/bin/bash

# Settings
WORDPRESS_URL="https://wordpress.org/latest.tar.gz"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"  # Get the directory containing the script
TEMP_DIR="$SCRIPT_DIR/tmp"
DEST_DIR="$SCRIPT_DIR/public_html"

# Creating a temporary directory
mkdir -p "$TEMP_DIR"

# Downloading the latest WordPress version
echo "Downloading the latest WordPress version..."
wget $WORDPRESS_URL -O "$TEMP_DIR/latest.tar.gz"

# Extracting the archive
echo "Extracting the archive..."
tar -zxf "$TEMP_DIR/latest.tar.gz" -C "$TEMP_DIR/"

# Moving files to DEST_DIR
echo "Moving files to $DEST_DIR..."

# Define an array of files and directories to exclude
EXCLUSIONS=(
  '.htaccess'
  'wp-config.php'
  'wp-content/'
)

echo "Excluding: ${EXCLUSIONS[*]}"

# Using rsync to copy files, overwrite all except those in EXCLUSIONS
rsync -a --delete "${EXCLUSIONS[@]/#/--exclude=}" "$TEMP_DIR/wordpress/" "$DEST_DIR"
# rsync -a --delete --exclude="${EXCLUSIONS[*]}" "$TEMP_DIR/wordpress/" "$DEST_DIR/"
# -a (archive): This option signifies the archive mode, including recursive copying, preservation of file attributes, symbolic links, etc.
# --delete: This option instructs rsync to remove files from the destination directory that are not present in the source directory.

# Using rsync to copy only files in EXCLUSIONS that do not exist in DEST_DIR
for item in "${EXCLUSIONS[@]}"; do
    src_item="$TEMP_DIR/wordpress/$item"
    dest_item="$DEST_DIR/$item"
    
    if [ -e "$src_item" ] && [ ! -e "$dest_item" ]; then
        rsync -a "$src_item" "$dest_item"
        echo "Copied: $item"
    elif [ ! -e "$src_item" ]; then
        echo "[SKIPPED] Source item does not exist: $item"
    else
        echo "[SKIPPED] Destination item already exists: $item"
    fi
done

# Cleaning up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "WordPress has been updated to the latest version in the $DEST_DIR directory"
