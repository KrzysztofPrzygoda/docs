#!/bin/bash

# Build and install tmux from GitHub repository
# For Debian/Ubuntu distribution.
# Reference: https://github.com/tmux/tmux/wiki/Installing

# Check out releases at https://github.com/tmux/tmux/releases
# and paste version number of your choice:
TMUX_VERSION=3.1b
# Default building tmux directory is /usr/local
TMUX_DIR=/usr/local
# TMUX_DIR=/usr

# Final binary will be placed in $TMUX_DIR/bin/tmux
echo "Installing tmux $TMUX_VERSION in $TMUX_DIR/bin/ \n"

# Stop tmux if running
sudo tmux kill-server
# Remove current packaged tmux installed from repository
sudo apt -y remove tmux

# Install required components

# Update repository information
sudo apt update
# Install download tools
sudo apt -y install curl tar
# Install compilation tools
sudo apt -y install build-essential
# Install tmux dependencies
sudo apt -y install libevent-dev libncurses-dev

# Get source archive
curl -fsSOL https://github.com/tmux/tmux/releases/download/$TMUX_VERSION/tmux-$TMUX_VERSION.tar.gz

# Unpack and remove archive file
tar xf tmux-$TMUX_VERSION.tar.gz
rm -f tmux-$TMUX_VERSION.tar.gz

# Compile source
cd tmux-$TMUX_VERSION
# If you omit --prefix then default dir /usr/local will be taken
./configure --prefix=$TMUX_DIR
echo "\nCompilation in progress...\n"
make --silent
# Install compiled binaries
sudo make --silent install

# Cleanup

# Get back to previous (initial) working directory
cd -
# Delete old source and move new one to $TMUX_PATH/src
sudo rm -rf $TMUX_DIR/src/tmux-*
sudo mv tmux-$TMUX_VERSION $TMUX_DIR/src

# Check current tmux version
echo "\nAll done...\n"
echo $(tmux -V) is installed in $(which tmux)

# Uninstallation

# Go to tmux source folder
# cd $TMUX_DIR/src/tmux-$TMUX_VERSION
# Ask for uninstallation
# sudo make uninstall

# As of tmux 3.1b you'll get info how to uninstall like:
# ( cd '/usr/local/bin' && rm -f tmux )
# So, it boils down to:

# Remove binary
# sudo rm -f $TMUX_DIR/bin/tmux
# Remove source
# sudo rm -fr $TMUX_DIR/src/tmux-$TMUX_VERSION

# That's it.
