#!/bin/bash
#######################################
# Install Jenkins on CentOS
# Reference:
#   Installing Jenkins https://www.jenkins.io/doc/book/installing/linux/
# Usage: sudo bash jenkins-install.sh [no-options]
#   no-options    [Optional] There are no options provided currently.
# Removes:
#   app-name    Nothing is removed.
# Installs:
#   jenkins    Nothing is installed.
# Author:
#   (c) 2021 Unknown, MIT License
#######################################
# TODO(author): Nothing to do.

# Install tools
sudo yum install wget

# Install Jenkins (weekly release)
sudo wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat/jenkins.io.key
sudo yum upgrade
sudo yum install jenkins java-1.8.0-openjdk-devel
sudo systemctl daemon-reload

# Start Jenkins
sudo systemctl start jenkins
# Check status
sudo systemctl status jenkins

# Firewall setup
# If you have a firewall installed, you must add Jenkins as an exception.
# You must change YOURPORT in the script below to the port you want to use. 
# Port 8080 is the most common.
echo -n "Setup firewall [y/N]: "
read fw

if [ "y" == "$fw" ]; then
    echo -n "Enter port number [8080 is default]: "
    read port
    YOURPORT=${port:-8080}
    PERM="--permanent"
    SERV="$PERM --service=jenkins"

    firewall-cmd $PERM --new-service=jenkins
    firewall-cmd $SERV --set-short="Jenkins ports"
    firewall-cmd $SERV --set-description="Jenkins port exceptions"
    firewall-cmd $SERV --add-port=$YOURPORT/tcp
    firewall-cmd $PERM --add-service=jenkins
    firewall-cmd --zone=public --add-service=http --permanent
    firewall-cmd --reload
fi