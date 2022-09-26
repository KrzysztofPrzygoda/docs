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
    - [Standard Streams](#standard-streams)
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

There are 4 types of commands used in this document.

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

```bash
$ bc
# Simple calculator.
```

### Standard Streams

```bash
>
1>
# Overwrite standard output (STDOUT).
<
0<
# Overwrite standard input (STDIN).
2>
# Overwrite standard error (STDERR).
2>&1
>&
# Redirect STDERR to STDOUT.
# Point (reference) file descriptor 2 to file descriptor 1.
# 2>1 (without reference &) would just redirect STDERR to a plain file named 1.
```
```bash
$ <command> 1>/dev/null 2>/dev/null
$ <command> 1>/dev/null 2>&1
$ <command> >/dev/null 2>&1
$ <command> >&- 2>&-
# Redirect STDOUT and STDERR to null.
```
The rule is that any redirection sets the handle to the output stream independently:
```bash
$ <command> 2>&1 > <file>
# Redirect STDERR to STDOUT but only STDOUT to file.
# Note: 2>&1 sets handle 2 to whatever handle 1 points to,
# which at that point usually is STDOUT.
# Then > redirects handle 1 to something else, e.g. a file,
# but it does not change handle 2, which still points to STDOUT.

$ <command> > <file> 2>&1
# Redirect both STDERR and STDOUT to file.
# Note: STDOUT would first be redirected to the file,
# then STDERR would additionally be redirected to STDOUT
# that has already been changed to point at the file.
```
Chained pipelines:
```bash
$ <cmd1> | <cmd2> | <cmd3>
# Redirects cmd1 STDOUT to cmd2 STDIN, and cmd2 STDOUT to cmd3 STDIN.

$ <cmd1> 2>&1 | <cmd2>
$ <cmd1> |& <cmd2>
# Pipe cmd1 stdrr and STDOUT to cmd2 STDIN.
```
Redirect to multiple outputs:
```bash
$ <command> | tee <file>
# Redirects command output to both STDOUT and the file.
$ <command> 2>&1 | tee <file>
# Redirects command STDERR to STDOUT and to the file.
```
```bash
$ <command> < <infile>
$ cat <infile> | <command>
# Pass infile contents to command.

$ echo $string | <command>
$ <command> <<< $string
# Pass var contents to command.

$ echo -e 'user\npass' | ftp localhost
$ ftp localhost <<< $'user\npass'
# Pass string to command.
```
Switch `STDOUT` and `STDERR`:
```bash
$ <cmd> 3>&1 1>&2 2>&3
# 3>&1 will create a new file descriptor 3 and redirect it to 1 which is STDOUT.
# 1>&2 will redirect the fd 1 to STDERR.
# 2>&3 will redirect fd 2 to 3 which is STDOUT.
# So, if cmd prints something to the fd 1, it will be printed to the fd 2 and vice versa.
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

#### Run in Background

```bash
$ <command> [options] &
# Run command in background.
$ <command> [options] >/dev/null 2>&1 &
# Run command in background and suppress STDOUT and STDERR.
```
```bash
$ jobs
$ jobs -l
# Show commands run in background.
```
```bash
$ fg
# Bring last background command back to foreground.
$ fg %<id>
$ fg %1
# Bring background command of id back to foreground.
```
```bash
CTRL+Z
bg
# Move foreground process in the background.
```
```bash
$ disown
$ disown %<id>
# Keep last background process (or of id) running after a shell exits.
```
```bash
#!/bin/bash
echo "Job 1" &
# Run 1 job in background
pid=$!
# Store last running in background process id ($!) in var
echo "Job 2" &
# Run 2 job in background
wait $pid
# Wait until 1 job completed
echo Job 1 exited with status $?
wait $!
# Wait until 2 job completed
echo Job 2 exited with status $?
```
Alternatively:
```bash
$ nohup <command> &
# Run command in background and ignore all SIGHUP signals.
# SIGHUP (hangup) signal is sent to a process when its controlling terminal is closed.
# If you log out or close the terminal, the process is not terminated.
# The command output is redirected to the nohup.out file.
```
To list all running processes, including the disowned use the `ps aux` command. See [System / Processes](#processes) section for more.

#### Output Capture

```bash
$ echo $?
# Print last command exit code (0 on success, failure otherwise).
$ result=$?
# Store last command exit code in result variable.
```

[Command substitution](https://tldp.org/LDP/abs/html/commandsub.html) - replace command with its output:
```bash
$ output=`<command> [options]`
# Old/classic form (backticks)...
$ output=$(<command> [options])
# New form $() of the command substitution.
# Run command in a subshell and store output in the variable.

<command> `echo a b`     # 2 args: a and b
<command> "`echo a b`"   # 1 arg: "a b"
<command> `echo`         # no arg
<command> "`echo`"       # one empty arg
# Provide command argument from the output of another command.

$ $(cat <file>)
# or faster
$ $(< <file>)
# Replace command with file contents.
```

[Process substitution](https://tldp.org/LDP/abs/html/process-sub.html) - command output as a file:
```bash
>(command_list)
<(command_list)
# Process substitution feeds the output of a process (or processes) into the stdin of another process.

$ echo >(true) <(true)
/dev/fd/63 /dev/fd/62
# Process substitution uses /dev/fd/<n> files to send the results of the process(es) within parentheses to another process.

$ cat <(ls -l)
# Same as:
$ ls -l | cat

$ diff <(<command1>) <(<command2>)
# Gives difference in command output.
$ diff <(ls $first_directory) <(ls $second_directory)
# Compare the contents of two directories -- to see which filenames are in one, but not the other.
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
$ alias ll='ls -l'
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

#### Special Variables

See: [list of reserved variables](https://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html#sect2) (set or used by `sh` and `bash`).  
See: [special parameters](https://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html#sect_03_02_05).  
See: [special parameters and shell variables](https://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables)  

```bash
$0 # Current shell/script/function.
$1…$n # Shell script params provided while execution.
$# # Number of params.
$* # Params. “$*” expands to one word delimited by the first char in $IFS.
$@ # Params. “$*” expands to separate words like “$1” “$2” etc.
$? # Exit status of last task.
$! # PID of of the most recently executed background (asynchronous) command.
$$ # PID of the current shell.
$- # Options set by set command.
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
$ kill -SIGSTOP $(pidof "npm run start")
# Send stop to command "npm run start"
$ pkill -f "python manage.py runserver"
# Kill all processes with CMD containing string.
$ sudo fuser -k 80/tcp
$ kill -SIGKILL $(lsof -t -i :80)
# Just kill whatever PID is using port 80 tcp.
```

```bash
$ man at
# at, batch, atq, atrm -- queue, examine, or delete jobs for later execution.
$ at
# Executes commands at a specified time.
$ atq
# Lists the user's pending jobs, unless the user is the superuser; in that case, everybody's jobs are listed.
$ atrm
# Deletes jobs.
$ batch
# Executes commands when system load levels permit; in other words, when the load average drops below _LOADAVG_MX (1.5), or the value specified in the invocation of atrun.
```

```bash
$ crontab
# Maintain crontab files for individual users.
```
### Services
Manage Systemd Services and Units (see [more](https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units)):
```bash
$ systemctl <command> <service>
# Manage system services.
$ systemctl status <service>
# Show service status.
$ systemctl start|stop <service>
# Start/Stop service.
$ systemctl enable|disable <service>
# De/Activate service to be run at boot.
$ systemctl restart <service>
# Restart service.
```
```bash
$ systemctl cat <servicename>.service
# Show service unit file.
```
Unit example:
```bash
# Systemd Unit Configuration File
# /etc/systemd/system/docker-app.service
# Runs docker container every time system starts.
# Register it with:
# systemctl enable docker-app
# Tutorial: https://www.digitalocean.com/community/tutorials/understanding-systemd-units-and-unit-files

[Unit]
Description=Docker App Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
TimeoutStartSec=0

# Docker Setup
# Default Docker Compose installation folder is /usr/local/bin/

# Dockerfile folder (this is where docker-compose will look up for yml config file)
WorkingDirectory=/home/appuser/docker
# Service starting up command
# ExecStart=/usr/local/bin/docker-compose up -d
ExecStart=bash start.sh prod
# Service shutting down command
# ExecStop=/usr/local/bin/docker-compose down
ExecStop=bash stop.sh prod

[Install]
WantedBy=multi-user.target
```
Unit installation:
```bash
service="service-name"
# Copy in systemd unit file
sudo cp ${service}.service /etc/systemd/system/${service}.service
# and register it
sudo systemctl enable ${service}
# To unregister
sudo systemctl disable ${service}
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

### Time

```bash
$ uptime
# Show system running time.

$ date
# Show current date.

$ cal
# Show calendar.
```
```bash
$ timedatectl
$ ls -l /etc/localtime
$ cat /etc/timezone
# Show system time zone.

$ ls /usr/share/zoneinfo/
$ ls /usr/share/zoneinfo/<zone>/<city>
$ timedatectl list-timezones
# List time zones.
```
```bash
$ sudo timedatectl set-timezone <your_time_zone>
# Set system time zone using timedatactl package.

$ TZ="Europe/Warsaw"
$ apt-get install -y tzdata 
$ ln -fns /usr/share/zoneinfo/${TZ} /etc/localtime
$ echo ${TZ} > /etc/timezone
$ dpkg-reconfigure --frontend noninteractive tzdata
# Set system time zone using tzdata package.
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
### Log Files

https://www.eurovps.com/blog/important-linux-log-files-you-must-be-monitoring/

#### Log Types

```bash
$ cat /var/log/messages
# Generic system activity logs.
# Informational and non-critical system messages.
$ cat /var/log/syslog
# In Debian-based systems, directory serves the same purpose.
```

Usage:
- Track non-kernel boot errors, application-related service errors and the messages that are logged during system startup.
- Investigate issues with hardware (e.g. the sound card) during the system startup.
- This is the first log file that the Linux administrators should check if something goes wrong.

```bash
$ cat /var/log/auth.log
# All authentication related events (Debian, Ubuntu).
$ cat /var/log/secure
# In RedHat and CentOS-based systems.
```
Usage:
- Investigate failed login attempts or brute-force attacks.

```bash
$ cat /var/log/boot.log
# Booting related information and messages logged during system startup process.
# The system initialization script, `/etc/init.d/bootmisc.sh`, sends all bootup messages to this log file.
```
Usage:
- Investigate issues related to improper shutdown, unplanned reboots or booting failures.
- Determine the duration of system downtime caused by an unexpected shutdown.

```bash
$ dmesg
$ cat /var/log/dmesg
# Kernel ring buffer messages.
# Information related to hardware devices and their drivers.
```
Usage:
- If a certain hardware is functioning improperly or not getting detected, then you can rely on this log file to troubleshoot the issue.

#### Inspect

```bash
$ grep -hnr "pattern" <directory>
$ grep -hnr "pattern" <logfile>
# Filter log (or many files in directory) lines that contain "pattern"
$ grep -hnr -A2 -B2 "pattern" <logfile>
$ grep -hnr -C2 "pattern" <logfile>
# ... and include lines preceding and following matched lines
# (-A for After, -B for Before, -C for Context, which only give the specified number of lines after or before a match)
$ grep -hnr -A2 -B2 --no-group-separator "pattern" <logfile>
# ... and suppress a separator between matches
```

## Networking

### Inspect

```bash
$ ifconfig
$ ip a [addr|a]
# List all network interfaces.
# Use ip instead of ifconfig on CentOS/RHEL >= v7.
# You may install ifconfig via:
$ yum install net-tools
```
```bash
$ netstat
# List all network connections.
$ sudo lsof -i
# List all network files/connections.
$ sudo lsof -i [ip-version][protocol][@hostname|hostaddr][:service|port]
$ sudo lsof -i TCP:80
# Find out process listening on tcp/ip port 80.
```
```bash
$ hostname
# Get name of the host/machine/computer.
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
#### DNS

```bash
$ scutil --dns
# [macOS] List DNS servers config
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

```bash
$ sudo [apt|apt-get] install <package>
# Install package in Debian based distros (apt for newest).
$ sudo yum install <package>
# Install package in Enterprise Linux based distros.
$ sudo [apt|yum] install -y <package1> <package2>
# Install packages list without prompting for confirmation.
```
### Update

### Remove

```bash
$ sudo [apt|apt-get] remove <package>
# Remove package in Debian based distros (apt for newest).
$ sudo yum remove <package>
# Remove package in Enterprise Linux based distros.
$ sudo [apt|yum] remove -y <package1> <package2>
# Remove packages list without prompting for confirmation.
```

## Users

### Login

```bash
$ su - <user>
# Switch user (substitute user identity).
$ su -
# Switch to superuser (root), which is default user in su.
$ exit
# To logout from su user.
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

$ users
$ who
# Show logged-in users.
$ w
# Show logged-in users and their performance stats.

$ whoami
# Show current user name.

$ last
# Show users login history.
$ last | awk 'print $1)' | sort | uniq
# Show only users names from login history.
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
# Create user with home dir.
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
#### Shell

```bash
$ usermod -s /bin/bash <user>
# Change shell to bash for the user.

$ chsh -s /bin/bash
# Change your shell to bash.
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

TODO

## Files

### List

```bash
$ ls -l
# List directory contents in long format.
$ ls -la
# List directory contents in long format including hidden files begin with dot.

# The Long Format
# The following information is displayed in long format for each file:
# file mode, number of links, owner name, group name, number of bytes in the file, date file was last modified, and the pathname.
# Example: drwxr-xr-x@   10 Master  staff    320 Feb 27 15:08 Data

# The File Mode (File Type)
# First letter in file mode:
# b     Block special file (block device).
# c     Character special file (special file or device file).
# d     Directory.
# l     Symbolic link.
# s     Socket link.
# p     Named pipe (FIFO).
# -     Regular file.
# The next three fields are three characters each:
# owner permissions, group permissions, and other permissions.
# Each field has three character positions:
# 1. If r, the file is readable; if -, it is not readable.
# 2. If w, the file is writable; if -, it is not writable.
# 3. The first of the following that applies:
#    S   If in the owner permissions, the file is not executable and set-user-ID mode is set. If in the group permis-
#        sions, the file is not executable and set-group-ID mode is set.
#    s   If in the owner permissions, the file is executable and set-user-ID mode is set. If in the group permissions,
#        the file is executable and setgroup-ID mode is set.
#    x   The file is executable or the directory is searchable.
#    -   The file is neither readable, writable, executable, nor set-user-ID nor set-group-ID mode, nor sticky. (See
#        below.)
#    These next two apply only to the third character in the last group (other permissions).
#    T   The sticky bit is set (mode 1000), but not execute or search permission. (See chmod(1) or sticky(8).)
#    t   The sticky bit is set (mode 1000), and is searchable or executable. (See chmod(1) or sticky(8).)
```

```bash
$ ls -lS
# Sort by decreasing size.
$ ls -lSr
# Sort by increasing size.
$ ls -lt
# Sort in time order.
$ ls -ltr
# Sort in time reverse order.
$ ls -l | wc -l
# Files count.
```

```bash
$ du -d 1
$ du -d 1 -h
$ du -d 1 -h -all
$ du --max-depth=1 --human-readable
# Inspect directories size (disk usage).
#    -h, --human-readable    Print sizes in human readable format (e.g., 1K 234M 2G).
#                            SIZE is an integer and optional unit (example: 10M is 10*1024*1024).
#                            Units are K, M, G, T, P, E, Z, Y (powers of 1024)
#                            or KB, MB, ... (powers of 1000).
#    -d, --max-depth=N       Print the total for a directory (or file, with --all)
#                            only if it is N or fewer levels below the command
#                            line argument;  --max-depth=0 is the same as
#                            --summarize
```

### Permissions

```bash
# Types:
# r : read
# w : write
# x : execute (or enter to/search for dirs)
# - : not permitted

# Control levels (permission triplets):
# u : user (owner)
# g : group (of users)
# o : others (everyone else on the system)
# a : all users

$ ls -l <file>
# Show file permittions.

$ chmod u+rwx <file>
$ chmod u-rwx <file>
# Allow/Disallow user to read, write and execute a file.
$ chmod g+w <file>
$ chmod g-w <file>
# Allow/Disallow group to write a file.
$ chmod o+r <file>
$ chmod o-r <file>
# Allow/Disallow others to read a file.
$ chmod a+r <file>
$ chmod a-r <file>
# Allow/Disallow all to read a file.

$ chmod o-x <dir>
# Disallow others to enter/cd to a directory.
$ chmod o-r -R <dir>
# Disallow others to read directory and its' contents (recursively).
$ chmod go-w <dir>
# Deny all, except the user (owner), to write in dir.
```
**Default permissions** are based on the user file-creation mode mask (umask), which is used to determine the file permission for newly created files. You can setup `umask` in `/etc/bashrc` or `/etc/profile` file for all users.
```bash
$ umask -S
u=rwx,g=rx,o=rx
# Display file mode mask (with default setup).
# Based on umask example above:
$ chmod +r <file>
$ chmod -r <file>
# Allow/Disallow to read file based on umask (changes ugo).  
$ chmod +w <file>
$ chmod -w <file>
# Allow/Disallow to read file based on umask (changes only u).
$ chmod +x <file>
$ chmod -x <file>
# Allow/Disallow to execute file based on umask (changes ugo).
```

**Access Control list (ACL)** package allows to give permissions for any user or group to any resource.

```bash
$ sudo apt install acl
# Install ACL package.
```

```bash
$ setfacl -m u:user:rwx <file>
# Allow user read, write and execute a file.
```

### Ownership

TODO

### Find

```bash
$ find <path> -name <expression>
# Find files with names matching expression by starting from path.
# -iname for case insensitive search
$ find . -name "FileName*"
# Find recursively from current folder files that name begins with "FileName".
# Wildcards (substitute for any class of characters in a search):
# *   (sterisk/star) represents zero or mor characters
# ?   (questionmark) represents a single character
# []  (brackets) represents a range of characters
```
```bash
$ locate <filename>
# Find filenames quickly, using prebuilt files database (index/cache).
# The locate program searches a database for all pathnames which match the specified pattern. 
# The database is recomputed periodically (usually weekly or daily), and contains the pathnames of all files which are publicly accessible.
# The locate program may fail to list some files that are present, or may list files that have been removed from the system.
# This is because locate only reports files that are present in the database, which is typically only regenerated once a week.
# Use find(1) to locate files that are of a more transitory nature.
# You may ask to update database right away using:
$ sudo updatedb
# You may also need to install mlocate package before.
```

### Read

```bash
$ cat <file>
# Show file contents.
```

### Create

```bash
$ touch <file>
$ touch <file 1> <file 2> <file 3>
# Create empty file (or files) if doesn't exists.
# Update last modification date if file exists.
$ echo "text" > file.txt
# Create file.txt with text.
# Overwrite file.txt with text if it does exist.
```

### Link

```bash
$ ls -i <file>
# Show inode number of the file.
# inode is a pointer/number of a file on the disk partition.
$ ln <file>
# Create Hard Link to file.
# Hard Link has the same inode number as the original file.
# Hard Link is not affected by deleting, moving or renaming original file.
$ ln -s <file>
# Create Soft Link to file.
# Soft Link has its own inode number (it's another/pseudo file).
# Soft Link will be broken if the original file is deleted, moved or renamed.
# Example:
Hulk@MacBookPro /tmp $ touch ~/file
Hulk@MacBookPro /tmp $ ls -li ~/file
8655350673 -rw-r--r--  1 Hulk  staff  0 Apr 26 00:09 /Users/Hulk/file
Hulk@MacBookPro /tmp $ ln -s ~/file
Hulk@MacBookPro /tmp $ ls -li file
8655350742 lrwxr-xr-x  1 Hulk  wheel  18 Apr 26 00:10 file -> /Users/Hulk/file
```

### Copy

```bash
$ scp -r <user>@<host>:<remote-path> <local-path>
# Copy file/dir from the remote host to the local host.
$ scp -r kprzygoda@my.host.com:/home/kprzygoda/mydir C:\Users\krzysztof.przygoda\Desktop
# Example for Windows PowerShell.
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

```bash
$ cat file1 file2 > file3
# Concatenate files (file3 = file1 + file2).
```

```bash
$ echo "text" >> file.txt
# Add text to file.txt.
```

### Compress

#### Zip

```bash
$ sudo [apt|yum] install zip unzip
# Install zip/unzip package.
```
```bash
$ zip -r <output_file> <folder>
$ zip -r <output_file> <folder_1> <folder_2> ... <folder_n>
# Zip folder(s) recursively.
```
```bash
$ unzip -l <archive_file>
# List archive contents.
```
```bash
$ unzip <archive_file>
# Unzip archive (.zip extention is optional).
$ unzip -q <archive_file>
# -q for quiet mode.

$ unzip <archive_file> -d <directory>
# Unzip to directory.
$ unzip -o <archive_file> -d <directory>
# -o for overwrite existing files
$ unzip -n <archive_file> -d <directory>
# -n for not to overwrite existing files

$ sudo unzip latest.zip -d /var/www
# Unzip latest.zip to default web server dir.
# It will create dir in /var/www/<archive_dir>.
```

### Delete

```bash
$ rm <file>
$ rm <file1> <file2> <file3>
$ rm *.<ext>
# Remove file(s).
$ rm -f <file>
# Force to remove file without confirmation, even if is write-protected.
$ rm -ri <file>
# Remove file with confirmation (-i overrides -f).
```
```bash
$ rmdir <dir>
$ rm -d <dir>
# Remove directory.
$ rm -r <dir>
$ rm -rf <dir>
# Remove all dir contents without asking (recursively, i.e. the file hierarchy rooted in dir argument).
$ rm -rf /path/to/dir/*
# Remove all files and subdirs except hidden files in a dir.
$ rm -rf /path/to/dir1/{*,.*}
# Remove all files including hidden files.
```
```bash
$ shopt -s extglob
# Enable shell pattern matching operators
# *(pattern)    matches zero or more occurances of the pattern
# ?(pattern)    matches zero or one occurance of the pattern
# +(pattern)    matches one or more occurances of the pattern
# @(pattern)    matches one of the pattern
# !(pattern)    matches anything except of the pattern

$ rm -v !(filename)
# Delete all files except specified filename
$ rm -v !(filename1|filename2)
# Delete all files except filename1 and filename2
$ rm !(*.zip)
# Delete all except .zip files

$ shopt -u extglob
# Disable shell pattern matching operators
```
```bash
$ find . -type f -not \(-name '*.zip' -or -name `*.jpg` \) -delete
# Delete all files except .zip and .jpg
$ find . -type f -not -name '*.zip' -delete
$ find . -type f -not -name '*.zip' -print0 | xargs -0 -I {} rm -v {}
# Delete all except .zip files
```

### Audit

See: [Audit who changed the file](https://www.cyberciti.biz/tips/linux-audit-files-to-see-who-made-changes-to-a-file.html).

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
- [Parameter Substitution](https://tldp.org/LDP/abs/html/parameter-substitution.html)

### Debug

```bash
$ set -x
# Turn on...
$ set +x
# Turn off each command print-out before its run.
```

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
