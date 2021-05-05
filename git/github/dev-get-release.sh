#!/bin/bash
#
# Downloads code release from GitHub repository
#
# Usage: get-release owner/repo [version]
usage=<<END
Usage: $0 <owner/repo> [version]
    
    owner/repo 
    version         [Optional] GitHub Tag
END

# set -x # Debug

# Check required args
# [ $# -eq 0 ] && { echo "Usage: $0 owner/repo [version]"; exit 1; }
# : ${1?"Usage: $0 owner/repo [version]"}
repo=${1?"${usage}"}
code=`echo "${repo}" | grep -o "[^/]*$"`
# Default version=latest if not specified
version=${2:-latest}

# Finction to check if command is available
exists() {
    echo "Checking $1"
    command -v "$1" >/dev/null 2>&1
}

# error() { printf "%s\n" "$*" >&2; }

# Reliable JSON decode with use of jq package
json_decode() {
    local _json="${1?"No JSON data provided."}"
    declare -n _result="${2?"Associative array required."}"
    # Use jq package if installed
    if exists jq
    then
        echo "Decoding JSON with jq..."
        _result['tag_name']=$(echo $_json | jq -r '.tag_name')
        _result['tarball_url']=$(echo $_json | jq -r '.tarball_url')
    else
        echo "Decoding JSON with grep..."
        local $_keyVersion='"tag_name": *"[^"]*'
        local $_keyArchive='"tarball_url": *"[^"]*'
        local $_keyValue='[^"]*$'
        _result['tag_name']=$(echo $_json | grep -o "$_keyVersion" | grep -o "$_keyValue")
        _result['tarball_url']=$(echo $_json | grep -o "$_keyArchive" | grep -o "$_keyValue")
    fi
}

# To reliably decode JSON data consider to
# Install jq package
# sudo apt install -y jq

# Install download tools
sudo apt -y install curl tar

if [ "${version}" = "latest" ]; then
    # Try to find the latest version URL
    apiUrl="https://api.github.com/repos/${repo}/releases/latest"
    # Try to get JSON or exit on any failure
    response=`curl -fsSL "${apiUrl}"` || exit 1

    # Optional:
    # declare -A values; keys=(key1 key2)
    # json_decode "${response}" ${keys} ${values}
    # for k in ${keys[@]}...

    declare -A elements
    json_decode "${response}" ${elements}
    version=elements['tag_name']
    archiveUrl=elements['tarball_url']
else
    # Specific version URL
    #archiveUrl="https://github.com/${repo}/releases/download/${code}/${code}-${version}.tar.gz"
    archiveUrl="https://github.com/${repo}/archive/${version}.tar.gz"
fi

echo "The latest ${code} version is ${version} at ${archiveUrl}"

# Get source archive
codeDir="${code}-${version}"
archive="${codeDir}.tar.gz"
curl -o "${archive}" -fsSL "${archiveUrl}" || exit 1

exit 0;

# Unpack and remove archive file
tar xf "${archive}"
rm -f "${archive}"

# cd "${codeDir}"
