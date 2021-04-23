# Linux Guide

## About

It's neither deep-dive nor in-depth document.
This guide is intended to support daily developer tasks and to be as concise as possible without any further ado.

Mainly based on:
- **Bash** (shell for GNU operating systems) and
- **GNU/Linux** distribution systems (Debian, Ubuntu, Mint etc.).

## Table of Contents

- [General](#general)
    - [Command Types](#command-types)
    - [Keys](#keys)
    - [Help](#help)
    - [Debug](#debug)
    - [Execute](#execute)
- [System](#system)
    - [Version](#version)
    - [Kernel](#kernel)
    - [Processes](#processes)
    - [CPU](#cpu)
    - [Memory](#memory)
    - [Drives](#drives)
    - [Drivers](#drivers)
- [Networking](#networking)
- [Secure Shell (SSH)](#secure-shell)
- [Software](#software)
- [Users](#users)
- [User Groups](#user-groups)
- [Files](#files)
- [Scripting](#scripting)
- [Reference](#reference)

## General

### Command Types

There are 4 types of commands utilised in this document.

#### Internal Builtin Commands

[Build-in shell command][Shell Buildins Link] and thus the least expensive in execution.

```bash
$ command -V <command>
# Check if command is built-in or external.
# Use shell internal commands first then use external.
$ command -v <command>
# Show command path (name without a path means builtin).
```

```bash
$ help
$ bash -c help
# List shell builtin commands.
$ help <command>
# Show builtin command help.
```

#### External Commands

```bash
$ man -k
$ info
# List utility commands.
$ man <command>
$ info <command>
# Show command manual.
```

##### Utility

GNU/Linux [Core Utilities](https://en.wikipedia.org/wiki/List_of_GNU_Core_Utilities_commands) library command.

##### Package

Installed via system specific [Package Manager][PM Link]:
- [DEB-based][DEB Link] like [APT (Advanced Package Tool)][APT Link] or
- [RPM-based][RPM Link] like [YUM][YUM Link].

```bash
$ apt show <package>
# Show package details.
```

##### Source

Installed manually by building/compilling from the source.

[Shell Buildins Link]: https://www.gnu.org/software/bash/manual/bash.html#Shell-Builtin-Commands
[PM Link]: https://en.wikipedia.org/wiki/Package_manager
[DEB Link]: https://en.wikipedia.org/wiki/Deb_(file_format)
[APT Link]: https://en.wikipedia.org/wiki/APT_(software)
[RPM Link]: https://en.wikipedia.org/wiki/RPM_Package_Manager
[YUM Link]: https://en.wikipedia.org/wiki/Yum_(software)

### Keys

Action                    | Keys
------------------------- | -----------------
Autocompletion            | <kbd>tab</kbd>
Interrupt (send SIGINT=2) | <kbd>ctrl c</kbd>
Quit (send SIGQUIT=3)     | <kbd>ctrl d</kbd>
Clear Screen              | <kbd>ctrl l</kbd>

### Help

```bash
$ man <command>
# Show command manual.

$ <command> -h|--help
# Show command options (mostly).
```

```bash
$ info sh
$ info bash
# Show shell manual.
$ bash -c "help set"
$ help set
# List shell options.
```

### Debug

https://www.eurovps.com/blog/important-linux-log-files-you-must-be-monitoring/

```bash
$ set -x
# Turn on...
$ set +x
# Turn off each command print-out before its run.
```

### Execute

#### General

```bash
$ <command> [options]
# Run command in the current shell environment (system looks for command in the $PATH).
$ ./<command> [options]
# Run command in the current shell environment (system looks for command in current dir).
$ \<command> [options]
# Backslash bypasses alias definition.
$ <command> [options]; <command> [options]; ...
# Run commands' chain.
```

#### Output Capture

```bash
$ output=`<command> [options]`
# Run command in the current shell (backticks) and store output in the variable.
$ output=$(<command> [options])
# Run command in subshell and store output in the variable.
```

```bash
$ echo $?
# Print last command exit code (0 on success, failure otherwise).
$ result=$?
# Store last command exit code in result variable.
```

#### Conditional Execution

```bash
$ <command1> [options] || <command2> [options]
# Run command1 OR on failure run command2
$ <command1> [options] && <command2> [options]
# Run command1 AND on success run command2
$ <command1> [options] && <command2> [options] || <command3> [options]
# Run command1 AND on success run command2 OR run command3 on failure of command1 OR failure of command2.
$ if <command1> [options]; then <command2> [options] else <command3> [options] fi
# Run command1 AND on success run command2. Otherwise, run command3.
```

#### Alias

```bash
$ alias <alias>='<command> [options]'
$ alias la='ls -la'
# Create/change command alias in the current environment.
$ unalias <alias>
# Remove alias from the current environment.
$ alias <alias>
$ alias la
# Show alias definition.
$ alias -p
# Show all aliases.
```

#### Script

```bash
$ sh <script>
# Run script in subprocess original Bourne Shell.
$ bash <script>
# Run script in subprocess Bourne Again Shell (expanded sh).
$ source <script>
$ . <script>
# Run script in the current shell process.
```

#### As User

```bash
# Run command as another user:
$ su - <user> -c "<command> [options]"
# Needs user password.
$ sudo -u <user> "<command> [options]"
# Needs your password and sudo group membership.
$ runuser -l <user> -c "<command> [options]"
# Needs root account.
```

### Variables

```bash
$ var="value"
# Local variable (available in the current shell only).
$ export var="value"
# Global variable (available in any shell).
$ echo $var
value
# Prints var value
```
```bash
$ var=value
$ echo '${var}'
${var}
# Single quotes preserves value.
$ echo "${var}"
value
# Double quotes expands variables.
```
```bash
$ env
$ printenv
# Print global enironment variables.
$ set
# Print local (current shell) and global enironment variables (incl. functions).
$ sudo sudo -V
# The list of environment variables that sudo clears.
# It is contained in the output of sudo -V when run as root).
```
Some popular environment variables:
```bash
$ echo $PATH
# Show which directories to search for executable files in response to commands issued by a user.
# It increases both the convenience and the safety of such operating systems and is widely considered to be the single most important environmental variable..
$ echo $SHELL
# Show user shell (shell program path).
$ echo $HOME
# Show user home dir path.
```

#### Special Variables

See: [list of reserved variables](https://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html#sect2) (set or used by `sh` and `bash`).  
See: [special parameters](https://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html#sect_03_02_05).  
See: [special parameters and shell variables](https://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables)  

```bash
$0 # Current shell/script/function.
$1…$n # Params.
$# # Number of params.
$* # Params. “$*” expands to one word delimited by the first char in $IFS.
$@	# Params. “$*” expands to separate words like “$1” “$2” etc.
$?	# Exit status of last task.
$!	# PID of of the most recently executed background (asynchronous) command.
$$	# PID of the current shell.
$-	# Options set by set command.
```

TODO: Parameter substitution  
See: [Parameter Substitution](https://tldp.org/LDP/abs/html/parameter-substitution.html)

```bash
$ (set -o posix; set) | less
# List all defined variables and only variables (w/o functions using POSIX mode).

$ (set -o posix; set) >/tmp/variables.before
$ source <script>
$ (set -o posix; set) >/tmp/variables.after
$ diff /tmp/variables.before /tmp/variables.after
$ rm /tmp/variables.before /tmp/variables.after
# Extract variables defined by script.
```

## System

### Version

```bash
$ lsb_release -a
$ lsb_release -sa
# [Package] Show descriptive OS version.
```
```bash
$ uname -s
# Kernel name.
$ uname -r
# Kernel version.
$ uname -o
# Operating system name.
$ uname -m
# Architecture (machine HW name).
$ uname -s -r -m
$ uname -a
# All information
```

### Kernel

```bash
$ dmesg
$ dmesg | less
# Show kernel activities log (a ring buffer).
$ dmesg | grep <pattern>
$ dmesg | grep -i tty
$ dmesg | grep -i sda
$ dmesg | grep -i usb
$ dmesg | grep -i memory
# Search detected device or string pattern.
$ watch "dmesg | tail -20"
# Monitor dmesg in Real Time, watching last 20 lines.
```

### Processes

```bash
$ top
# Display sorted information about processes.
$ top -o %MEM
# Sort by memory
# or via Menu:
# * press SHIFT+F to enter the interactive menu
# * press the UP or DOWN arrow until the %MEM choice is highlighted
# * press S to select %MEM choice
# * press ENTER to save your selection
# * press q or ESC to exit the interactive menu

$ htop
# [Package] Extended version of top
```

```bash
$ ps aux
# Show processes.
$ ps -eafww
$ ps aux --forest
# Show PID parents (PPID).

$ pidof <program-name>
# Grab PIDs for any named program.

$ pgrep <process-name-to-match>
$ pgrep -u root <process-name-to-match>
# Similar to pidof but match based.
```

```bash
$ man 7 signal
# Show signal list manual.
$ kill -l
# List the signal names.
$ fuser -l
# List available signal names.
```

```bash
$ kill <PID>
# Kill process with PID.
$ kill -SIGTERM $(pidof <program-name>)
# Send termination signal to processes found by pidof.
$ kill -SIGTERM $(pidof tmux)
# Quit all tmux processes
$ pkill -f "python manage.py runserver"
# Kill all processes with CMD containing string.
$ sudo fuser -k 80/tcp
# Just kill whatever PID is using port 80 tcp.
```

### CPU

```bash
$ nproc
# Print the number of processing units available to the current process, which may be less than the number of online processors.
```
### Memory

```bash
$ free
$ cat /proc/meminfo
$ vmstat
```
### Drives
TODO: Drives operations.

### Drivers

See info: [How to display list of modules or device drivers in Linux Kernel](https://www.cyberciti.biz/faq/howto-display-list-of-modules-or-device-drivers-in-the-linux-kernel/)

```bash
$ lsmod
$ cat /proc/modules
# Show the status of loaded modules in the Linux Kernel.
# Linux kernel use a term modules for all hardware device drivers.
# Please note that `lsmod` is a trivial program which nicely formats the contents of the /proc/modules, showing what kernel modules are currently loaded.
```

## Networking

### Inspect

```bash
$ sudo lsof -i
# List all network connections.
$ sudo lsof -i [ip-version][protocol][@hostname|hostaddr][:service|port]
$ sudo lsof -i TCP:80
# Find out process listening on tcp/ip port 80.
```
#### Sockets

- [UNIX domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket) (or IPC socket) is an Inter-Process Communication mechanism that allows bidirectional data exchange between processes running on the same machine.
- [Network socket](https://en.wikipedia.org/wiki/Network_socket) (incl. TCP/IP socket) is a mechanism allowing communication between processes over the network. In some cases, you can use TCP/IP sockets to talk with processes running on the same computer (by using the loopback interface).
- UNIX domain sockets are subject to **file system permissions**, while TCP sockets can be controlled only on **the packet filter level**.

```bash
$ lsof -U
$ netstat -apx
$ netstat --all --programs --unix
# Show all UNIX domain sockets.
$ netstat -apt
$ netstat --all --programs --tcp
# Show all TCP/IP sockets (IP v4 by default).
```

```bash
$ sudo lsof -U | grep '^<command>'
$ sudo netstat -apx | grep '<command>'
# List UNIX sockets opened by a command/process.
```

## Secure Shell

### Debug

```bash
$ ssh -v [...]
# Debug SSH connection.
```

### Config

```bash
$ man ssh_config
# Show manual for SSH client config file.
$ man sshd_config
# Show manual for SSH daemon (server) config file.
```
Config files:
```bash
~/.ssh/config
# This is the per-user configuration file.
# Because of the potential for abuse, this file must have strict permissions: read/write for the user, and not writable by others.

/etc/ssh/ssh_config
# Systemwide SSH client config file.

/etc/ssh/sshd_config
# Daemon (server) config file.
```
Example of `~/.ssh/config` file:
```bash
Host *
  ServerAliveInterval 120
  # Send null packets to server each 120 seconds.
  ServerAliveCountMax 720
  # Close the connection if the server has been inactive for 720 intervals (720*120s = 24h)

  UseKeychain yes
  # On macOS, search for passphrases in the user's keychain when attempting to use a particular key. 
  AddKeysToAgent yes

  # Private keys location
  IdentityFile ~/.ssh/id_rsa
  IdentityFile ~/.ssh/LightsailDefaultKey-eu-central-1.pem

Host sub.domain.com
  HostName sub.domain.com
  User root
  ForwardAgent yes
```

### Key Pair

On the private machine:

```bash
# Generate key pair
$ ssh-keygen -t rsa

Generating public/private rsa key pair.
Enter file in which to save the key (/home/<user>/.ssh/id_rsa): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/<user>/.ssh/id_rsa.
Your public key has been saved in /home/<user>/.ssh/id_rsa.pub.
The key fingerprint is:
SHA256:tY9D3MXfeh9/nqz7nWWGQaIbaL+zZBswVRPMxUjSklU <user>@<host>
The key's randomart image is:
+---[RSA 2048]----+
|          .B**E  |
|          oo=o.  |
|          o.. +  |
|         = + + ..|
|        S * . . o|
|       . = =   + |
|          O . o.=|
|         o.=  .+X|
|          +o o+**|
+----[SHA256]-----+
```
On the host:
```bash
# Create user on the host
$ useradd -m <user>

# Copy public key file contents
/home/<user>/.ssh/id_rsa.pub
# and paste it into the host file
/home/<user>/.ssh/authorized_keys

# Set correct permissions on the host
$ chown -R <user>:<user> /home/<user>/.ssh
$ chmod 700 /home/<user>/.ssh
$ chmod 600 /home/<user>/.ssh/authorized_keys

# Ensure that Public Key authentication is enabled on the host
$ grep PubkeyAuthentication /etc/ssh/sshd_config
PubkeyAuthentication yes

# Restart SSH daemon (sshd) on the host
$ sudo systemctl restart ssh.service
```
On the private machine:
```bash
$ ssh -i <private-key-file> <user>@<host>
# Login user to host using indicated private key.
```

## Software
### Info
### List
### Repository
### Install
Where to install (see FHS)?
### Update
### Remove

## Users

### Login

```bash
$ su - <user>
# Switch user.
```

```bash
$ cat /etc/login.defs
# Show login control configuration file.
```
```bash
$ usermod -s /usr/sbin/nologin <user>
# Turn off login possibility for the user.
```
### Read

```bash
$ id
# Show current user information (uid, gid, groups).
$ id <user>
# Show user information.
$ who
# Show logged-in users.
$ whoami
# Show current user name.
```
```bash
$ uid=`id -u`
$ gid=`id -g`
$ gids=`id -G`
$ groupnames=`id -G -n`
$ username=`id -u -n`
# Read current user uid, gid, gids list, groups names list and user name.
```
```bash
$ getent [options] <database> <key>
# Get entries from Name Service Switch libraries:
# database = [passwd|shadow|group]
# key = [<user-name>|<group-name>]
```
```bash
$ cat /etc/passwd
$ getent passwd
# Show user accounts.
$ man 5 passwd
# Show passwd manual.
```
```bash
$ cat /etc/shadow
$ getent shadow
# Show user passwords info and optional aging information.
$ man 5 shadow
# Show shadow manual.
$ chage -l <user>
# Show user password expiry information.
```
### Create

```bash
$ sudo useradd -m <user>
# Create user.
# -m|--create-home Create home folder.
$ sudo useradd -o -u <uid> -g <gid> -m <user>
# Create user with home folder and specific uid:gid.
# -o|--non-unique Allow non-unique UID.
```

### Modify

#### Password

```bash
$ passwd
# Change current user password.
$ passwd <user>
# Change other user password.
```
```bash
$ passwd -d <user>
# Delete user password.
# User will not able to login.
```

#### Group

```bash
$ usermod -aG <group> <user>
$ usermod -aG <group1>,<group2>,<group3> <user>
# Add user to the group.
# -a|--append Append w/o removing from other groups.
# -G|--groups Supplementary groups list.
$ usermod -aG sudo <user>
# Add user to sudoers group.

# Log out and log back in so that your group membership is re-evaluated.
# On a virtual machine, it may be necessary to restart it for changes to take effect.
```

```bash
$ usermod -G "" <user>
# Remove user from all supplementary groups.
$ deluser <user> <group>
# Remove user from the group.
```

#### Activity

```bash
$ user_pids=`lsof -t -u <user>`
$ kill -SIGTERM ${user_pids}
# Ask to close all activities of the user.
$ kill -SIGKILL ${user_pids}
# Force to close all activities of the user.
```

### Delete

```bash
$ userdel -r <user>
# Remove the user account.
# -r Remove also user home directory and mail spool.
```

## User Groups

### Read

```bash
$ groups
# Show current user groups.
$ cat /etc/group
$ getent group
# Show all groups and their members.
```

### Create

```bash
$ groupadd -f|--force <group>
# Create group.
# -f|--force to suppress the error if the group exist and to make the command exit successfully.
$ groupadd -r|--system <group>
# Create system group from special GID range, specified in the /etc/login.defs file.
$ groupadd -g|--gid <gid> <group>
# Create group with specific group id (gid).
```

### Modify

```bash
$ sudo visudo
# Edit /etc/sudoers file with dedicated editor
# to avoid errors that will render the system unusable.
```

### Delete

## Files

### Inspect
https://www.cyberciti.biz/tips/linux-audit-files-to-see-who-made-changes-to-a-file.html

```bash
$ sudo lsof </path/to/file>
$ sudo lsof | grep <filename>
$ sudo fuser -u </path/to/file>
# Show info about opened file (pid, user, etc.).
```

```bash
$ sudo lsof -u <user>
# List opened files by user.
$ sudo lsof -u ^<user>
# List all opened files but user.
```

### Find

```bash
$ find <path> -name <expression>
# Find files with names matching expression by starting from path.
# -iname for case insensitive search
$ find . -name "FileName*"
# Find recursively from current folder files that name begins with "FileName".
```

### Modify

```bash
$ mv <old-filename> <new-filename>
# Rename file

for f in *.html; do
    mv -- "$f" "${f%.html}.php"
done
# Rename all *.html files to *.php

$ find . -depth -name "*.html" -exec sh -c 'f="{}"; mv -- "$f" "${f%.html}.php"' \;
# Rename all found *.html files to *.php
```

## Scripting

### General

- Shebang
- Environment
- Variables
- Special Variables

### Arguments Parsing

https://medium.com/@Drew_Stokes/bash-argument-parsing-54f3b81a6a8f
https://sookocheff.com/post/bash/parsing-bash-script-arguments-with-shopts/

### Running Scripts

Let's say you created `get-github.sh` shell script:
```bash
#!/bin/bash
...
```
or downloaded it:
```bash
$ curl -fsSOL https://github.com/krzysztofprzygoda/docs/raw/master/git/github/get-github.sh
```
Usually you run it like:
```bash
$ bash /path/to/get-github.sh [options]
# or in the current folder
$ bash get-github.sh [options]
```
To skip `bash` part, you need to make it executable:
```bash
$ sudo chmod u+x ./get-github.sh
# Then run it like
$ /path/to/get-github.sh [options]
# or in the current folder
$ ./get-github.sh [options]
```
To skip path part, you need move the script to your environment `PATH` location (usually `/usr/local/bin/`):
```bash
$ sudo mv ./get-github.sh /usr/local/bin/
# Then run it
$ get-github.sh [options]
```

#### Create alias

To shorten the script name like `get-gh` (to make your script a new command in fact), you need to define an alias like:
```bash
$ alias get-gh='get-github.sh'
# Then run it
$ get-gh [options]
```

#### Store alias

To make alias "permanent", you need to add alias definition to your shell environment config in `~/.bashrc`. But the good practice is to keep all your aliases in dedicated file `~/.bash_aliases` instead. Make sure only that your `~/.bashrc` file has these lines somewhere at the end, that load your definitions:

```bash
$ cat ~/.bashrc
...
# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi
...
```
This way you redefine any predefined aliases to your liking and make it portable in one file. Taking this approach you simply make your alias permanent with:
```bash
# Editing with
$ nano ~/.bash_aliases
# or direct adding
$ echo "alias get-gh='get-github.sh'" >> ~/.bash_aliases
# Then reload .bashrc with
$ source ~/.bashrc
```

## Reference

### General

- The Linux Documentation Project on [tldp.org](https://www.tldp.org/)
    - [Linux Introduction](https://www.tldp.org/LDP/intro-linux/html/intro-linux.html)
    - [Linux Administration](https://www.tldp.org/LDP/sag/html/sag.html)
    - [Command-Line Tools (GNU/Linux)](https://www.tldp.org/LDP/GNU-Linux-Tools-Summary/html/GNU-Linux-Tools-Summary.html)
    - [Bash Beginners Guide](https://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html)
    - [Bash Advanced Guide](https://www.tldp.org/LDP/abs/html/abs-guide.html)
- GNU Manuals on [gnu.org](https://www.gnu.org/manual/)
    - [Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)
    - [Common GNU/Linux distributions](https://www.gnu.org/distros/common-distros.en.html)
- Filesystem Hierarchy Standard
    - Original specification on [linuxfundation.org](https://refspecs.linuxfoundation.org/fhs.shtml)
    - Additional comments on [tldp.org](https://www.tldp.org/LDP/Linux-Filesystem-Hierarchy/html/Linux-Filesystem-Hierarchy.html)
- OS Manuals
    - [Debian Reference](https://www.debian.org/doc/manuals/debian-reference/index.en.html)
- Other
    - [The Bash Hackers Wiki](https://wiki.bash-hackers.org/)

### Styling

- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
 - [Icy Bash Coding Style](https://github.com/icy/bash-coding-style)
 - [Anybody can write good bash (with a little effort)](https://blog.yossarian.net/2020/01/23/Anybody-can-write-good-bash-with-a-little-effort)
 - The Bash Hackers Wiki [Scripting with style](https://wiki.bash-hackers.org/scripting/style)
 - [ShellCheck](https://github.com/koalaman/shellcheck) - A shell script static analysis tool
    
### Tips & Cheetsheets

- [devhints.io/bash](https://devhints.io/bash)
- [Bash One-liner](https://github.com/onceupon/Bash-Oneliner)

#### Temp
- https://www.thegeekstuff.com/2010/11/50-linux-commands/

### Utilities

- [Scripts-Common](https://gitlab.com/bertrand-benoit/scripts-common)
- [transfer.sh](https://transfer.sh) - Easy file sharing from the command line ([code](https://github.com/dutchcoders/transfer.sh))
