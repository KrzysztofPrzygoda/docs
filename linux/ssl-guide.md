# SSL Guide

Root Certificate Authority (CA)
Intermediate CA
Revocation Services (CRL, OCSP)
Digital Certificate

1 Generate CA cert and key
```bash
$ openssl genrsa -out testCA.key 4096
$ openssl req -x509 -new -nodes -key testCA.key -sha256 -days 1825 -out testCA.pem
```
