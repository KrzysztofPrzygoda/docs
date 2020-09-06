#!/bin/bash
#######################################
# Performs Docker cleanings.
# Download:
#   $ wget https://github.com/krzysztofprzygoda/docs/raw/master/.../docker/clean.sh
#   $ curl -fsSOL https://github.com/krzysztofprzygoda/docs/raw/master/.../docker/clean.sh
# Usage:
#   $ bash clean.sh [option]
# Options:
#   info        Show Docker disk usage info.
#   dangling    Removes no name build caches and images (created when you build image with the same name once again).
#   unused      Removes dangling plus stopped containers and unused (not referenced by any containers): networks, build caches and images.
#   all         Wipes completely all docker data out of the disk.
# Author:
#   (c) 2020 Krzysztof Przygoda, MIT License
# Tutorials:
#   https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes
#######################################
# TODO(author): Nothing.

usage="

Usage: bash $0 [option]

Options:
    info        Show Docker disk usage info.
    dangling    Removes no name build caches and images (created when image is built with the same name once again).
    unused      Removes dangling plus stopped containers and unused (not referenced by any containers): networks, build caches and images.
    all         Wipes all existing docker data out of the disk.
"

option=${1?"${usage}"}

echo; echo "Docker disk usage info:"
docker system df
# Show docker disk usage
# if [ "info" = "${option}" ]; then exit; fi
[ "info" = "${option}" ] && exit;

if [ "dangling" = "${option}" ]; then
    # Buld cache
    echo; echo "Removing dangling build cache..."
    docker builder prune -f
    # Remove all dangling build cache.
    
    # Images
    echo; echo "Removing dangling images..."
    docker image prune -f
    # Remove all dangling images.

    # All-in-one
    # docker system prune -f
    # Remove all unused data:
    # - all stopped containers
    # - all networks not used by at least one container
    # - all dangling images
    # - all dangling build cache
fi

if [ "unused" = "${option}" ] || [ "all" = "${option}" ]; then
    # Containers
    echo; echo "Removing stopped containers..."
    docker container prune -f
    # Remove all stopped containers.
    
    # Networks
    echo; echo "Removing unused networks..."
    docker network prune -f
    # Remove all stopped containers.

    # Build cache
    echo; echo "Removing unused build cache..."
    docker builder prune -fa
    # Remove all unused build cache, not just dangling ones.

    # Images
    echo; echo "Removing unused images..."
    docker image prune -fa
    # Remove all unused images, not just dangling ones.

    # All-in-one
    # docker system prune -fa
    # Remove all unused data:
    # - all stopped containers
    # - all networks not used by at least one container
    # - all images without at least one container associated to them
    # - all build cache
fi

if [ "all" = "${option}" ]; then
    # Images
    echo; echo "Removing all images..."
    # docker images -q | xargs docker rmi -f
    # docker rmi -f $(docker images -q)
    # Remove all images

    images=`docker images -q`
    if [ ! -z "${images}" ]; then
        docker rmi -f "${images}"
    else
        echo "No image files found."
    fi
fi
