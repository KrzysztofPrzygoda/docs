# GitHub Issues Reader

How to export GitHub issues to CSV or TSV file?

## Reference
- https://stackoverflow.com/questions/41369365/how-can-i-export-github-issues-to-excel
- https://gist.github.com/stolarczyk/1f072858d24176824dd8572741083d7d
- https://cli.github.com/manual/gh_issue_list

## Remote Repository

### Requirements
You need to generate PAT (personal access token) at https://github.com/settings/tokens
- Name: `Issues Reader`
- Repository permissions:
    - Issues: `Access: Read-only`

### Commands
```bash
$  curl -i https://api.github.com/repos/<owner>/<repo>/issues --header "Authorization: token <token>" 
```
```bash
GH_OWNER='owner'
GH_REPO='repo'
GH_URL="https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/issues"

# With PAT
GH_PAT='github_pat_...'
curl ${GH_URL} --header "Authorization: token ${GH_PAT}"

# With user and password or PAT
GH_USER='username or email'
GH_PASS='password or PAT'
curl ${GH_URL} -u "${GH_USER}:${GH_PASS}"

# With user password prompt:
curl ${GH_URL} -u "${GH_USER}"
```
```bash
JQ_FILTER='.[] | [.number, .title, (.labels|map(.name)|join("/"))] | @csv'
curl ${GH_URL} -u "${GH_USER}:${GH_PAT}" | jq -r ${JQ_FILTER} >> issues.csv
# Export issues (number, title, labels) to CSV file.
```
## Local Repository

### Installation

The script has two software dependancies:
1. [GitHub CLI](https://cli.github.com/) for querying GitHub API.
2. [`jq`](https://stedolan.github.io/jq/) for transforming the output of the above to any format.

There are multiple ways to install these tools. If you're using [Homebrew](https://brew.sh/) on macOS, it's as simple as running the code snippet below:

```console
brew install jq
brew install gh
```

### Usage

1. Create or [download](./issues.sh) the script:
```bash
#!/usr/bin/env bash
gh issue list --limit 10000 --state all --json number,title,assignees,state,url \
    | jq  -r '["number","title","assignees","state","url"], (.[] | [.number, .title, (.assignees | if .|length==0 then "Unassigned" elif .|length>1 then map(.login)|join(",") else .[].login end) , .state, .url]) | @tsv' \
    > issues-$(date '+%Y-%m-%d').tsv
```
2. Make it executable
```console
$ chmod +x issues2tsv.sh
```
3. Run it _in the cloned repository_
```bash
$ gh repo clone <owner>/<repo>
# cd to the cloned repository
$ ./issues2tsv.sh
```

#### Contents

The following issue attributes are included in the TSV by default: number, title, assignees, state, url. 

These are the available issue attributes, the script can be modified to include any of the following:
```
  assignees
  author
  body
  closed
  closedAt
  comments
  createdAt
  id
  labels
  milestone
  number
  projectCards
  reactionGroups
  state
  title
  updatedAt
  url
```

 #### Output
 
 The script outputs a TSV file named `issues-<date>.tsv` with content formatted like this:
 
 ```tsv
number	title	assignees	state	url
<issue_number> <issue_title> <assigned_users> <issue_state> <issue_url>
<issue_number> <issue_title> <assigned_users> <issue_state> <issue_url>
<issue_number> <issue_title> <assigned_users> <issue_state> <issue_url>
```

#### Other Commands

```bash
# Log in
$ gh auth login
# Change directory to a repository and run this command:
$ gh issue list --limit 1000 --state all | tr '\t' ',' > issues.csv
```