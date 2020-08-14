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
    - [Run](#run)
- [System Information](#system-information)

## General

### Command Types

There are 4 types of commands utilised in this document:
- **[Builtin]** (Internal) [Build-in shell command][Shell Buildins Link] and thus the least expensive in execution.
- **[Utility]** (External) GNU/Linux [Core Utilities](https://en.wikipedia.org/wiki/List_of_GNU_Core_Utilities_commands) command.
- **[Package]** (External) Installed via system specific [Package Manager][PM Link]:
    - [DEB-based][DEB Link] like [APT (Advanced Package Tool)][APT Link] or
    - [RPM-based][RPM Link] like [YUM][YUM Link].
- **[Source]** (External) Installed manually by building/compilling from the source.

```bash
$ command -V <command>
# Check if command is built-in or external.
# Use shell internal commands first then use external.
$ command -v <command>
# Show command path (name without a path means builtin).
```

```bash
$ bash -c help
$ help
# List shell builtin commands.
$ help <command>
# Show builtin command help.
```

```bash
$ man -k
$ info
# List utility commands.
$ man <command>
$ info <command>
# Show command manual.
```

```bash
$ apt show <package>
# Show package details.
```

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
# Run command in the current shell environment.
$ \<command> [options]
# Backslash bypasses alias definition.
$ <command> [options]; <command> [options]; ...
# Run commands' chain.
```

#### Capture

```bash
$ output=`<command> [options]`
# Run command in the current shell (backticks) and store output in the variable.
$ output=$(<command> [options])
# Run command in subshell and store output in the variable.
$ echo $?
# Print last command exit code (0 on success, failure otherwise).
$ result=$?
# Store last command exit code in result variable.
```

#### Conditional

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
```
```bash
$ env
$ printenv
# Print global enironment variables.
$ set
# Print local (current shell) and global enironment variables (incl. functions).
```
See [list of reserved variables](https://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html#sect2) (set or used by `sh` and `bash`).

```bash
$ echo $SHELL
# Show user defined shell.
$ echo $0
# Show current shell/script/function.
$ echo $$
# Show current shell PID.
$ echo $!
# Show PID of the most recently executed background (asynchronous) command.
```
See more [special parameters](https://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html#sect_03_02_05).

```bash
$ var=value
$ echo '${var}'
${var}
# Single quotes preserves value.
$ echo "${var}"
value
# Double quotes expands variables.
```

## System

### Version

```bash
$ lsb_release -a
$ lsb_release -sa
# [Package] Show descriptive OS version.
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
$ man 7 signal
# Show signal list manual.
$ kill -l
# List the signal names.
$ fuser -l
# List available signal names.
```
```bash
$ kill -SIGTERM $(pidof tmux)
# Quit all tmux processes
```
### CPU
### Memory
### Drives

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

- [UNIX domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket) (or IPC socket) is an inter-process communication mechanism that allows bidirectional data exchange between processes running on the same machine.
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
$ cat /etc/passwd
# Show user accounts file.
```

```bash
$ uid=`id -u`
$ gid=`id -g`
$ gids=`id -G`
$ groupnames=`id -G -n`
$ username=`id -u -n`
# Read current user uid, gid, gids list,  groups names list and user name.
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

#### Group

```bash
$ usermod -aG <group> <user>
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
