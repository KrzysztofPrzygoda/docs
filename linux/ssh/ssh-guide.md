# Secure SHell (SSH) Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference
- Gitlab Docs: [GitLab and SSH keys](https://docs.gitlab.com/ee/ssh/)

## General

## SSH Keys

### View Keys
Before you create a key pair, check if a key pair already exists in your user home directory (it's defuult location):

OS | Home
--- | ---
**Linux** | `/home/<username>/.ssh/`
**macOS** | `/Users/<username>/.ssh/`
**Windows 10** | `C:\Users\<username>\.ssh\`

To get there you may:
```bash
$ ls -l ~/.ssh
# List .ssh dir contents in home dir (tilde sign ~ means user home dir).
```
or
```bash
$ cd
# Bare cd takes you to your home dir.
$ ls -l .ssh
# List .ssh dir contents
```
See if a file with one of the following formats exists:
Algorithm | Public Key | Private Key
--- | --- | ---
**ED25519** (preferred) | `id_ed25519.pub` | `id_ed25519`
**RSA** (at least 2048-bit key size) | `id_rsa.pub` | `id_rsa`
**DSA** (deprecated) | `id_dsa.pub` | `id_dsa`
**ECDSA** (deprecated) | `id_ecdsa.pub` | `id_ecdsa`

### Create Keys

> NOTE:
Private and public keys contain sensitive data. Ensure the permissions
on the files make them readable to you but not accessible to others.

```bash
$ ssh-keygen -t ed25519 -C "<comment>"
# or
$ ssh-keygen -t rsa -b 2048 -C "<comment>"
# Comment is included in the .pub file. You may want to use an email address for the comment.
$ ssh-keygen -f </path/to/ssh_key> -t rsa -b 2048 -C "<comment>"
# To specify key filename.

Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/user/.ssh/id_ed25519):
# Press Enter if you don't want to change key-pair filename.

Enter passphrase (empty for no passphrase):
Enter same passphrase again:
# Press Enter if you don't want to set extra password.
```
To change passphrase later use:
```bash
$ ssh-keygen -p -f </path/to/ssh_key>
# or
$ ssh-keygen -p -f </path/to/ssh_key> -N <new_passphrase> -P <old_passphrase>
```
### Copy Keys

#### Copy to Clipboard

```bash
$ tr -d '\n' < ~/.ssh/id_ed25519.pub | pbcopy
# macOS

$ xclip -sel clip < ~/.ssh/id_ed25519.pub
# Linux (requires the xclip package)

$ cat ~/.ssh/id_ed25519.pub | clip
# Git Bash on Windows
```
#### Copy to Server

To use public key authentication, the public key must be copied to a server and installed in an `authorized_keys` file. This can be conveniently done using the `ssh-copy-id` tool ike this:

```bash
$ ssh-copy-id -i ~/.ssh/<public-key-file> <user>@<host>
# Copy the Public Key to the Server.
```
### Config

Save these settings in the `~/.ssh/config` file:
```
# GitLab.com
Host gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<private-key-file>

# Private GitLab instance
Host gitlab.company.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/example_com_rsa
```
To use different accounts on a single host:
```
# User1 Account Identity
Host <user_1.gitlab.com>
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<example_ssh_key1>

# User2 Account Identity
Host <user_2.gitlab.com>
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<example_ssh_key2>
```
## Connect

### Test

```bash
$ ssh -T <user>@<host>
# Test connection without pseudo-terminal allocation.
$ ssh -Tvvv <user>@<host>
# Test in verbose mode.
```
