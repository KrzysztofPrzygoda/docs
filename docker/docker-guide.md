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
# Open terminal in the running container.
$ sudo docker exec -it <container-name> <command>
# Run command in the running container.

$ docker logs [options] <container-name>
# Show container log.

$ sudo docker cp [options] <container-name>:<src-path> <dest-path>
# Copy container contents to the host.
$ sudo docker cp [options] <container-name>:<src-path> - > contents.tar
# Copy container contents to the uncompressed tar archive.
$ sudo docker cp [options] <src-path> <container-name>:<dest-path>
# Copy files to the container.
```