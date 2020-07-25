# Tmux

## About
**tmux** is a terminal multiplexer: it enables a number of terminals to be created, accessed, and controlled from a single screen. **tmux** may be detached from a screen and continue running in the background, then later reattached.

When **tmux** is started it creates a new **session** with a single **window** and displays it on screen.

A **status line** at the bottom of the screen shows information on the current session and is used to enter interactive commands.

Any number of **tmux** instances may connect to the same session, and any number of windows may be present in the same session. Once all sessions are killed, **tmux** exits.

## Elements

```
Session  
├─> Window  
│   └─> Pane  
└─> Window  
    ├─> Pane  
    └─> Pane
```

### Session
A **session** is a single collection of **pseudo terminals** under the management of **tmux**. Each session has one or more **windows** linked to it.

### Window
A **window** occupies the entire screen and may be split into rectangular **panes**.

### Pane
A **pane** is a separate **pseudo terminal** (the pty(4) manual page documents the technical details of pseudo terminals).

## Questions

- When do I need a new session instead of a new window?

## Shell Commands

### Help

```bash
$ man tmux
# List the syntax of all commands supported by tmux
$ tmux lscm (list-commands|list-co|lscm)
$ tmux lsk (list-keys|list-k|lsk)
```

### Sessions

#### List

```bash
$ tmux ls (list-sessions|list-s|ls)
$ tmux lsc (list-clients|list-cl|lsc)
```

#### Attach

```sh
$ tmux a (attach-session|attach|a)
$ tmux a -t <session-name>
```

#### New

```bash
# New session with default name
$ tmux
$ tmux new (new-session|new)
# New session with specified name
$ tmux new -s <session-name>
```

#### Detach

```bash
$ tmux det (detach-client|detach|det)
$ tmux det -s <session-name>
$ tmux det -t <client-name>
$ tmux det -s <session-name> -t <client-name>
```

#### Kill

```bash
# Kill the first session from the list
$ tmux kill-ses (kill-session|kill-ses)
# Kill target session
$ tmux kill-ses -t <session-name>
# Kill the tmux server and clients and destroy all sessions
$ tmux kill-ser (kill-server|kill-ser)
```

## Keys

### Action Key

Default `bind-key` to enter actions is <kbd>control b</kbd>.

### General

Action | Keys
--- | ---
Help | <kbd>?</kbd>

### Sessions

Action | Keys
--- | ---
Detach | <kbd>d</kbd>
List | <kbd>s</kbd>
New | <kbd>:</kbd> `new` <kbd>enter</kbd>
Rename | <kbd>$</kbd> `name` <kbd>enter</kbd>

### Windows

Action | Keys
--- | ---
List | <kbd>w</kbd>
Create | <kbd>c</kbd>
Kill | <kbd>&</kbd> `(y/n)` <kbd>enter</kbd>
Rename | <kbd>,</kbd> `name` <kbd>enter</kbd>
Find | <kbd>f</kbd> `name` <kbd>enter</kbd>
Previous / Next | <kbd>p</kbd> / <kbd>n</kbd>
