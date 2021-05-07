# Git Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference
- [Git Documentation](https://git-scm.com/doc)
- [Bitbucket Tutorials](https://www.atlassian.com/git/tutorials)

## Basics

### Create

```bash
$ git init <directory>
# Create empty Git repo in specified directory.
# Run with no arguments to initialize the current directory as a git repository.
```
```bash
$ git clone <repo>
# Clone repo located at <repo> onto local machine.
# Original repo can be located on the local filesystem or on a remote machine via HTTP or SSH.
```

### Config

```bash
$ git config user.name <name>
# Define author name to be used for all commits in current repo.
# Devs commonly use --global flag to set config options for current user.
```

### Inspect

```bash
$ git status
# List which files are staged, unstaged, and untracked.
```
```bash
$ git log
# Display the entire commit history using the default format. 
# For customization see additional options.
```
```bash
$ git diff
# Show unstaged changes between your index and working directory.
```

### Update

```bash
$ git add <directory>
# Stage all changes in <directory> for the next commit.
# Replace <directory> with a <file> to change a specific file.
```
```bash
$ git commit -m "<message>"
# Commit the staged snapshot, but instead of launching a text editor, use <message> as the commit message.

$ git commit -a -m "<message>"
# Stage all changes and commit them.
```

## Branch

### Switch

```bash
$ git branch <branch>
$ git checkout <branch>
# or shorter
$ git checkout -b <branch>
# Switch to a new branch.
# It will be ceated if not present.
```

### Update

```bash
$ git push --set-upstream origin <branch>
# Push the current branch and set the remote as upstream.
```


## SSH

Reference: [GitLab and SSH keys](https://docs.gitlab.com/ee/ssh/)

### Repository SSH Key

```bash
$ git config core.sshCommand "ssh -o IdentitiesOnly=yes -i ~/.ssh/<private-key-filename-for-this-repository> -F /dev/null"
```
However, even if you set `IdentitiesOnly` to `yes`, you cannot sign in if an `IdentityFile` exists outside of a `Host` block in `~/.ssh.config` file.

Instead, you can assign aliases to hosts in the `~.ssh/config` file.

- For the Host, use an alias like `user_1.gitlab.com` and
`user_2.gitlab.com`. Advanced configurations
are more difficult to maintain, and these strings are easier to understand when you use tools like `git remote`.
- For the `IdentityFile`, use the path the private key.

```
# User1 Account Identity
Host <user_1.gitlab.com>
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<example_ssh_key1>

# User2 Account Identity
Host <user_2.gitlab.com>
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<example_ssh_key2>
```
Now, to clone a repository for `user_1`, use `user_1.gitlab.com` in the `git clone` command:
git clone git@<user_1.gitlab.com>:gitlab-org/gitlab.git
To update a previously-cloned repository that is aliased as origin:
git remote set-url origin git@<user_1.gitlab.com>:gitlab-org/gitlab.git
NOTE:
Private and public keys contain sensitive data. Ensure the permissions
on the files make them readable to you but not accessible to others.