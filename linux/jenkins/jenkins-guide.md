# Jenkins Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference
- [Jenkins Documentation](https://www.jenkins.io/doc/)

## Installation
Follow [Jenkins Installation Guide](https://www.jenkins.io/doc/book/installing/linux/).

For **CentOS** you may use ready script [`jenkins-install-centos.sh`](jenkins-install-centos.sh) and:
```bash
$ sudo bash jenkins-install-centos.sh
```

## Configuration

### Locale
To change language you need to install **Locale** plugin:

1. *Manage Jenkins* > *Manage Plugins* > *Available* > *Search:* **Locale**
2.  Check *Install* > Click *Install without restart*
3. *Manage Jenkins* > *Cinfigure System* > *Locale* > Paste in *Default Language*: `Locale.ENGLISH` > Check *Ignore browser preference and force this language to all users* > *Save*