#!/bin/bash
#
# Get GitHub repository contents or archive
# and extracts it to the current dir.
# Installs:
#   curl    File transfer package.
#   tar     Tarball archive utility package.
# Author: Krzysztof Przygoda, 2020
# TODO(author): Handle default (omitted) GitHub ref (requires fancy arguments parsing and REST API utilization).

usage="
Usage: bash $0 owner/repo [ref[/path/to/file]] [pat]

    owner/repo          GitHub repository.
    ref[/path/to/file]  [Optional] GitHub REF is the name of the commit/branch/tag.
                        [Default] The repository’s default branch (usually master).
                        [Optional] Downloads file with ref/path/to/file provided.
    pat                 [Optional] GitHub PAT (Private Access Token) for private repo authorization.
"

#######################################
# Check arguments
#######################################
location="${1?${usage}}"
reference="${2:-master}"
pat="${3}"

#######################################
# Extract auxiliary variables
#######################################

# Using Parameter Substitution (https://www.tldp.org/LDP/abs/html/parameter-substitution.html):
# ${var/#pattern/replacement}   Replace var prefix matching pattern with replacement
# ${var/%pattern/replacement}   Replace var suffix matching pattern with replacement
# ${var/pattern/replacement}    Replace first match of pattern with replacement
# ${var//pattern/replacement}   Replace all matches of pattern with replacement
# or
# Using grep

# Delete suffix matching /*
# owner=`grep -o "^[^/]*" <<< "${location}"`
# owner="${location/%\/*/}" # Full syntax
owner="${location%%/*}" # Short

# Delete prefix matching */
# repo=`grep -o "[^/]*$" <<< "${location}"`
# repo="${location/#*\//}" # Full syntax
repo="${location##*/}" # Short

# Separate branch from file path while
# ref="branch/path/to/file.ext"

# Delete suffix matching /*
# ref="${reference/%\/*/}" # Full syntax
ref="${reference%%/*}" # Short

# Cut out ref
# file=`grep -o "/.*$" <<< "${reference}"`
file="${reference/${ref}}";
# Delete preceding trailings
file="${file#*/}"

echo "reference = $reference";
echo "ref = $ref";
echo "file = $file";

#######################################
# Performs check if command is available.
# Usage:
#   exists <command>
# Arguments:
#   command     Command/program/package name.
# Globals:
#   None.
# Outputs:
#   STDOUT and STDERR to /dev/null.
# Returns:
#   0 on success. Non-zero otherwise.
#######################################
exists() {
    command -v "${1}" >/dev/null 2>&1
}

#######################################
# Extracts tarball archive.
# Usage:
#   extract_archive <file> [destination-dir]
# Arguments:
#   file            Path to archive file.
#   destination-dir [Optional] Extraction directory.
#                   Default: current directory.
# Globals:
#   None.
# Outputs:
#   Messages to STDOUT.
#   Errors to STDERR.
# Returns:
#   0 on success. Non-zero otherwise.
#######################################
extract_archive() {
    local _archive="${1:?${FUNCNAME}(): No archive file.}"
    local _extract_dir="${2:-./}" # Default: ./

    echo "Extracting ${_archive} to ${_extract_dir}"
    
    mkdir -p "${_extract_dir}" || return 1
    # Use tar --strip-components=1 to skip archive root dir creation
    tar --extract --file="${_archive}" --directory="${_extract_dir}" || return 1
    rm -f "${_archive}"
}

#######################################
# Downloads GitHub repository file.
# Usage:
#   github_file
# Arguments:
#   None.
# Globals:
#   owner   Repo owner name.
#   repo    Repo name.
#   ref     The name of the commit/branch/tag.
#   file    File path in repo (eg. path/to/file.ext)
#   pat     [Optional] Personal Access Token for private repo.
# Outputs:
#   Messages to STDOUT. Errors to STDERR.
# Returns:
#   0 on success. Non-zero otherwise.
#######################################
github_file() {
    # API
    # See https://docs.github.com/en/rest/reference/repos#get-repository-content
    # Restriction Notice: Up to 1 MB file
    # local _endpoint="https://api.github.com/repos/${owner}/${repo}/contents/${file}"
    # -X | --request GET
    # -H | --header "Authorization: token ${pat}"
    # -H | --header "Accept: application/vnd.github.v4.raw"
    # Omit ref for default ref (usually master).
    # -d | --data "ref=${ref}"

    # HTML
    local _endpoint="https://github.com/${owner}/${repo}/raw/${ref}/${file}"
    # is resolved to...

    # Direct download
    # local _endpoint="https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${file}"
    
    echo "Downloading ${_endpoint}"
    curl -OfsSL "${_endpoint}" -H "Authorization: token ${pat}" || return 1
}

#######################################
# Downloads GitHub repository archive
# and extracts it to the current dir.
# Usage:
#   github_archive
# Arguments:
#   None.
# Globals:
#   owner   Repo owner name.
#   repo    Repo name.
#   ref     The name of the commit/branch/tag.
#   pat     [Optional] Personal Access Token for private repo.
# Outputs:
#   Messages to STDOUT. Errors to STDERR.
# Returns:
#   0 on success. Non-zero otherwise.
#######################################
github_archive() {
    local _archive_format="tar.gz"
    local _archive="${repo}-${ref}.${_archive_format}"

    # API
    # See https://docs.github.com/en/rest/reference/repos#download-a-repository-archive
    # Omit ref for default ref (usually master).
    # archive_format="tarball" | "zipball"
    # local _endpoint="https://api.github.com/repos/${owner}/${repo}/${archive_format}/${ref}",
    # -X | --request GET
    # -H | --header "Authorization: token ${pat}"
    # -H | --header "Accept: application/vnd.github.v4.raw"
    
    # HTML
    local _endpoint="https://github.com/${owner}/${repo}/archive/${ref}.${_archive_format}"
    
    echo "Downloading ${_endpoint}"
    curl -o "${_archive}" -fsSL "${_endpoint}" -H "Authorization: token ${pat}" || return 1

    extract_archive "${_archive}"
}

# Install required components
exists "curl" || sudo apt install -y curl
exists "tar" || sudo apt install -y tar

# Download content
if [ -z "${file}" ]; then
    github_archive
else
    github_file
fi

# Reference

# Deprecation Notice: GitHub will discontinue authentication to the API using query parameters.
# Authenticating to the API should be done with HTTP basic authentication.
# Using query parameters to authenticate to the API will no longer work on May 5, 2021.
# For more information, including scheduled brownouts, see the blog post:
# https://developer.github.com/changes/2020-02-10-deprecating-auth-through-query-param/
# Authentication: https://docs.github.com/en/developers/apps/identifying-and-authorizing-users-for-github-apps
# PAT: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

# Using Basic Authentication (user:password@host)
# user="${owner}"
# password="${pat}"
# curl -fsSOL "${endpoint}" -u "${user}:${password}"
# ... or with manual password provision
# curl -fsSOL "${endpoint}" -u "${user}"

# Using PAT (Personal Access Token)
# curl -fsSOL "${endpoint}" -H "Authorization: token ${pat}"
# curl -o "${archive}" -fsSL "${endpoint}" -H "Authorization: token ${pat}"

# Multi-liner with descriptive options for API calls
# curl \
#     --remote-name \
#     --location "${endpoint}"" \
#     --request GET \
#     --header "Authorization: token ${pat}" \
#     --header "Accept: application/vnd.github.v4.raw"
#     --data "ref=${ref}" \
#     --fail \
