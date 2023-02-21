# Synology Docker Guide

Author: Krzysztof Przygoda, 2022

## Docker Deamon

To connect container to the docker deamon you need to create symlink that persists after reboot as follows:

1. Create dir `/volume1/docker/var/run/` (I prefer to reflect entire path).
2. Go to `Control Panel` > `Task Scheduler`.
3. Click `Create` > `Scheduled Task` > `User-defined Script`.
4. Select tab `General` > `User:` = `root`.
5. Select tab `Schedule` then:
    - `Date` > `Run on the following days` = `Daily`
    - `Time` > `Frequency:` = `Every hour`.
6. Select tab `Task Settings` > `Run command` > `User-defined script`:

```bash
sudo ln -s /var/run/docker.sock /volume1/docker/var/run/docker.sock
```

or to automatically find volume with `docker` shared folder you may use command:

```bash
find /volume? -maxdepth 1 -name docker -exec sudo ln -s /var/run/docker.sock {}/var/run/docker.sock \;
```

7. Click `OK` and `OK` again on warning.