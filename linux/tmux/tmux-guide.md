# Tmux Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2020.

[About tmux](#about-tmux) section is located at the end of this guide.

## Version

The guide is based on version:
```bash
$ tmux -V
tmux 2.6
```
To install it or upgrade go to the [Installation](#installation) section.

## Shell Commands

### Help

```bash
# Display tmux manual.
$ man tmux
# Type `/` to search text.
# Press `(shift) n` for (previous) next match.

# List the syntax of all commands supported by tmux
$ tmux lscm (list-commands|list-co|lscm)

# List the key bindings table
$ tmux lsk (list-keys|list-k|lsk)
```

### List

```bash
$ tmux ls (list-sessions|list-s|ls)
$ tmux lsc (list-clients|list-cl|lsc)
```

### Attach

```sh
# Attach to the first detached session on the list
$ tmux a (attach-session|attach|a)

# Attach to the target session
$ tmux a -t <session-name>
```

### New

```bash
# New session with default name
$ tmux
$ tmux new (new-session|new)

# New named session
$ tmux new -s <session-name>
```

### Detach

```bash
# Detach current client from a session
$ tmux det (detach-client|detach|det)

# Detach all clients from target session
$ tmux det -s <session-name>

# Detach target client from all sessions
$ tmux det -t <client-name>

# Detach target client from target session
$ tmux det -s <session-name> -t <client-name>
```

### Kill

```bash
# Kill the first session from the list
$ tmux kill-ses (kill-session|kill-ses)

# Kill all but the current session
$ tmux kill-ses -a

# Kill target session
$ tmux kill-ses -t <session-name>

# Kill all but target session
$ tmux kill-ses -a -t <session-name>

# Kill the tmux server and clients and destroy all sessions
$ tmux kill-ser (kill-server|kill-ser)
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
Issue Command | <kbd>:</kbd> `command` <kbd>enter</kbd>
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

# Make 'prefix w' only show windows in the attached session
bind w run 'tmux choose-tree -Nwf"##{==:##{session_name},#{session_name}}"'

# Enable mouse support
# The default key bindings allow to:
# - select and resize panes,
# - copy text,
# - change window using the status line.
set -g mouse on

# Toggle mouse support with 'prefix m'
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
`:show-options -g`

## Automation

Using Script File
Using Config File
Making Alias

### More
- Auto SSH login to tmux using [Byobu](https://askubuntu.com/a/834446/1095965).

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

### Installation

The **tmux** packages available from the main repositories are **often quite out of date**, especially for long-term support (LTS) distributions.
If you care about the latest version go to the [tmux Wiki Installation](https://github.com/tmux/tmux/wiki/Installing).

#### Installation from repositories
If not already preinstalled, then depending on your **Linux** distribution package manager ([APT][APT Link] or [RPM][RPM Link]):
```bash
# APT-based (Debian, Ubuntu, Mint etc.)
$ sudo apt update
$ sudo apt install tmux

# RPM-based (Red Hat, CentOS, Fedora, RHEL etc.)
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

#### Installation from the source
Check out releases at [tmux GitHub repository](https://github.com/tmux/tmux/releases).

Edit [`tmux-build.sh`](tmux-build.sh) script file and provide version number as well as directory of your choice:
```bash
TMUX_VERSION=3.1b
# Default building tmux directory is /usr/local
TMUX_DIR=/usr/local
# Binary will be placed in $TMUX_DIR/bin/tmux (/usr/local/bin/tmux by default)
```
Run script with
```bash
$ sudo sh tmux-build.sh
```

### Reference

- [tmux Wiki](https://github.com/tmux/tmux/wiki)