# Git Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference

- [Git Documentation](https://git-scm.com/doc)
- [Bitbucket Tutorials](https://www.atlassian.com/git/tutorials)

## Basics

### Create repo

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

### Config repo

```bash
$ git config user.name <name>
# Define author name to be used for all commits in current repo.
# Devs commonly use --global flag to set config options for current user.
```

### Inspect repo

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

### Update repo

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

### Switch branch

```bash
$ git branch <branch>
$ git checkout <branch>
# or shorter
$ git checkout -b <branch>
# Switch to a new branch.
# It will be ceated if not present.
```

### Update branch

```bash
$ git push --set-upstream origin <branch>
# Push the current branch and set the remote as upstream.
```

## Authentication

Reference:

- [GitHub Docs: Managing multiple accounts](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-personal-account/managing-multiple-accounts)
- [GitLab and SSH keys](https://docs.gitlab.com/ee/ssh/)
- [How to work with GitHub and multiple accounts](https://code.tutsplus.com/tutorials/quick-tip-how-to-work-with-github-and-multiple-accounts--net-22574)

### About management of multiple accounts

In some cases, you may need to use multiple accounts on GitHub.com. For example, you may have a personal account for open source contributions, and your employer may also create and manage a user account for you within an enterprise.

You cannot use your managed user account to contribute to public projects on GitHub.com, so you must contribute to those resources using your personal account.

If you want to use one workstation to contribute from both accounts, you can simplify contribution with Git by using a mixture of protocols to access repository data, or by using credentials on a per-repository basis.

### Single identity for multiple projects

If you aren't required to use a managed user account, GitHub recommends that you use one personal account for all your work on GitHub.com. With a single personal account, you can contribute to a combination of personal, open source, or professional projects using one identity. Other people can `invite` the account to contribute to both individual repositories and repositories owned by an organization, and the account can be a member of multiple organizations or enterprises.

### Multiple accounts using Git config

With [`url.<base>.insteadOf`](https://git-scm.com/docs/git-config#Documentation/git-config.txt-urlltbasegtinsteadOf) we may rewrite any repo call:

```bash
git config --global url."git@github.com:{user1}".insteadOf https://github.com/{user1}
git config --global url."git@{user2.}github.com:{user2}/".insteadOf https://github.com/{user2}/
git config --global --add url."git@{user2.}github.com:{user2}/".insteadOf git@github.com:{user2}/
```

This should set in your `~/.gitconfig` two `url` sections:

```Ini
[url "git@github.com:{user1}"]
	insteadOf = https://github.com/{user1}
[url "git@{user2.}github.com:{user2}/"]
	insteadOf = https://github.com/{user2}/
	insteadOf = git@github.com:{user2}/
```

where fake subdomain `{user2.}` is optional.

Any URL that starts with `insteadOf` value will be rewritten to start, instead, with `<base>`. In cases where some site serves a large number of repositories, and serves them with multiple access methods, and some users need to use different access methods, this feature allows people to specify any of the equivalent URLs and have Git automatically rewrite the URL to the best alternative for the particular user, even for a never-before-seen repository on the site. When more than one insteadOf strings match a given URL, the longest match is used.

Note that any protocol restrictions will be applied to the rewritten URL. If the rewrite changes the URL to use a custom protocol or remote helper, you may need to adjust the `protocol.*.allow` config to permit the request. In particular, protocols you expect to use for submodules must be set to always rather than the default of user. See the description of [`protocol.allow`](https://git-scm.com/docs/git-config#Documentation/git-config.txt-protocolallow).

Usage example:

```bash
$ git config --list --show-origin
# Show your current Git config.

$ git config --global url."ssh://user1@host/".insteadOf https://host/
# Use SSH instead of HTTPS.

$ git config --global --unset url."ssh://user1@host/".insteadOf
# Remove this setting.

$ git config --global --remove-section url."ssh://user1@host/"
# Remove entire section of [url "ssh://user1@host/"].
```

### Multiple accounts using SSH Keys

You can use a different key for each repository. This command does not use the SSH Agent and requires Git 2.10 or later.

```bash
$ git config core.sshCommand "ssh -o IdentitiesOnly=yes -i ~/.ssh/<private-key-for-this-repository> -F /dev/null"
```

However, even if you set `IdentitiesOnly` to `yes`, you cannot sign in if an `IdentityFile` exists outside of a `Host` block in `~/.ssh.config` file.

Instead, you can assign aliases to hosts in the `~.ssh/config` file.

- For the Host, use an alias like `user1.gitlab.com` and
`user2.gitlab.com`. Advanced configurations
are more difficult to maintain, and these strings are easier to understand when you use tools like `git remote`.
- For the `IdentityFile`, use the path the private key.

```Ini
# User1 Account Identity
Host <user1.gitlab.com>
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<user1-private-key>

# User2 Account Identity
Host <user2.gitlab.com>
  Hostname gitlab.com
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/<user2-private-key>
```

Now, to clone a repository for `user1`, use `user1.gitlab.com` in the `git clone` command:

```bash
$ git clone git@<user1.gitlab.com>:gitlab-org/gitlab.git
```

To update a previously-cloned repository that is aliased as origin:

```bash
$ git remote set-url origin git@<user1.gitlab.com>:gitlab-org/gitlab.git
```

> **NOTE**:
> Private and public keys contain sensitive data. Ensure the permissions
> on the files make them readable to you but not accessible to others.
