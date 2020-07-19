#!/bin/bash

# Get GitHub repository archive using direct access
# https://docs.github.com/en/developers/apps/identifying-and-authorizing-users-for-github-apps


# Deprecation Notice: GitHub will discontinue authentication to the API using query parameters.
# Authenticating to the API should be done with HTTP basic authentication.
# Using query parameters to authenticate to the API will no longer work on May 5, 2021.
# For more information, including scheduled brownouts, see the blog post:
# https://developer.github.com/changes/2020-02-10-deprecating-auth-through-query-param/

# Install cURL
# Usage: https://linux.die.net/man/1/curl
# sudo apt install curl -y

# Repo
# REF is the name of the commit/branch/tag. Default: the repository’s default branch (usually master)
GITHUB_REPO_OWNER=KrzysztofPrzygoda
GITHUB_REPO=<repository name>
GITHUB_REF=master

# Repo credentials (PAT)
# https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
GITHUB_TOKEN=<token>

# Archive
GITHUB_FORMAT=tar.gz
GITHUB_ARCHIVE=$GITHUB_REF.$GITHUB_FORMAT

# Endpoint
# It's a link from GitHub GUI menu Code > Download ZIP
# https://github.com/$GITHUB_REPO_OWNER/$GITHUB_REPO/archive/$GITHUB_REF.zip
# that is resolved to
GITHUB_URL=https://github.com/$GITHUB_REPO_OWNER/$GITHUB_REPO/archive/$GITHUB_ARCHIVE

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
# curl -fsSOL $GITHUB_URL -H "Authorization: token $GITHUB_TOKEN"
curl -o $GITHUB_ARCHIVE -fsSL $GITHUB_URL -H "Authorization: token $GITHUB_TOKEN"

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

# Unpack archive

# Extract to current folder
EXTRACT_DIR=.

echo Extracting $GITHUB_ARCHIVE to $EXTRACT_DIR/

# TARBALL
# Use --strip-components=1 to skip archive root dir creation
mkdir -p $EXTRACT_DIR && tar --extract --file=$GITHUB_ARCHIVE --strip-components=1 --directory=$EXTRACT_DIR

# Remove archive file
rm -f $GITHUB_ARCHIVE
