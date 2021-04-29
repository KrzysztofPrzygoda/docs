#!/bin/bash
#######################################
# Builds and installs tmux from GitHub repository.
# For Debian/Ubuntu distribution.
# Reference:
#   https://github.com/tmux/tmux/wiki/Installing
#   https://github.com/tmux/tmux/releases
# Usage: sudo bash tmux-build.sh [version] [install dir]
#   version        [Optional] GitHub release tag (default 3.1b).
#   install-dir    [Optional] Dir to install tmux to (default /usr/local [bin|src]).
# Removes:
#   tmux    Current packaged version of tmux and source (install-dir/src/tmux-*) if exists.
# Installs:
#   curl                File transfer package.
#   tar                 Tarball archive utility package.
#   build-essentials    Compilation tools package.
#   libevent-dev        [Dependency] Event notification library.
#   libncurses-dev      [Dependency] Updating character screens library.
#   tmux                Terminal multiplexer source (install-dir/src) and binary (install-dir/bin).
# Author:
#   (c) 2020 Krzysztof Przygoda, MIT License
#######################################
# TODO(author): Handle version=latest (requires JSON parsing with jq package).

# Check out releases at https://github.com/tmux/tmux/releases
# and paste default version number of your choice:
TMUX_VERSION=${1:-"3.1b"}
# Default building tmux directory is /usr/local
TMUX_DIR=${2:-"/usr/local"}
# TMUX_DIR=/usr

# Final binary will be placed in $TMUX_DIR/bin/tmux
echo "Installing tmux $TMUX_VERSION in $TMUX_DIR/bin/ \n"

# Install required components

# Determine available package manager
if command -v apt >/dev/null; then
    pm="apt" # Debian
elif command -v apt-get >/dev/null; then
    pm="apt-get" # Older Debian
elif command -v yum >/dev/null; then
    pm="yum" # CentOS
else
    echo "Can't find package manager" && exit 1
fi

# Update repository information
sudo $pm update
# Install download tools
sudo $pm -y install curl tar
# Install compilation tools
if [ "apt" = $pm || "apt-get" = $pm ]; then
    sudo $pm -y install build-essential bison pkg-config
    # Install tmux dependencies
    sudo $pm -y install libevent-dev libncurses-dev
elif [ "yum" = $pm ]; then
    sudo $pm -y install gcc make bison pkg-config
    # Install tmux dependencies
    sudo $pm -y install libevent-devel libncurses-devel
fi

# Get source archive or exit on failure
URL=https://github.com/tmux/tmux/releases/download/$TMUX_VERSION/tmux-$TMUX_VERSION.tar.gz
curl -fsSOL $URL || exit 1

# Ask all currently running tmux servers to quit
sudo kill -SIGTERM $(pidof tmux)
# tmux kill-server
# may not work here because it closes only current user server
# while each user starts its own server
# with its own socket at /tmp/tmux-<uid>/<socket-file>.
# For example, when you sudo to run this script,
# it will be run as root user (uid=0) and you may receive error:
# connecting to /tmp/tmux-0/default (No such file or directory).
# To list all opened tmux sockets use
# sudo lsof -U | grep '^tmux'

# Remove current packaged tmux installed from OS repository
# Turn it off if you want to leave it
sudo $pm -y remove tmux

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

# If it happens you get error "server version is too old for client"
# then an old version server must be running in the background.
# Just kill the server using
# tmux kill-server
# and then start a new session once again.

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
