#!/bin/bash
#######################################
# Generate keys and SSL certificate for CA and site:
#   CA key    CA RSA key
#   CA pem    CA Certificate in PEM format
#   CA srl    ?
#   Site key  RSA key
#   Site csr  Certificate Signing Request
#   Site ext  Certificate information
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

CA_name="testCA"
site="my.organization.com"
site_extention="
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = my.organization.com
DNS.2 = my2.organization.com
"

# country="PL"
# state="dolnoslaskie"
# city="Wroclaw"
# org_name="Company Name"
# org_unit="Company Section"
# common_name="my.organization.com" # FQDN or YOUR name
# email="my.email@organization.com"

## 1. Generate CA cert and key
openssl genrsa -out ${CA_name}.key 4096
# Generate CA key.
openssl req -x509 -new -nodes -key ${CA_name}.key -sha256 -days 1825 -out ${CA_name}.pem
# Generate CA certificate. Asks for organization info.

# openssl x509 -in ${CA_name}.pem -text -noout
# View CA certificate.

## 2. Generate site key
openssl genrsa -out ${site}.key 2048

## 3. Generate CSR for site cert
openssl req -new -key ${site}.key -out ${site}.csr
# Asks for organization info.

## 4. Prepare ext file with SSL cert extensions
echo ${site_extention} > ${site}.ext

## 5. Generate site certificate using CA cert, CA key, site CSR and ext file
openssl x509 -req -in ${site}.csr -CA ${CA_name}.pem -CAkey ${CA_name}.key -CAcreateserial -out ${site}.crt -days 825 -sha256 -extfile ${site}.ext

## 6. Convert to PEM in case when app requires PEM format
openssl x509 -in ${site}.crt -out ${site}.pem -outform PEM
