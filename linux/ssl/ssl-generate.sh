#!/bin/bash
#######################################
# Generate keys and SSL certificate for fake CA and site:
#   CA key    CA RSA key
#   CA pem    CA Certificate in PEM format
#   CA srl    CA Certificate serial number
#   Site key  RSA key
#   Site csr  Certificate Signing Request
#   Site ext  Certificate configuration information
#   Site crt  Certificate
#   Site pem  Certificate in PEM format
# Reference:
#   Intro to Digital Certificates https://www.youtube.com/watch?v=qXLD2UHq2vk
# Usage: sudo bash ssl-generate.sh [no-options]
#   no-options    [Optional] There are no options provided currently.
# Removes:
#   app-name    Nothing is removed.
# Installs:
#   app-name    Nothing is installed.
# Author:
#   (c) 2021 Krzysztof Przygoda, MIT License
#######################################
# TODO(author): Nothing to do.

# Config example: https://www.switch.ch/pki/manage/request/csr-openssl/
CA_name="fakeCA"
site="domain.com"
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
openssl req -x509 -new -key ${CA_name}.key -sha256 -days 1825 -out ${CA_name}.pem -nodes
# Generate self-signed CA certificate.
# Asks for organization info.
# Enter whatever you want but later you may want to identify this cert in OS.
# So, it's good to enter something recognizable (org name at least like: My Own CA).

## 2. Generate site key
openssl genrsa -out ${site}.key 2048

## 3. Generate CSR for site cert
openssl req -new -key ${site}.key -out ${site}.csr
# Asks for information.
# Enter relevant data to your domain here:
# country="PL"
# state="dolnoslaskie"
# city="Wroclaw"
# org_name="Company Name"
# org_unit="Company Section"
# common_name="my.organization.com" # FQDN or YOUR name
# email="my.email@organization.com"

## 4. Prepare ext file with SSL cert extensions
echo "${site_extention}" > ${site}.ext

## 5. Generate site certificate using CA cert, CA key, site CSR and ext file
openssl x509 -req -in ${site}.csr -CA ${CA_name}.pem -CAkey ${CA_name}.key -CAcreateserial -out ${site}.crt -days 825 -sha256 -extfile ${site}.ext

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
# 7. Relaunch your browser(s) or even you may need to restart OS to get changes.

## 8. On your client machine add your site domain to the hosts file
# Add line:
# <your host IP> domain.com
# Windows: `C:\Windows\System32\drivers\etc\hosts`:
