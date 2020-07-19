#!/bin/bash

# Get GitHub repository archive using REST API
# https://docs.github.com/en/rest/guides/basics-of-authentication
# https://docs.github.com/en/rest/reference/repos#download-a-repository-archive

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
GITHUB_FORMAT=tarball
GITHUB_ARCHIVE=$GITHUB_REF.tar.gz

# Endpoint
# GET /repos/{owner}/{repo}/{archive_format}/{ref}
GITHUB_URL=https://api.github.com/repos/$GITHUB_REPO_OWNER/$GITHUB_REPO/$GITHUB_FORMAT/$GITHUB_REF

# Media type
# Use the .raw media type to retrieve the contents of the file.
GITHUB_MEDIA_TYPE=application/vnd.github.v4.raw

# Download content
echo Downloading $GITHUB_URL

curl \
    --output $GITHUB_ARCHIVE \
    --location $GITHUB_URL \
    --request GET \
    --header "Authorization: token $GITHUB_TOKEN" \
    --header "Accept: $GITHUB_MEDIA_TYPE" \
    --fail

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
