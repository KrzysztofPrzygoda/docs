#!/bin/bash
#######################################
# Generates private CA (fake one) key/cert and SSL certificate for your site signed by your private CA.
# Output:
#   CA key    CA RSA key
#   CA pem    CA Certificate in PEM format
#   CA srl    CA Certificate serial number
#   Site key  RSA key
#   Site csr  Certificate Signing Request
#   Site ext  Certificate configuration information (x509v3_config)
#   Site crt  Certificate
#   Site pem  Certificate in PEM format
# Reference:
#   OpenSSL Manual  https://www.openssl.org/docs/manmaster/man5/
#   OpenSSL CookBook    https://www.feistyduck.com/books/openssl-cookbook/
#   Intro to Digital Certificates   https://www.youtube.com/watch?v=qXLD2UHq2vk
# Usage: sudo bash ssl-generate.sh [no-options]
#   no-options  [Optional] There are no options provided currently.
# Removes:
#   app-name    Nothing is removed.
# Installs:
#   app-name    Nothing is installed.
# Author:
#   (c) 2021 Krzysztof Przygoda, MIT License
#######################################
# TODO(author): Nothing to do.

# Configuration for CA
CA_name="myCA"
CA_subject="/C=US/ST=My CA State/L=My CA City/O=My CA Organization, Inc./OU=My CA Organization Unit/CN=myca.com"

# Configuration for site
site="domain.com"
site_subject="/C=PL/ST=My State/L=My City/O=My Organization, Inc./OU=My Organization Unit/CN=domain.com/E=me@gmail.com"
# X509 V3 certificate extension configuration format:
# https://www.openssl.org/docs/manmaster/man5/config.html
site_extention="
authorityKeyIdentifier = keyid, issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $site
DNS.2 = *.$site
"

## 1. Generate fake CA cert and key

openssl genrsa -out ${CA_name}.key 4096
# Generate CA key.

# openssl req -x509 -new -sha256 -days 1825 -key ${CA_name}.key -out ${CA_name}.pem -nodes
# Generate self-signed CA certificate.
openssl req -x509 -new -sha256 -days 1825 -key ${CA_name}.key -out ${CA_name}.pem -subj "${CA_subject}" -nodes
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

## 2. Generate site key

openssl genrsa -out ${site}.key 2048

## 3. Generate CSR for site cert

# openssl req -new -key ${site}.key -out ${site}.csr
# Prompts for organization info (subject).
# Enter relevant data to your domain here (see CA subject format above).
openssl req -new -key ${site}.key -out ${site}.csr -subj "${site_subject}"
# [Optional] One-liner with subject.

## 4. Prepare ext file with SSL cert extensions
echo "${site_extention}" > ${site}.ext

## 5. Generate site certificate using CA cert, CA key, site CSR and ext file
openssl x509 -req -days 825 -sha256 \
  -in ${site}.csr -extfile ${site}.ext \
  -CA ${CA_name}.pem -CAkey ${CA_name}.key -CAcreateserial \
  -out ${site}.crt

## 6. Convert to PEM in case when app requires PEM format
openssl x509 -in ${site}.crt -out ${site}.pem -outform PEM

## 7. Add fakeCA.pem certificate to your OS collection of Trusted Root Certification Authorities

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
# 1. Double-click the root CA certificate to open it in Keychain Access.
#    The root CA certificate appears in login.
# 2. Copy the root CA certificate to System.
#    You must copy the certificate to System to ensure that it is trusted by all users and local system processes.
# 3. Open the root CA certificate, expand Trust, select Use System Defaults, and save your changes.
# 4. Reopen the root CA certificate, expand Trust, select Always Trust, and save your changes.
# 5. Delete the root CA certificate from login.

## 8. On your client machine add your site domain to the hosts file
# Add line:
# <your host IP> domain.com
# Windows: `C:\Windows\System32\drivers\etc\hosts`
