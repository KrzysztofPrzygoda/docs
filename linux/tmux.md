# Tmux

**tmux** is a terminal multiplexer: it enables a number of terminals to be created, accessed, and controlled from a single screen. **tmux** may be detached from a screen and continue running in the background, then later reattached.

When **tmux** is started it creates a new **session** with a single **window** and displays it on screen.

A **status line** at the bottom of the screen shows information on the current session and is used to enter interactive commands.

Any number of **tmux** instances may connect to the same session, and any number of windows may be present in the same session. Once all sessions are killed, **tmux** exits.

## Elements

```
Session  
├─> Window  
├   └─> Pane  
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

## Shell

### Manual
```bash
$ man tmux
```
### Sessions
#### List
```bash
$ tmux ls
```
#### Attach
```bash
# Attach to the first one
$ tmux attach
$ tmux a
# Attach to selected one
$ tmux a -t <session name>
```
#### New
```bash
$ tmux
$ tmux new -s <session name>
```
#### Detach
```bash
$ tmux
$ tmux new -s <session name>
```
#### Kill
```bash
$ tmux kill-session -t <session name>
```

## Keys

### Action Key

Default `bind-key` to enter actions is <kbd>control b</kbd>.

### General Actions

Action | Keys
--- | ---
Help | <kbd>?</kbd>

### Sessions

Action | Keys
--- | ---
New | <kbd>:</kbd> `new` <kbd>enter</kbd>
Rename | <kbd>$</kbd> `name` <kbd>enter</kbd>