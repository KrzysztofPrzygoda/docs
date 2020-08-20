# Tmux Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2020.

[About tmux](#about-tmux) section is located at the end of this guide.

## Version

The guide is based on version:
```bash
$ tmux -V
tmux 3.1b
```
To install it or upgrade go to the [Installation](#installation) section.

## Shell Commands

### Help

```bash
$ man tmux
# Display tmux manual.
# Type `/` to search text.
# Press `(shift) n` for (previous) next match.

$ tmux lscm (list-commands|list-co|lscm)
# List the syntax of all commands supported by tmux

$ tmux lsk (list-keys|list-k|lsk)
# List the key bindings table
```

### List

```bash
$ tmux ls (list-sessions|list-s|ls)
# List sessions.

$ tmux lsc (list-clients|list-cl|lsc)
# List clients.
```

```bash
$ sudo lsof -U | grep '^tmux'
# List all tmux sockets.
```

### Attach

```sh
$ tmux a (attach-session|attach|a)
# Attach to the first detached session on the list.

$ tmux a -t <session-name>
# Attach to the target session.
```

### New

```bash
$ tmux
$ tmux new (new-session|new)
# New session with default name.

$ tmux new -s <session-name>
# New named session
```

### Detach

```bash
$ tmux det (detach-client|detach|det)
# Detach current client from a session

$ tmux det -s <session-name>
# Detach all clients from target session

$ tmux det -t <client-name>
# Detach target client from all sessions

$ tmux det -s <session-name> -t <client-name>
# Detach target client from target session
```

### Close

#### Session

```bash
$ tmux kill-ses (kill-session|kill-ses)
# Close the first session from the list.

$ tmux kill-ses -a
# Close all but the current session.

$ tmux kill-ses -t <session-name>
# Close target session.

$ tmux kill-ses -a -t <session-name>
# Close all but target session.
```

#### Server

```bash
$ tmux kill-ser (kill-server|kill-ser)
# Quit current user tmux server with default socket (incl. all clients and sessions).

# Notice that:
$ sudo tmux kill-ser
error connecting to /tmp/tmux-0/default (No such file or directory)
# Is trying to quit root user (uid=0) server and
# this error happens if you start your server on a diffrent than root account.
```
Each user on the same machine starts its own server with its own socket at (if not specified differently with `tmux -S <socket-path>` option):
```bash
/${TMUX_TMPDIR}/tmux-${uid}/<socket-file>
# or if $TMUX_TMPDIR is unset
/tmp/tmux-${uid}/<socket-file>
# and by default it is
/tmp/tmux-${uid}/default
# where
uid=`id -u`
# for example
/tmp/tmux-1000/default
```
Moreover, one user can run multiple servers specifying dedicated socket with:
```bash
$ tmux -L <socket-name>
# which needs to be specified while closing this server
$ tmux -L <socket-name> kill-server
```
So, it may happen that there are more than one server running on the same machine:
```bash
$ sudo lsof -U | grep '^tmux'
# List all opened tmux sockets.
```
The simpliest way to close all of them is to send termination signal with:
```bash
$ kill -SIGTERM $(pidof tmux)
# Quit all tmux servers of every user.
```

### Recover

```bash
$ sudo killall -SIGUSR1 tmux
# Recreate accidentally deleted tmux server socket (see man tmux -L option).
```

## Keys

### Action Key

Default `prefix key` to access **tmux** actions is <kbd>control b</kbd> then continue with chosen action keys.

Refer to [Configuration](#configuration) section for adjustment.

### General

Action | Keys
--- | ---
Enter > Exit Help | <kbd>?</kbd> > <kbd>escape</kbd>
Enter > Exit Command Mode | <kbd>:</kbd> > <kbd>escape</kbd>
Issue tmux Command | <kbd>:</kbd> `command` <kbd>enter</kbd>
Command History | <kbd>:</kbd> > <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>
Toggle Mouse Support | <kbd>:</kbd> `set -g mouse` <kbd>enter</kbd>

### Sessions

Action | Keys
--- | ---
List > Navigate | <kbd>s</kbd> > <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>
New | <kbd>:</kbd> `new` <kbd>enter</kbd>
New Named | <kbd>:</kbd> `new -s name` <kbd>enter</kbd>
Rename | <kbd>$</kbd> `name` <kbd>enter</kbd>
Detach | <kbd>d</kbd>
Toggle Last | <kbd>L</kbd>

### Windows

Action | Keys
--- | ---
List > Navigate | <kbd>w</kbd> > <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>
Create | <kbd>c</kbd>
Rename | <kbd>,</kbd> `name` <kbd>enter</kbd>
Kill | <kbd>&</kbd> `(y/n)`
Toggle Last | <kbd>l</kbd>
Select Prev / Next | <kbd>p</kbd> / <kbd>n</kbd>
Select # | <kbd>0</kbd> ... <kbd>9</kbd>
Select # > 9 | <kbd>'</kbd> `number` <kbd>enter</kbd>
Find Text | <kbd>f</kbd> `text` <kbd>enter</kbd>

### Panes

Action | Keys
--- | ---
Clear  | <kbd>control l</kbd>
Split H / V  | <kbd>"</kbd> / <kbd>%</kbd>
Toggle Layout | <kbd>space</kbd>
Navigate | <kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>←</kbd> / <kbd>→</kbd>
Toggle Zoom | <kbd>z</kbd>
Select Next | <kbd>o</kbd>
Swap | <kbd>control o</kbd>
Make Window  | <kbd>!</kbd>
Toggle Synch Input | <kbd>:</kbd> `setw synchronize-panes` <kbd>enter</kbd>
Kill | <kbd>x</kbd> `(y/n)`

## Configuration

### Config file

Create `.tmux.conf` file in your `/home/<username>` folder using `nano` editor:
```bash
$ nano ~/.tmux.conf
```
Edit config options:
```conf
# Add second prefix 'C-a'
set -g prefix2 C-a

# Start window numbering at 1
set -g base-index 1

# Change 'prefix w' to show windows in the attached session only
bind w run 'tmux choose-tree -Nwf"##{==:##{session_name},#{session_name}}"'

# Enable mouse support
# The default key bindings allow to:
# - select and resize panes,
# - copy text,
# - change window using the status line.
set -g mouse on

# Toggle mouse support
# with 'C-m'
# bind -n C-m \
# with 'prefix m'
bind m \
    set -g mouse \;\
    display "Mouse #{?mouse,On,Off}"
```

Save changes in `nano` with <kbd>control x</kbd> `y` <kbd>enter</kbd>.

To apply changes while running **tmux** reload config file with:
```bash
$ tmux source-file ~/.tmux.conf
```

### Display config

To do:
- Save current config to `.tmux.conf`

`:show-options -g`

## Automation

To do:
- Using Script File
- Using Config File
- Using Plugin(s) and [Tmux Plugin Manager](https://github.com/tmux-plugins/tpm)
- Making Alias
- SSH login to tmux (e.g. using [Byobu](https://askubuntu.com/a/834446/1095965))


## Sharing

To do:
- Session sharing

---

## About tmux
**tmux** is a terminal multiplexer.

It enables a number of terminals to be created, accessed, and controlled from a single screen. **tmux** may be detached from a screen and continue running in the background, then later reattached.

When **tmux** is started it creates a new **session** with a single **window** and displays it on screen.

A session is displayed on screen by a **client** and all sessions are managed by a single **server**. The server and each client are separate processes which communicate through a socket in `/tmp`.

Any number of **tmux** instances may connect to the same session, and any number of windows may be present in the same session. Once all sessions are killed, **tmux** exits.

### Elements

```
tmux (server)
├─> Session (clients) 
│   └─> Window  
│       └─> Pane (pty)
└─> Session (clients)
    ├─> Window  
    │   └─> Pane (pty)  
    └─> Window  
        ├─> Pane (pty)  
        └─> Pane (pty)
```

- **Session** is a single collection of **pseudo terminals** under the management of **tmux**. Each session has one or more **windows** linked to it.
- **Window** occupies the entire screen and may be split into several rectangular **panes** (one at least).
- **Pane** is a separate [pseudo terminal](https://en.wikipedia.org/wiki/Pseudoterminal) (pty).

### Benefits

- Multiple pseudo terminals in a single terminal window.
- No session loss after any disconnection (the internet drop, long runs etc.).
- Session sharing in teams.
- Sessions automation using custom scripts that spin up the exact terminal state you need to start working on a given project.

## Installation

The **tmux** packages available from the main repositories are **often quite out of date**, especially for long-term support (LTS) distributions.
If you care about the latest version go to the [tmux Wiki Installation](https://github.com/tmux/tmux/wiki/Installing).

### Package installation

If not already preinstalled, then depending on your **Linux** distribution package manager ([APT][APT Link] or [RPM][RPM Link]):
```bash
# APT-based (Debian, Ubuntu, Mint etc.)
$ sudo apt update
$ sudo apt install tmux

# RPM-based (Red Hat/RHEL, CentOS, Fedora etc.)
$ sudo yum update
$ sudo yum install tmux
```

On **macOS** with [homebrew][Homebrew link]:
```zsh
$ brew install tmux
```

[APT Link]: https://en.wikipedia.org/wiki/APT_(software)
[RPM Link]: https://en.wikipedia.org/wiki/RPM_Package_Manager
[Homebrew Link]: https://brew.sh

### Source building

Based on the [tmux Wiki Installation](https://github.com/tmux/tmux/wiki/Installing) section.

Check out releases at [tmux GitHub repository](https://github.com/tmux/tmux/releases) for version of your preference.

Download [`tmux-build.sh`](tmux-build.sh) script file:
```bash
$ wget https://github.com/KrzysztofPrzygoda/docs/raw/master/linux/tmux/tmux-build.sh
# or
$ curl -fsSOL https://github.com/KrzysztofPrzygoda/docs/raw/master/linux/tmux/tmux-build.sh
```

> **WARNING NOTICE!**  
> **This script removes current tmux package** (and source if exists in installation folder). Also installs several required packages. Refer to the script for details, step by step installation, modifications and uninstallation procedure.

Usage:
```bash
$ sudo bash tmux-build.sh [version] [install-dir]
# where:
#    version        [Optional] GitHub release tag (default 3.1b).
#    install-dir    [Optional] Dir to install tmux to (default /usr/local).
$ sudo reboot
# Reboot system after installation.
```

Usage examples:
```bash
$ sudo bash tmux-build.sh
# Builds tmux 3.1b and installs it in /usr/local/bin
$ sudo bash tmux-build.sh 3.2-rc
# Builds tmux 3.2-rc and installs it in /usr/local/bin
$ sudo bash tmux-build.sh 3.2-rc "/usr"
# Builds tmux 3.2-rc and installs it in /usr/bin
```

## Reference

- [tmux Wiki](https://github.com/tmux/tmux/wiki)