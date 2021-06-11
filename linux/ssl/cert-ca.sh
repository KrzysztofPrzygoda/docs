#!/bin/bash
#######################################
# Generates private CA (fake one) key/cert.
# Output:
#   CA key    CA RSA key
#   CA pem    CA Certificate in PEM format
# Reference:
#   OpenSSL Manual  https://www.openssl.org/docs/manmaster/man5/
#   OpenSSL CookBook    https://www.feistyduck.com/books/openssl-cookbook/
#   Intro to Digital Certificates   https://www.youtube.com/watch?v=qXLD2UHq2vk
# Usage: sudo bash cert-ca.sh [ca-name] [ca-subject]
#   ca-name     [Optional] Certificate Authority (CA) key filename (without ext). Default: bitsomod.ca
#   ca-subject  [Optional] CA information (subject). Default: look into the script for ca_subject var.
# Removes:
#   app-name    Nothing is removed.
# Installs:
#   app-name    Nothing is installed.
# Author:
#   (c) 2021 Krzysztof Przygoda, MIT License
#######################################
# TODO(author): Nothing to do.

## 1. Configuration for CA

ca_name=${1:-"bitsmodo.ca"}
# Certificate Authority key filename (without ext).

ca_subject=${2-"/C=PL/ST=My State/L=My City/O=BitsModo, Inc./OU=My Organization Unit/CN=bitsmodo.com/emailAddress=hello@bitsmodo.com"}
# CA information (subject).

## 2. Generate fake CA cert and key

openssl genrsa -out ${ca_name}.key 4096
# Generate CA key.

# openssl req -x509 -new -sha256 -days 1825 -key ${ca_name}.key -out ${ca_name}.pem -nodes
# Generate self-signed CA certificate.
openssl req -x509 -new -sha256 -days 1825 -key ${ca_name}.key -out ${ca_name}.pem -subj "${ca_subject}" -nodes
# [Optional] Generate self-signed CA certificate one-liner with subject.
# -nodes option turns off cert encription

# Prompts for organization info (subject).
# Enter whatever you want but later you may want to identify this cert in OS.
# So, it's good to enter something recognizable (org name at least like: My Own CA).
# Example:
# C = US
# ST = My CA State
# L = My CA City
# O = My CA Organization, Inc.
# OU = My CA Organization Unit
# CN = myca.com
# emailAddress = me@myca.com

## 3. Add fakeCA.pem certificate to your OS collection of Trusted Root Certification Authorities

# Windows: https://docs.microsoft.com/en-us/skype-sdk/sdn/articles/installing-the-trusted-root-certificate
# 1. Launch MMC (mmc.exe).
# 2. Choose File > Add/Remove Snap-ins.
# 3. Choose Certificates, then choose Add.
# 4. Choose My user account.
# 5. Choose Add again and this time select Computer Account.
# 6. Move the new certificate from the
#    Certificates-Current User > Trusted Root Certification Authorities
#    into
#    Certificates (Local Computer) > Trusted Root Certification Authorities.
# 7. Relaunch your browser(s) or even you may need to restart OS to changes take effect.

# macOS
# 1. Double-click the root CA certificate (.pem or .key) to open it in Keychain Access.
#    The root CA certificate appears in login (or iCloud).
# 2. Copy the root CA certificate to System.
#    You must copy the certificate to System to ensure that it is trusted by all users and local system processes.
# 3. Open the root CA certificate, expand Trust, select Use System Defaults, and save your changes.
# 4. Reopen the root CA certificate, expand Trust, select Always Trust, and save your changes.
# 5. Delete the root CA certificate from login.

## 8. On your client machine add your site domain to the hosts file
# Add line:
# <your host IP> domain.com
# Windows: `C:\Windows\System32\drivers\etc\hosts`
