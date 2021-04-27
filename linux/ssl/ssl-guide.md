# SSL Guide

## PKI
- Root Certificate Authority (CA)
- Intermediate CA
- Revocation Services (CRL, OCSP)
- Digital Certificate

## 1. Generate CA cert and key
```bash
$ openssl genrsa -out testCA.key 4096
# Generate key.
$ openssl req -x509 -new -nodes -key testCA.key -sha256 -days 1825 -out testCA.pem
# Generate certificate.
$ openssl x509 -in testCA.pem -text -noout
# View certificate.
```

## 2. Generate site key
```bash
$ openssl genrsa -out my.organization.com.key 2048
```

## 3. Generate CSR for site cert
```bash
$ openssl req -new -key my.organization.com -out my.organization.com.csr
```

## 4. Prepare ext file with SSL cert extensions
```bash
$ nano my.organization.com.ext
```
And paste content:
```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = my.organization.com
DNS.2 = my2.organization.com
```

## 5. Generate site certificate using CAcert, CA key, site CSR and ext file
```bash
$ openssl x509 -req -in my.organization.com.csr -CA testCA.pem -CAkey testCA.key -CAcreateserial -out my.organization.com.crt -days 825 -sha256 -extfile my.organization.com.ext
```

## 6. Convert to PEM in case when app requires PEM format
```bash
$ openssl x509 -in my.organization.com.crt -out my.organization.com.pem -outform PEM
```
