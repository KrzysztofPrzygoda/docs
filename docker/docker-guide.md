# Docker Guide
Author: Krzysztof Przygoda, 2022

## Refernece

- Docker [docs](https://docs-stage.docker.com/reference/)

## Shorts

```bash
$ sudo docker ps
$ sudo docker container ls
# List existing containers.

$ sudo docker exec -it <container-name> /bin/bash
# SSH into container.

$ docker-compose run <container-name> <command>
$ docker-compose run <container-yml-file> sh -c '<command-1> && <command-2> && <command-3>'
# Run command in a container.

$ sudo docker cp [options] <container-name>:<src-path> <dest-path>
# Copy container contents to the host.
$ sudo docker cp [options] <src-path> <container-name>:<dest-path>
# Copy files to the container
$ sudo docker cp [options] <container-name>:<src-path> - > contents.tar
# Copy container contents to the uncompressed tar archive.
```