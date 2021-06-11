#!/bin/bash
#######################################
# Generates private CA (fake one) key/cert and SSL certificate for your site signed by your private CA.
# Output:
#   Site key  RSA key
#   Site csr  Certificate Signing Request
#   Site ext  Certificate configuration information (x509v3_config)
#   Site crt  Certificate
#   Site pem  Certificate in PEM format
#   CA srl    CA Certificate serial number for site certificate
# Reference:
#   OpenSSL Manual  https://www.openssl.org/docs/manmaster/man5/
#   OpenSSL CookBook    https://www.feistyduck.com/books/openssl-cookbook/
#   Intro to Digital Certificates   https://www.youtube.com/watch?v=qXLD2UHq2vk
# Usage: sudo bash cert-ssl.sh [site] [ca-name]
#   site     [Optional] Your domain name (2nd level). Default: bitsmodo.dev
#   ca-name  [Optional] Certificate Authority (CA) key filename (without ext). Defaulr: bitsmodo.ca
# Removes:
#   app-name    Nothing is removed.
# Installs:
#   app-name    Nothing is installed.
# Author:
#   (c) 2021 Krzysztof Przygoda, MIT License
#######################################
# TODO(author): Split into two separate scripts: for CA and for site cert.

## 1. Configuration

site=${1:-"bitsmodo.dev"}
# Your domain name (2nd level).

ca_name=${2:-"bitsmodo.ca"}
# Certificate Authority key filename (without ext).

site_subject="/C=PL/ST=My State/L=My City/O=My Organization, Inc./OU=My Organization Unit/CN=${site}/emailAddress=me@${site}"
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
  -CA ${ca_name}.pem -CAkey ${ca_name}.key -CAcreateserial \
  -out ${site}.crt

## 6. Convert to PEM in case when app requires PEM format

openssl x509 -in ${site}.crt -out ${site}.pem -outform PEM

## 7. On your client machine add your site domain to the hosts file

# Add line:
# <your host IP> domain.com
# Windows: `C:\Windows\System32\drivers\etc\hosts`
