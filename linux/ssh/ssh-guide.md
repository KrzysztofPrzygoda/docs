# Secure SHell (SSH) Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021-2022.

## Reference

- SSH manual: `man ssh`.
- [SSH Academy](https://www.ssh.com/academy/ssh/)
- Gitlab Docs: [GitLab and SSH keys](https://docs.gitlab.com/ee/ssh/)
- Digital Ocean: [How To Configure Custom Connection Options for your SSH Client?](https://www.digitalocean.com/community/tutorials/how-to-configure-custom-connection-options-for-your-ssh-client)
- Digital Ocean: [How To Use SSHFS to Mount Remote File Systems Over SSH?](https://www.digitalocean.com/community/tutorials/how-to-use-sshfs-to-mount-remote-file-systems-over-ssh)

Some SSH cheat sheets:
- https://www.marcobehler.com/guides/ssh-cheat-sheet


## General

@todo

## Shorts

The most popular operations cheat sheet.

### Create keys

```bash
$ ssh-keygen -t ed25519
# (preferred algorithm) or
$ ssh-keygen -t rsa
# Generate key pair files in ~/.ssh/ (i.e. private id_rsa and public id_rsa.pub).
# Skip filename and passphrase with Enter for defaults.
```

### Deploy keys

```bash
$ ssh-copy-id -i ~/.ssh/id_ed25519.pub <user>@<host>
# or
$ ssh-copy-id -i ~/.ssh/id_rsa.pub <user>@<host>
# Copy the Public Key to the remote Server ~/.ssh/authorized_keys file.
# Provide SSH <user> password while asked for.

# Somewhat similar to:
$ cat ~/.ssh/id_rsa.pub | ssh <user>@<host> "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
# but more secure, duplicates proof and having several extra automations.
```

### Login with key

```bash
$ nano ~/.ssh/config
# Add the following connection config:
Host myserver
    Hostname <hostname>
    User <username>
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/<private-key>
# Matchess `myserver` and connects to hostname (host address) authenticating with private-key.

# Usage:
$ ssh myserver
# Equivalent to:
$ ssh -i ~/.ssh/<private-key> <username>@<hostname>
```

## Files

These are the most popular SSH files. For more locations go to SSH manual (`man ssh`).

### User Files

Location | Description
---|---
`~/.ssh/` | This directory is the default location for all user-specific configuration and authentication information.  There is no general requirement to keep the entire contents of this directory secret, but the recommended permissions are read/write/execute for the user, and not accessible by others.
`~/.ssh/authorized_keys` | Lists the public keys (DSA, ECDSA, Ed25519, RSA) that can be used for logging in as this user.  The format of this file is described in the sshd(8) manual page.  This file is not highly sensitive, but the recommended permissions are read/write for the user, and not accessible by others.
`~/.ssh/config` |  This is the per-user configuration file.  The file format and configuration options are described in ssh_config(5).  Because of the potential for abuse, this file must have strict permissions: read/write for the user, and not writable by others.  It may be group-writable provided that the group in question contains only the user.
`~/.ssh/id_<algorithm>` | Contains the private key for authentication.  These files contain sensitive data and should be readable by the user but not accessible by others (read/write/execute). `ssh` will simply ignore a private key file if it is accessible by others.  It is possible to specify a passphrase when generating the key which will be used to encrypt the sensitive part of this file using AES-128.
`~/.ssh/id_<algorithm>.pub` | Contains the public key for authentication.  These files are not sensitive and can (but need not) be readable by anyone.
`~/.ssh/known_hosts` |  Contains a list of host keys for all hosts the user has logged into that are not already in the systemwide list of known host keys.  See sshd(8) for further details of the format of this file.
`~/.ssh/rc` | Commands in this file are executed by ssh when the user logs in, just before the user's shell (or command) is started.  See the sshd(8) manual page for more information.

### System-wide Files

Location | Description
---|---
`/etc/ssh/ssh_config` | Systemwide configuration file.  The file format and configuration options are described in ssh_config(5).
`/etc/ssh/ssh_host_key` <br /> `/etc/ssh/ssh_host_<algorithm>_key` | These files contain the private parts of the host keys and are used for host-based authentication.
`/etc/ssh/ssh_known_hosts` | Systemwide list of known host keys.  This file should be prepared by the system administrator to contain the public host keys of all machines in the organization. It should be world-readable.  See sshd(8) for further details of the format of this file.
`/etc/ssh/sshrc` | Commands in this file are executed by ssh when the user logs in, just before the user's shell (or command) is started.  See the sshd(8) manual page for more information.

## Keys

### View Keys
Before you create a key pair, check if a key pair already exists in your user home directory (it's defuult location):

OS             | Home
-------------- | ---------------------------
**Linux**      | `/home/<username>/.ssh/`
**macOS**      | `/Users/<username>/.ssh/`
**Windows 10** | `C:\Users\<username>\.ssh\`

To get there you may:

```bash
$ ls -l ~/.ssh
# List .ssh dir contents in home dir (tilde sign ~ means user home dir).
```

See if a file with one of the following formats exists:

Algorithm                            | Public Key       | Private Key
------------------------------------ | ---------------- | ------------  
**ED25519** (preferred)              | `id_ed25519.pub` | `id_ed25519`
**RSA** (at least 2048-bit key size) | `id_rsa.pub`     | `id_rsa`
**DSA** (deprecated)                 | `id_dsa.pub`     | `id_dsa`
**ECDSA** (deprecated)               | `id_ecdsa.pub`   | `id_ecdsa`

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

Linux:

```bash
$ chmod go-w ~/
# Deny all, except the owner, to write in home directory.
$ chmod 700 ~/.ssh
# Reading, login and writes are available only for the owner with .ssh settings.
$ chmod 600 ~/.ssh/authorized_keys
# Only the owner can read and save changes to file ~/.ssh/authorized_keys.
```

Windows PowerShell:

```bash
$path = ".\path\to\private-key-file"
icacls.exe $path /reset
# Reset to remove explict permissions.
icacls.exe $path /GRANT:R "$($env:USERNAME):(R)"
# Give current user explicit read-permission.
icacls.exe $path /inheritance:r
# Disable inheritance and remove inherited permissions.
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

To use public key authentication, the public key must be copied to a server and installed in an `authorized_keys` file.

```bash
$ cat <public-key-file> >> ~/.ssh/authorized_keys
# Copy locally the Public Key.
```

This can be conveniently done using the `ssh-copy-id` tool ike this:

```bash
$ ssh-copy-id -i ~/.ssh/<public-key-file> <user>@<host>
# Copy the Public Key to the remote Server.

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

#### Host vs Hostname

See `man 5 ssh_config` for more info:

- `Hostname` is the real host name to log into (IP or FQDN) and it's optional.
- `Host` is a pattern that matches one of many different configs and is provided as an argument in `ssh <host>` command. Plays the role of `Hostname` param when it hasn't been provided.

```bash
Host <pattern>
    Hostname <IP-or-FQDN>
```

```bash
Host dev
    Hostname <hostname>
    User <username>
    PreferredAuthentications publickey
    IdentityFile /path/to/<private-key>
# Matchess dev and connects to hostname authenticating with private-key.

# Usage:
$ ssh dev
# Equivalent to:
$ ssh -i /path/to/<private-key> <username>@<hostname>
```

```bash
Host github.com
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/<private-key>
# No Hostname provided.
# Matchess github.com and authenticates with private-key.

# Usage:
$ ssh <username>@github.com
```

If the hostname contains the character sequence `%h`, then this will be replaced with the host name specified on the command line (this is useful for manipulating unqualified names):

```bash
Host dev*
    Hostname %h.gitlab.com
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/<private-key>
# Matchess dev and connect to dev.github.com, authenticating with private-key.

# Usage:
$ ssh <username>@dev-new
# Equivalent to:
$ ssh -i ~/.ssh/<private-key> <username>@dev-new.gitlab.com
```

#### Example: Wildcard

```bash
Host *
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/<private-key>
# Matchess all hosts and authenticates with private-key.
```

```bash
Host *
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/<private-key-1>
    IdentityFile ~/.ssh/<private-key-2>
# Matchess all hosts and autenticates using:
# private-key-1 at first,
# private-key-2 if first have failed.
```

```bash
Host * !github.com
# Matchess all hosts except github.com.
```

```bash
Host hapollo
    HostName example.com
    Port 4567

Host wapollo
    HostName company.com

Host *apollo
    User apollo

Host *
    User zeus

# Any connection not ending in apollo (and without its own Host section defining a User) will receive the username zeus.
```

Note that we have retained the ordering from most specific to least specific in our file. It is best to think of less specific Host sections as fallbacks as opposed to defaults due to the order in which the file is interpreted.

#### Example: Two hosts

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

#### Example: Two accounts on single host

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

# Usage:
$ ssh gitlab-user2
# Login using Host field in config as credentials.
```

```bash
# User1 Account Identity
Host github-work.com
    Hostname github.com
    IdentityFile ~/.ssh/<private-key-file-work>

# User2 Account Identity
Host github-personal.com
    Hostname github.com
    IdentityFile ~/.ssh/<private-key-file-personal>

# Usage:
$ git clone git@github-work.com:<user>/<repo>.git
$ git clone git@github-personal.com:<user>/<repo>.git
# Login github.com with SSH key using Host field in config as credentials.
```

#### Example: Agent Forwarding

**SSH Agent Forwarding** allows to use SSH authentication when you don’t want put your private keys on remote server that connects to the other one, but only on your machine.

For example, imagine you’re connecting to a remote server, and you want to `git pull` or `git clone` some code there that you’re storing on GitHub:

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

#### Example: Connection Forwarding

One common use of SSH is forwarding connections, either allowing a local connection to tunnel through the remote host, or allowing the remote machine access to tunnel through the local machine. SSH can also do dynamic forwarding using protocols like SOCKS5 which include the forwarding information for the remote host.

The options that control this behavior are:

- `LocalForward`: This option is used to specify a connection that will forward a local port’s traffic to the remote machine, tunneling it out into the remote network. The first argument should be the local port you wish to direct traffic to and the second argument should be the address and port that you wish to direct that traffic to on the remote end.
- `RemoteForward`: This option is used to define a remote port where traffic can be directed to in order to tunnel out of the local machine. The first argument should be the remote port where traffic will be directed on the remote system. The second argument should be the address and port to point the traffic to when it arrives on the local system.
- `DynamicForward`: This is used to configure a local port that can be used with a dynamic forwarding protocol like SOCKS5. Traffic using the dynamic forwarding protocol can then be directed at this port on the local machine and on the remote end, it will be routed according to the included values.

```bash
# This will allow us to use port 8080 on the local machine
# in order to access example.com at port 80 from the remote machine
Host local_to_remote
    LocalForward 8080 example.com:80

# This will allow us to offer access to internal.com at port 443
# to the remote machine through port 7777 on the other side
Host remote_to_local
    RemoteForward 7777 internal.com:443
```

CLI equivalent of SSH tunnel (forwarding):

```bash
$ ssh <user>@<jump-host> -N -f -L <local-port>:<target-host>:<target-port>
```

You may use it if you want to connect to a server (`<target-host>`) that is hidden from the outside world, but accessible from a box (`<jump-host>`) you have SSH access to. Like an Amazon RDS database, which is only reachable from inside an AWS network:

```bash
# The following command establishes an SSH tunnel between local machine (@port 3307) and an RDS database (@port 3306), via an EC2 jump host (18.11.11.11).
$ ssh ec2-user@18.11.11.11 -N -f -L 3307:somehost.12345.eu-central-1.rds.amazonaws.com:3306

# You could now, for example, use the mysql client to connect to localhost:3307, which will be transparently tunneled to RDS for you.
$ mysql -h localhost -P 3307
```

Note: A lot of tools/IDEs like [IntelliJ IDEA](https://www.jetbrains.com/idea/), support opening up SSH tunnels by just clicking a checkbox in the UI

#### Example: Multiple Connections

SSH has the ability to use a single TCP connection for multiple SSH connections to the same host machine. This can be useful if it takes awhile to establish a TCP handshake to the remote end as it removes this overhead from additional SSH connections.

The following options can be used to configure multiplexing with SSH:

- `ControlMaster`: This option tells SSH whether to allow multiplexing when possible. Generally, if you wish to use this option, you should set it to “auto” in either the host section that is slow to connect or in the generic `Host *` section.
- `ControlPath`: This option is used to specify the socket file that is used to control the connections. It should be to a location on the filesystem. Generally, this is given using SSH variables to easily label the socket by host. To name the socket based on username, remote host, and port, you can use `/path/to/socket/%r@%h:%p`.
- `ControlPersist`: This option establishes the amount of time in seconds that the TCP connection should remain open after the final SSH connection has been closed. Setting this to a high number will allow you to open new connections after closing the first, but you can usually set this to something low like “1” to avoid keeping an unused TCP connection open.

Generally, you can set this up using a section that looks something like this:

```bash
Host *
    ControlMaster auto
    ControlPath ~/.ssh/multiplex/%r@%h:%p
    ControlPersist 1
```

Afterwards, you should make sure that the directory is created:

```bash
$ mkdir -p ~/.ssh/multiplex
```

If you wish to not use multiplexing for a specific connection, you can select no multiplexing on the command line like this:

```bash
ssh -S none <user>@<host>
```

#### Example: General Tweaks

Some other tweaks that you may wish to configure on a broad level, perhaps in the `Host *` section, are below.

- `ServerAliveInterval`: This option can be configured to let SSH know when to send a packet to test for a response from the sever. This can be useful if your connection is unreliable and you want to know if it is still available.
- `LogLevel`: This configures the level of detail in which SSH will log on the client-side. This can be used for turning off logging in certain situations or increasing the verbosity when trying to debug. From least to most verbose, the levels are QUIET, FATAL, ERROR, INFO, VERBOSE, DEBUG1, DEBUG2, and DEBUG3.
- `StrictHostKeyChecking`: This option configures whether ssh SSH will ever automatically add hosts to the ~/.ssh/known_hosts file. By default, this will be set to “ask” meaning that it will warn you if the Host Key received from the remote server does not match the one found in the known_hosts file. If you are constantly connecting to a large number of ephemeral hosts, you may want to turn this to “no”. SSH will then automatically add any hosts to the file. This can have security implications, so think carefully before enabling it.
- `UserKnownHostsFile`: This option specifies the location where SSH will store the information about hosts it has connected to. Usually you do not have to worry about this setting, but you may wish to set this to /dev/null if you have turned off strict host checking above.
- `VisualHostKey`: This option can tell SSH to display an ASCII representation of the remote host’s key upon connection. Turning this on can be an easy way to get familiar with your host’s key, allowing you to easily recognize it if you have to connect from a different computer sometime in the future.
- `Compression`: Turning compression on can be helpful for very slow connections. Most users will not need this.
With the above configuration items in mind, we could make a number of useful configuration tweaks.

With the above configuration items in mind, we could make a number of useful configuration tweaks. For instance, if we are creating and destroying hosts very quickly at a cloud provider, something like this may be useful:

```bash
Host home
    VisualHostKey yes

Host cloud*
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel QUIET

Host *
    StrictHostKeyChecking ask
    UserKnownHostsFile ~/.ssh/known_hosts
    LogLevel INFO
    ServerAliveInterval 120
```

This will turn on your visual host key for your home connection, allowing you to become familiar with it so you can recognize if it changes or when connecting from a different machine. We have also set up any host that begins with cloud* to not check hosts and not log failures. For other hosts, we have sane fallback values.

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

### Git

```bash
$ git config --global core.sshcommand "C:/Windows/System32/OpenSSH/ssh.exe"
# Make Git use Window’s OpenSSH (and not the one it bundles).
```

## Copy Files

OpenSSH secure file copy `scp` copies files between hosts on a network.
It uses `ssh(1)` for data transfer, and uses the same authentication and provides the same security as a login session.

```bash
$ scp <local-file> [<user>@]<host>:[/<dir>]
# or with URI form
$ scp <local-file> scp://[<user>@]host[:<port>][/<dir>]
# Upload a file to a remote server dir.

$ scp -rp <local-dir> <user>@<host>:/<dir>
# Recursively upload a local dir to a remote server dir.

$ scp <user>@<host>:/<dir>/<file> <local-dir>
# Download a file from a remote server.

$ scp -rp <user>@<host>:/<dir> <local-dir>
# Recursively download a remote server dir.
```

> Hint: When doing things recursively via SCP, you might want to consider rsync, which also runs over SSH and has [a couple of advantages over SCP](https://serverfault.com/a/264606).

## Exit Session

```bash
$ exit

# To kill an unresponsive SSH session, hit subsequently:
Enter ~ .
```

## Security

### One vs Multiple SSH key-pairs

Is it reasonable to have multiple SSH keys?

Ultimately this is up to you. You need to evaluate your threat model:

- How likely is it that one of your keys is compromised?
- If one key is compromised, how likely is it that the other keys will be compromised? Especially, if all of them are used from the same machine and are located in the same `~/.ssh` path.
- What are the consequences of your keys being compromised?
- What is the cost (including time) of managing multiple keys?

Considering factors such as these should help you decide if you really need separate keys.

### Connvenience vs Security Perspective

In general situation, if we have to trade off with security and convenience at the same time, we can multiply the two scores, and maybe One SSH key-pair (WITH passwd) is the good one to choose.

Convenient  Security  Ways to go
    5           1      One   SSH key-pair  (NO passwd)
    4           2      One   SSH key-pair  (WITH passwd)
    3           1      Multi SSH key-pairs (NO passwd)
    2           2      Multi SSH key-pairs (WITH passwd) (SAME passwd)
    1           3      Multi SSH key-pairs (WITH passwd) (DIFF passwds)

### Password Managers & SSH Agents

Password Managers like [1Password](https://developer.1password.com/docs/ssh/agent/) or [Keepass](https://lechnology.com/software/keeagent/) can not only store your SSH keys, but they also come with their own ssh-agent, replacing your system’s ssh-agent.

This means, whenever you unlock your password manager on any machine that you have it installed on, you’ll have all your SSH identities instantly available.

## Mount Remote Filesystem

Transferring files over an SSH connection, by using either SFTP or SCP, is a popular method of moving small amounts of data between servers. In some cases, however, it may be necessary to share entire directories, or entire filesystems, between two remote environments. While this can be accomplished by configuring an SMB or NFS mount, both of these require additional dependencies and can introduce security concerns or other overhead.

As an alternative, you can install SSHFS to mount a remote directory by using SSH alone. This has the significant advantage of requiring no additional configuration, and inheriting permissions from the SSH user on the remote system. SSHFS is particularly useful when you need to read from a large set of files interactively on an individual basis.

### Install SSHFS

```bash
$ sudo apt update
$ sudo apt install sshfs
# Install SSHFS on Linux/Debian.

https://osxfuse.github.io/
# Install SSHFS on macOS.

https://github.com/winfsp/sshfs-win
# Install SSHFS on Windows.
```

### Mount

> **Note:** If you use `sudo sshfs` then SSH config and key-pair are taken from the `root` user account, not your own (compare `whoami` vs `sudo whoami` to find that out). If you need to mount a remote directory using SSHFS without requiring `sudo` permissions, you can create a user group called `fuse` on your local machine, by using `sudo groupadd fuse`, and then adding your local user to that group, by using `sudo usermod -a -G fuse <user>`.

```bash
$ sshfs [<user>@]<host>:[<dir>] <local-dir> [<options>]
$ sshfs <host-pattern>:[<dir>] <local-dir> [<options>]
# Mount remote host <dir> to <local-dir> mount point.
# Use SSH config with <host-pattern>.

$ sshfs [<user>@]<host>:~/ <local-dir> -o allow_other,default_permissions,direct_io,reconnect,volname=<volume-name>
# Mount remote host user home folder to <local-dir> mount point with options as follows:
# -o     precedes miscellaneous mount options (this is the same as when running the mount command normally
#        for non-SSH disk mounts). In this case, you are using:
# allow_other
#        to allow other users to have access to this mount (so that it behaves like
#        a normal disk mount, as sshfs prevents this by default), and
# default_permissions
#        so that it otherwise uses regular filesystem permissions.
```

An example:

```bash
$ mkdir -p ~/Mounts/bitsmodo.com
# Create mount point in user folder.

$ sshfs bitsmodo:/home/klient.dhosting.pl/bitsmodo ~/Mounts/bitsmodo.com -o allow_other,default_permissions,direct_io,reconnect,volname=bitsmodo.com
# Mount using ssh config Host pattern.

$ sshfs bitsmodo:/home/klient.dhosting.pl/bitsmodo ~/Mounts/bitsmodo.com -o allow_other,default_permissions,direct_io,reconnect,volname=bitsmodo.com,password_stdin <<< 'password'
# Mount with password
```

> **Note:** On Windows, remote filesystems are sometimes mounted with their own drive letter like `G:`, and on Mac, they are usually mounted in the `/Volumes` directory.

> **Note:** If you receive a `Connection reset by peer` message, make sure that you have copied your public SSH key to the remote system.

> **Note:** If you need to mount a remote directory using SSHFS without requiring `sudo` permissions, you can create a user group called `fuse` on your local machine, by using `sudo groupadd fuse`, and then adding your local user to that group, by using `sudo usermod -a -G fuse <user>`.

Example script to connect sftp with `sshfs` and `ssh` password using `expect`:

```bash
#!/bin/bash
expect <<END
spawn sshfs <user>@<host>:<remote-dir> <local-dir> -p 22 -o password_stdin
send "password\r"
expect eof
END
```

### Unmount

```bash
$ unmount <local-dir>
# Unmount on Linux while error (mount_macfuse: mount point <local-dir> is itself on a macFUSE volume).

$ diskutil unmount <local-dir>
# Unmount on macOS.
# Alternatively, click Eject in Finder.
```

### Permanent Mount

#### Linux `fstab`

```bash
$ sudo nano /etc/fstab

# Add this line at the end of 
<user>@<host>:<dir> <local-dir> fuse.sshfs noauto,x-systemd.automount,_netdev,reconnect,identityfile=/home/<user>/.ssh/<private-key>,allow_other,default_permissions,volname=<volume-name> 0 0

# Mount remote host permanently with options:
# fuse.sshfs
#        specifies the driver being used to mount this remote directory.
# noauto,x-systemd.automount,_netdev,reconnect
#        are a set of options that work together to ensure that permanent mounts to network drives
#        behave gracefully in case the network connection drops from the local machine
#        or the remote machine.
# 0 0    signifies that the remote filesystem should never be dumped or validated by
#        the local machine in case of errors. These options may be different
#        when mounting a local disk.
```

#### macOS `launchd`

Follow Apple [Terminal User Guide / launchd](https://support.apple.com/guide/terminal/script-management-with-launchd-apdc6c1077b-5d5d-4d35-9c19-60f2397b2369/mac) and [Creating Launch Daemons and Agents](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html) developer documentation archive.

In most cases, this is the way to go (file naming is an example):

1. Create a `com.bitsmodo.MountSSHFS.plist` file (contents below).
2. Place in `~/Library/LaunchAgents`.
3. Log in or run manually via `launchctl load com.bitsmodo.MountSSHFS.plist`.
4. Open `System Settings.app` > `General` > `Login Items` > Find your service under `Allow in the Background` and turn it `On`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.bitsmodo.MountSSHFS</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/local/bin/sshfs</string>
		<string>bitsmodo:/home/klient.dhosting.pl/bitsmodo ~/Mounts/bitsmodo.com -o allow_other,default_permissions,direct_io,reconnect,volname=bitsmodo.com</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
</dict>
</plist>
```

```bash
$ tail /var/log/system.log
# Look for any error messages.
```

#### macOS `Automator.app`

Create an app that can be run via System Settings > Login Items for specific user.

1. Open `Automator.app` > Choose `Workflow` > Add `Run Shell Script` action to the workflow.
2. Paste your command (requires full path to `sshfs` that can be found with `command -v sshfs`):

    ```bash
    REMOTE_DIR="bitsmodo:/home/klient.dhosting.pl/bitsmodo"
    LOCAL_DIR="~/Mounts/bitsmodo.com"
    VOLUME_NAME="bitsmodo.com"
    
    diskutil unmount ${LOCAL_DIR}
    mkdir -p ~/${LOCAL_DIR}

    /usr/local/bin/sshfs ${REMOTE_DIR} ${LOCAL_DIR} -o allow_other,default_permissions,direct_io,reconnect,volname=${VOLUME_NAME}
    ```

    If you need sudo privilages add option: `-o sftp_server="sudo /usr/lib/openssh/sftp-server"` (note that your Linux distro may require diffent path). Full option argument then:

    ```bash
    /usr/local/bin/sshfs ${REMOTE_DIR} ${LOCAL_DIR} -o allow_other,default_permissions,direct_io,reconnect,sftp_server="sudo /usr/lib/openssh/sftp-server",volname=${VOLUME_NAME}
    ```

3. Choose `File` > `Save...` > Set File Format: `Application` > Save As: `Mount bitsmodo.com.app` > `Save`.
4. Open `System Settings.app` > `General` > `Login Items` > Click `+` icon below `Open at Login` table > Choose your app.
