#!/bin/bash

# Get GitHub repository content using REST API
# https://docs.github.com/en/rest/guides/basics-of-authentication
# https://docs.github.com/en/rest/reference/repos#get-repository-content

# Restrictions Notice: Max file size is 1MB.

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
# GET /repos/{owner}/{repo}/contents/{path}
GITHUB_URL=https://api.github.com/repos/$GITHUB_REPO_OWNER/$GITHUB_REPO/contents/$GITHUB_PATH

# Media type
# Use the .raw media type to retrieve the contents of the file.
GITHUB_MEDIA_TYPE=application/vnd.github.v4.raw

# Extra params
# Format x-www-form-urlencoded
GITHUB_PARAMS="ref=$GITHUB_REF"
# Format JSON
# GITHUB_PARAMS="{\"ref\":\"$GIT_REF\"}"

# Download content
echo Downloading $GITHUB_URL

curl \
    --remote-name \
    --location $GITHUB_URL \
    --fail \
    --progress-bar \
    --request GET \
    --data $GITHUB_PARAMS \
    --header "Authorization: token $GITHUB_TOKEN" \
    --header "Accept: $GITHUB_MEDIA_TYPE" \
    # --header "Content-Type: application/x-www-form-urlencoded" \
    # --header "Content-Type: application/json" \ 

# Clear sensitive data
unset $GITHUB_TOKEN
