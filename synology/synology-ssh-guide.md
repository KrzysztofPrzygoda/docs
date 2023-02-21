# Synology SSH Guide

Author: Krzysztof Przygoda, 2022

## Contents <!-- omit from toc -->

- [SSH Key-based Authentication](#ssh-key-based-authentication)
  - [1. Prepare your NAS](#1-prepare-your-nas)
  - [2. Add public key to the NAS](#2-add-public-key-to-the-nas)
  - [3. Add SSH config](#3-add-ssh-config)
  - [4. Login using key](#4-login-using-key)
- [Debug SSH Session](#debug-ssh-session)

## SSH Key-based Authentication

### 1. Prepare your NAS

```bash
$ ssh <user>@<nas>
# Login to your NAS.

$ mkdir -p ~/.ssh
$ chmod 700 ~/.ssh
$ touch ~/.ssh/authorized_keys
# Create dir structure on the NAS for SSH key-based authentication.
```

### 2. Add public key to the NAS

1. Copy contents of your `~/.ssh/id_rsa.pub` to the clipboard. Use terminal command `cat ~/.ssh/id_rsa.pub` to get contents or open the file in any text editor.
2. Open *File Station* > Go to `home/.ssh` folder.
3. Right click on `authorized_keys` file > Choose *Open with Text Editor*.
4. Paste clipboard contents (at the end of file if not empty) > Close *Text Editor* > Click *Save*.

### 3. Add SSH config

Edit `~/.ssh/config` file on your computer with any text editor and add your config.

For example:

```bash
# Synology NAS
Host synology
    HostName <nas>
    User <user>
    Port <nas-ssh-port>
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/id_rsa
```

### 4. Login using key

Now you can login to your Synology NAS wihout any password prompts using simple command:

```bash
$ ssh synology
```

## Debug SSH Session

To debug SSH session you may start temporary (extra) SSH deamon that listens to on temporary port.

For example:

```bash
$ sudo /bin/sshd -d -p 1234
```

Then use port `1234` whenever you want to test your SSH connection and observe `sshd` output.
