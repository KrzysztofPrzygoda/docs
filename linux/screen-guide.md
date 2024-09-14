# Screen Command Cheatsheet

`screen` is a terminal multiplexer that allows you to create, manage, and resume terminal sessions even after disconnection. Below is a complete guide to using `screen`.

## Table of Contents
1. [Basic Commands](#basic-commands)
2. [Session Management](#session-management)
3. [Window Management](#window-management)
4. [Navigation](#navigation)
5. [Screen Splitting](#screen-splitting)
6. [Copy and Paste](#copy-and-paste)
7. [Miscellaneous](#miscellaneous)

## Basic Commands

| Command                          | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| `screen`                         | Start a new screen session                       |
| `screen -S <name>`               | Start a new session with a name                  |
| `screen -ls`                     | List all active screen sessions                  |
| `screen -r <session_id>`         | Reattach to a specific session                   |
| `screen -d <session_id>`         | Detach a session                                 |
| `screen -X -S <session_id> quit` | Terminate a specific screen session              |

## Session Management

| Key Combination                  | Description                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| <kbd>Ctrl a</kbd> + <kbd>d</kbd> | Detach from the current screen session (session runs in the background) |
| `screen -r`                      | Reattach to the last detached screen session                   |
| `screen -r <session_id>`         | Reattach to a specific session                                 |
| `screen -ls`                     | List all screen sessions                                       |
| `screen -S <name>`               | Create a new session with a name                               |

## Window Management

| Key Combination                     | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| <kbd>Ctrl a</kbd> + <kbd>c</kbd>    | Create a new window                              |
| <kbd>Ctrl a</kbd> + <kbd>n</kbd>    | Switch to the next window                        |
| <kbd>Ctrl a</kbd> + <kbd>p</kbd>    | Switch to the previous window                    |
| <kbd>Ctrl a</kbd> + <kbd>0-9</kbd>  | Switch to a specific window by number            |
| <kbd>Ctrl a</kbd> + <kbd>k</kbd>    | Kill the current window                          |
| <kbd>Ctrl a</kbd> + <kbd>"</kbd>    | List all open windows                            |

## Navigation

| Key Combination                    | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| <kbd>Ctrl a</kbd> + <kbd>n</kbd>   | Move to the next window                          |
| <kbd>Ctrl a</kbd> + <kbd>p</kbd>   | Move to the previous window                      |
| <kbd>Ctrl a</kbd> + <kbd>0-9</kbd> | Jump to a window by its number                   |
| <kbd>Ctrl a</kbd> + <kbd>"</kbd>   | Display a list of all windows for selection      |

## Screen Splitting

| Key Combination                    | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| <kbd>Ctrl a</kbd> + <kbd>S</kbd>   | Split the screen horizontally                    |
| <kbd>Ctrl a</kbd> + <kbd>\|</kbd>  | Split the screen vertically                      |
| <kbd>Ctrl a</kbd> + <kbd>Tab</kbd> | Switch between split regions                     |
| <kbd>Ctrl a</kbd> + <kbd>X</kbd>   | Close the active split region                    |

## Copy and Paste

| Key Combination                  | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| <kbd>Ctrl a</kbd> + <kbd>[</kbd> | Enter copy mode (scroll and select text)         |
| <kbd>Enter</kbd>                 | Set the beginning and end of the selection       |
| <kbd>Ctrl a</kbd> + <kbd>]</kbd> | Paste the copied text into the current window    |

## Miscellaneous

| Key Combination                  | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| <kbd>Ctrl a</kbd> + <kbd>?</kbd> | Show help with a list of key bindings            |
| <kbd>Ctrl a</kbd> + <kbd>w</kbd> | Show a list of all windows at the bottom         |
| <kbd>Ctrl a</kbd> + <kbd>t</kbd> | Show time and system information                 |
| <kbd>Ctrl a</kbd> + <kbd>H</kbd> | Begin logging the screen session                 |
| <kbd>Ctrl a</kbd> + <kbd>\</kbd> | Close all windows and terminate the session      |
