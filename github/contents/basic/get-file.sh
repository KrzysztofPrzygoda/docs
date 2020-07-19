#!/bin/bash

# Get GitHub repository content using direct access
# https://docs.github.com/en/developers/apps/identifying-and-authorizing-users-for-github-apps


# Deprecation Notice: GitHub will discontinue authentication to the API using query parameters.
# Authenticating to the API should be done with HTTP basic authentication.
# Using query parameters to authenticate to the API will no longer work on May 5, 2021.
# For more information, including scheduled brownouts, see the blog post:
# https://developer.github.com/changes/2020-02-10-deprecating-auth-through-query-param/

# Install cURL
# Usage: https://linux.die.net/man/1/curl
# sudo apt install curl -y

# Content location
GITHUB_PATH=<path/to/file>
GITHUB_REF=master
# REF is the name of the commit/branch/tag. Default: the repository’s default branch (usually master)

# Repo
GITHUB_REPO=<repository name>
GITHUB_REPO_OWNER=KrzysztofPrzygoda

# Repo credentials (PAT)
# https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
GITHUB_TOKEN=<token>

# Endpoint
# It's a link from GitHub GUI to RAW file
# https://github.com/$GITHUB_REPO_OWNER/$GITHUB_REPO/raw/$GITHUB_REF/$GITHUB_PATH
# that is resolved to
GITHUB_URL=https://raw.githubusercontent.com/$GITHUB_REPO_OWNER/$GITHUB_REPO/$GITHUB_REF/$GITHUB_PATH

# Download content
echo Downloading $GITHUB_URL

# Using Basic Authentication (user:password@host)
# Notice: Password can be substituted with PAT (Personal Access Token).

# GITHUB_USER=$GITHUB_REPO_OWNER
# GITHUB_PASS=$GITHUB_TOKEN
# curl -fsSOL $GITHUB_URL -u $GITHUB_USER:$GITHUB_PASS
# ... or with manual password provision
# curl -fsSOL $GITHUB_URL -u $GITHUB_USER

# Using PAT

# One-liner
curl -fsSOL $GITHUB_URL -H "Authorization: token $GITHUB_TOKEN"

# Multi-liner with descriptive options
# :<<'END'
# curl \
#     --remote-name \
#     --location $GITHUB_URL \
#     --request GET \
#     --header "Authorization: token $GITHUB_TOKEN" \
#     --fail \
#     --progress-bar \
  
# Clear sensitive data
unset $GITHUB_TOKEN
