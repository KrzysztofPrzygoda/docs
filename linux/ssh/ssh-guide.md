# Secure SHell (SSH) Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference
- SSH manual: `man ssh`.
- [SSH Academy](https://www.ssh.com/academy/ssh/)
- Gitlab Docs: [GitLab and SSH keys](https://docs.gitlab.com/ee/ssh/)
- Digital Ocean: [How To Configure Custom Connection Options for your SSH Client?](https://www.digitalocean.com/community/tutorials/how-to-configure-custom-connection-options-for-your-ssh-client)

## General

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

### Systemwide Files
Location | Description
---|---
`/etc/ssh/ssh_config` | Systemwide configuration file.  The file format and configuration options are described in ssh_config(5).
`/etc/ssh/ssh_host_key` <br /> `/etc/ssh/ssh_host_<algorithm>_key` | These files contain the private parts of the host keys and are used for host-based authentication.
`/etc/ssh/ssh_known_hosts` | Systemwide list of known host keys.  This file should be prepared by the system administrator to contain the public host keys of all machines in the organization. It should be world-readable.  See sshd(8) for further details of the format of this file.
`/etc/ssh/sshrc` | Commands in this file are executed by ssh when the user logs in, just before the user's shell (or command) is started.  See the sshd(8) manual page for more information.
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

#### Host vs Hostname

See `man 5 ssh_config` for more info:
- `Hostname` is the real host name to log into (IP or FQDN) and it's optional.
- `Host` is a pattern that matches different configs and is provided as an argument in `ssh <host>` command.

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

#### Example: Agent Forwarding

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
