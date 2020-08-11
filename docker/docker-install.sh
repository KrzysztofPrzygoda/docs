#!/bin/bash
#######################################
# Install latest Docker Community Edition (Docker CE).
# Systems:
#   Ubuntu
# Removes:
#   Docker Engine   Deprecated components: docker, docker-engine, docker.io, containerd runc.
# Installs:
#   curl    File transfer package.
# Reference:
#   https://docs.docker.com/engine/install/ubuntu/
#   https://docs.docker.com/compose/install/
#   https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04
# Author:
#   (c) 2020 Krzysztof Przygoda, MIT License
#######################################

# Prepare environment
sudo apt-get update
sudo apt-get install curl -y

# Uninstall old deprecated version
# The Docker Engine package is now called docker-ce.
sudo apt-get remove docker docker-engine docker.io containerd runc

# Uninstall any current version
# Uninstall the Docker Engine, CLI, and Containerd packages
sudo apt-get purge docker-ce docker-ce-cli containerd.io
# Delete all images, containers, and volumes:
sudo rm -rf /var/lib/docker

# Install Docker Engine

# Instant run
curl -fsSL https://get.docker.com | sudo sh
# Download then run
# curl -fsSL https://get.docker.com -o get-docker.sh
# sudo sh get-docker.sh
# Set current user permissions to run docker w/o sudo
sudo usermod -aG docker $(whoami)

# Install Docker Compose

# Using cURL
sudo curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Using Python pip
# sudo pip install docker-compose

# Check installation

# Check Docker Engine
docker info
sudo systemctl status docker

# Check Docker Compose
# docker-compose --version
docker-compose version

# Note: If the command docker-compose fails after installation, check your path.
# You can also create a symbolic link to /usr/bin or any other directory in your path.
# sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
