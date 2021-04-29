# SSL Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## PKI

- Root Certificate Authority (CA) > Intermediate CA > Digital Certificate
- Revocation Services (CRL, OCSP)

## 1. Create your own CA certificate
```bash
$ openssl genrsa -out myCA.key 4096
# Generate CA private key.
$ openssl req -x509 -new -nodes -key myCA.key -sha256 -days 1825 -out myCA.pem
# Generate CA self-signed certificate.
$ openssl x509 -in myCA.pem -text -noout
# View certificate.
```

## 2. Create CSR for your domain
```bash
$ openssl genrsa -out my.domain.com.key 2048
# Generate site private key.
$ openssl req -new -key my.domain.com -out my.domain.com.csr
# Generate CSR for site certification.
```
Prepare ext file with SSL cert extensions:
```bash
$ nano my.domain.com.ext
```
And paste content:
```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = my.domain.com
DNS.2 = my2.domain.com
```

## 3. Create SSL certificate for your domain
```bash
$ openssl x509 -req -in my.domain.com.csr -CA myCA.pem -CAkey myCA.key -CAcreateserial -out my.domain.com.crt -days 825 -sha256 -extfile my.domain.com.ext
# Generate site certificate (CRT) signed by your own CA, using CA cert, CA key, site CSR and site ext file.
```
Sometimes you may need to convert yuor site cert to PEM format in case when app requires it:
```bash
$ openssl x509 -in my.domain.com.crt -out my.domain.com.pem -outform PEM
# Convert CRT to PEM format.
```

## 4. Add your CA to OS
Now you need to add myCA.pem certificate to your OS collection of Trusted Root Certification Authorities.

### Windows
Follow [Microsoft instruction](https://docs.microsoft.com/en-us/skype-sdk/sdn/articles/installing-the-trusted-root-certificate):
1. Launch **MMC** (mmc.exe).
2. Choose **File** > **Add/Remove Snap-ins**.
3. Choose **Certificates**, then choose **Add**.
4. Choose **My user account**.
5. Choose **Add** again and this time select **Computer Account**.
6. Move the new certificate from the  
   **Certificates-Current User** > **Trusted Root Certification Authorities**  
   into  
   **Certificates (Local Computer)** > **Trusted Root Certification Authorities**.
7. Relaunch your browser(s) or even you may need to restart OS to  changes take effect.

## 5. Add your domain to hosts
If your domain does not exist in DNS, you may add it to the hosts file on your client machine. 

Windows: `C:\Windows\System32\drivers\etc\hosts`

```bash
# My domain
<your host IP> my.domain.com
```
