# Secure SHell (SSH) Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference
- [SSH Academy](https://www.ssh.com/academy/ssh/)
- Gitlab Docs: [GitLab and SSH keys](https://docs.gitlab.com/ee/ssh/)

## General

TODO

## Keys

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
**Passphrase** (if set) will be asked every time private key is used, but you may alleviate this with storing private key in [SSH Agent](#Store-Key-in-SSH-Agent) (described later).

> **Passphrase is strongly recommended**, because it is used to encrypt and decrypt your private key, and this way adding extra protection against unauthorized use if someone gain access to your private key. However, some automation tools may not support passphrase.

To change passphrase later, use:
```bash
$ ssh-keygen -p -f </path/to/ssh_private_key>
# or
$ ssh-keygen -p -f </path/to/ssh_private_key> -P <old_passphrase> -N <new_passphrase>
```

### Secure Keys Location

Private and public keys contain sensitive data. Ensure the permissions on the files to make them readable to you but not accessible to others.

```bash
$ chmod go-w ~/
# Deny all, except the owner, to write in home directory.
$ chmod 700 ~/.ssh
# Reading, login and writes are available only for the owner with .ssh settings.
$ chmod 600 ~/.ssh/authorized_keys
# Only the owner can read and save changes to file ~/.ssh/authorized_keys.
```

### Copy Keys

#### Copy Key to Clipboard

```bash
$ tr -d '\n' < ~/.ssh/id_ed25519.pub | pbcopy
# macOS

$ xclip -sel clip < ~/.ssh/id_ed25519.pub
# Linux (requires the xclip package)

$ cat ~/.ssh/id_ed25519.pub | clip
# Git Bash on Windows
```
#### Copy Key to Server

To use public key authentication, the public key must be copied to a server and installed in an `authorized_keys` file. This can be conveniently done using the `ssh-copy-id` tool ike this:

```bash
$ ssh-copy-id -i ~/.ssh/<public-key-file> <user>@<host>
# Copy the Public Key to the Server.

> type ~\.ssh\<public-key-file> | ssh <user>@<host> "cat >> ~/.ssh/authorized_keys"
# Windows 10 PowerShell version.
```

#### Store Key in SSH Agent

To avoid re-enter passphrase at every private key use, most SSH implementations will use an *agent*, which keeps your decrypted key in memory. This means you’ll only need to unlock it once, and it will persist until you restart, letting you log into your servers securely without a passphrase prompt.

```bash
$ ssh-add ~/.ssh/<private-key-file>
# [Linux] Add private key to SSH Agent.
$ ssh-add -K ~/.ssh/<private-key-file>
# [macOS] Add private key to the macOS Keychain (-K option).
```

## Config

### Config SSH Client

```bash
$ nano ~/.ssh/config
# Edit SSH client configuration.
```

#### Example 1

```bash
# GitLab.com
Host gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<private-key-file-1>

# Private GitLab instance
Host gitlab.company.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<private-key-file-2>
```

#### Example 2

Different accounts on a single host:
```bash
# User1 Account Identity
Host gitlab-user1
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<private-key-file-1>

# User2 Account Identity
Host gitlab-user2
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<private-key-file-2>
```
Then:
```bash
$ ssh gitlab-user2
# Login using Host field in config as credentials.
```

#### Example 3

**SSH Agent Forwarding** allows to use SSH authentication when you don’t want put your private keys on remote server that connects to the other one, but only on your machine.

For example, imagine you’re connecting to a remote server, and you want to `git pull` some code there that you’re storing on GitHub:

`Local Machine (priv key) > Remote Server (pub key) > GitHub Server (pub key)`  

You can open your `Local Machine` SSH agent to the `Remote Server`, allowing it to act as you, while you’re connected to it. This doesn’t send your private keys over the internet, not even while they’re encrypted; it just lets a `Remote Server` access your `Local Machine` SSH agent, verify your identity and pass the result to the `GitHub Server`.

Usually `Remote Server` would consult its own private key file to answer, but instead it will forward the question to your `Local Machine`.

On *macOS* and *Linux*, SSH agent forwarding is built into `ssh`, and the `ssh-agent` process is launched automatically.
So, all you need to do is 1) [add private key to SSH Agent](#Store-Key-in-SSH-Agent) and 2) setup forwarding in `~/.ssh/config`:

```bash
Host <remote-server>
    Hostname <IP-or-FQDN>
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/<private-key-file>
    ForwardAgent yes
```

### Config SSH Server

```bash
$ sudo nano /etc/ssh/sshd_config
# Edit the SSH daemon (sshd) configuration file.
```
Example `sshd` settings to turn off password authentication:
```bash
PubkeyAuthentication yes
# Set yes to enable public key authentication.

PasswordAuthentication no
# Set no to disable clear text password.
```
```bash
$ sudo systemctl restart sshd
# Restart SSH Server daemon.
```
## Connect

```bash
$ ssh -T <user>@<host>
# Test connection without pseudo-terminal allocation.
$ ssh -Tvvv <user>@<host>
# Test in verbose mode.
```
