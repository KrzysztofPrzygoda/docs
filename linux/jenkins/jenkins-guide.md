# Jenkins Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference

- [Jenkins Documentation](https://www.jenkins.io/doc/)

## Installation

Follow [Jenkins Installation Guide](https://www.jenkins.io/doc/book/installing/linux/).

For **CentOS** you may use ready script [`jenkins-install-centos.sh`](jenkins-install-centos.sh) and:
```bash
$ sudo bash jenkins-install-centos.sh
```

## Update

TODO

## System Configuration

### Language

Install [**Locale Plugin**](https://plugins.jenkins.io/locale/):
1. *Manage Jenkins* > *Manage Plugins* > *Available* tab > *Search:* **Locale**
2. Check *Install* > Click *Install without restart*
3. *Manage Jenkins* > *Configure System* > *Locale* > Paste in *Default Language*: `Locale.ENGLISH` > Check *Ignore browser preference and force this language to all users* > *Save*

### Users

#### Create User

Go to *Manage Jenkins* > *Manage Users* > *Create User*

#### User Permissions

Setup **Global Permissions**:

1. Go to *Manage Jenkins* > *Configure Global Security* > *Authorization*

2. Enable *Project-based Matrix Authorization Strategy* > Click *Apply*

3. Click *Add user or group* > Provide *User or group name* > Click *OK*

4. Assign appropriate permissions to the user > Click *Apply*. You need to provide at least *Overall* = *Read* permission to let the user see anything meaningful.

Setup **Job Permissions**:

1. Go to your *Job* > *Configure*

2. Click *General* tab > Check *Enable project-based security*

3. Click *Add user or group* > Provide *User or group name* > Click *OK*

4. Assign appropriate permissions to the user > Click *Apply*

## SSH

### Setup

Install [**Publish Over SSH Plugin**](https://plugins.jenkins.io/publish-over-ssh/).

To add server, go to *Manage Jenkins* > *Configure System* > *Publish over SSH*.

## NodeJS

### Setup

Install [**NodeJS Plugin**](https://plugins.jenkins.io/nodejs/):

1. *Manage Jenkins* > *Manage Plugins* > *Available* tab > *Search:* **NodeJS**

2. Check *Install* > Click *Download now and install after restart*

3. Check *Restart Jenkins when installation is complete and no jobs are running*

4. Wait for Jenkins restart.

Setup **NodeJS Plugin**:

1. *Manage Jenkins* > *Global Tool Configuration* > *NodeJS* > Click *Add NodeJS*

2. Provide configuration *Name* = `node`

3. Check *Install automatically* > Click *Add Installer* > Choose *Install from nodejs.org*

4. Choose required *Version* > Click *Save*

### Usage

Setup your **Job**:

1. Go to *Job* > *Configure*

2. Click *Build Environment* tab > Check *Provide Node & npm bin/ folder to PATH* > Choose your configuration in *NodeJS Installation*

3. Click *Build* tab > Click *Add build step* > Choose *Execute shell* > Provide:
    ```bash
    node -v
    npm config ls
    # Check NodeJS version.
    
    rm -rf node_modules package-lock.json
    # Clear any existing dependencies to avoid module errors.

    npm install
    # Install project dependencies.

    npm run build
    # Build project.
    ```

> **NOTE ON APP DEPLOYMENT SERVER**  
> Keep in mind that Linux repositories mostly holds outdated packages. For the latest NodeJS package installation on your app server follow [NodeSource Node.js Binary Distributions](https://github.com/nodesource/distributions).

## Examples

### 1. NodeJS Example

#### Build Actions
Execute shell:
```bash
# Step: Build NodeJS Project

node -v
npm -v
npm config ls
# Check NodeJS version.

rm -rf node_modules package-lock.json
# Clear any existing dependencies to avoid module errors.

npm install
# Install project dependencies.

npm run build
# Build project.
```
Execute shell:
```bash
# Step: Create deploy package

deploy_file="deploy.zip"
exclude=".*"
# Exclude hidden files .git like.

pwd
# Show current dir.

rm -f ${deploy_file}
# Remove last deploy file.

zip -q -r ${deploy_file} ./ -x "${exclude}"
# Zip app files.
```
#### Post-build Actions
Send build artifacts over SSH:
```bash
# Step: Deploy package

deploy_file="deploy.zip"
app_dir="/var/www/nodejs1"

node -v
npm -v
npm config ls
# Check NodeJS version.

sudo kill -SIGTERM $(pidof node) >/dev/null 2>&1
# Stop current app.

sudo rm -rf ${app_dir}/{*,.*}
# Clear app dir including hidden files.

sudo unzip -q -o "${deploy_file}" -d "${app_dir}"
# Unzip new app and overwrite existing files.

rm -f ${deploy_file}
# Clear deployment files.

cd ${app_dir}
npm run start:prod > /dev/null 2>&1 &
# Run app in background.
```