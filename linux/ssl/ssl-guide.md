# SSL Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference
- X.509: [RFC5280](https://tools.ietf.org/html/rfc5280) (version 3) standard from the International Telecommunication Union for [PKI]((#Public-Key-Infrastructure-PKI)). Among other things, it defines the format for public key certificates.
- [OpenSSL Documentation](https://www.openssl.org/docs/). OpenSSL is a cryptography toolkit. Contains many subcommands, each with a manpage of its own e.g. `ca(1)`, `req(1)` , `x509(1)`.
- [OpenSSL CookBook](https://www.feistyduck.com/library/openssl-cookbook/): A Short Guide to the Most Frequently Used OpenSSL Features and Commands By Ivan Ristić.

Some similar guides:
- [simba.com](https://www.simba.com/products/SEN/doc/Client-Server_user_guide/content/clientserver/configuringssl/signingca.htm): Generating a Certificate Authority (CA) Certificate for Self-Signing.
- [gist.github.com/Soarez](https://gist.github.com/Soarez/9688998): How to setup your own CA with OpenSSL.

## Problem

If you don't need commercial SSL certificate (like in development or for private purposes), you may create self-signed one. But then browsers will warn you that cert is unrecognized and will impair access to the system secured with self-signed cert.

## Solution

The solution to the above problem is to follow *Public Key Infrastructure* scheme (see [PKI section](#Public-Key-Infrastructure-PKI) at the end for explanation) and create your own [Chain of Trust](#Chain-of-Trust-CoT):
1. Create your own *Certificate Authority* (CA) and add its certificate to your OS *Trusted Root Certification Authorities* database.
2. Then sign your every SSL certificate with your own CA certificate.

In short, instead of self-signed cert you use signed one, but by your own CA, which you need to add manually to Trusted CAs on your OS database.

That's it. Just follow the steps below or download [`ssl-generate.sh`](ssl-generate.sh) script file:
```bash
$ wget https://github.com/KrzysztofPrzygoda/docs/raw/master/linux/ssl/ssl-generate.sh
# or
$ curl -fsSOL https://github.com/KrzysztofPrzygoda/docs/raw/master/linux/ssl/ssl-generate.sh
```

### 1. Create your own CA certificate

```bash
$ openssl genrsa -out myCA.key 4096
# Generate CA private key.
# Add -des3 option for extra password protection.

# WARNING NOTICE!
# This is the key used to sign the certificate requests.
# Anyone holding this can sign certificates on your behalf.
# So keep it in a safe place!
```
```bash
$ openssl req -x509 -new -nodes -key myCA.key -sha256 -days 1825 -out myCA.pem
# Generate self-signed CA certificate.

# You will be prompted for Subject (organization info).
# Enter whatever you want but meaningful info will help you later to identify this cert in OS.
# To automate input, you can add -subj option to the above command with Distinguish Names (DN):

$ openssl req -x509 -new -nodes -key myCA.key -sha256 -days 1825 -out myCA.pem \
    -subj "/C=US/ST=My CA State/L=My CA City/O=My CA Organization, Inc./OU=My CA Organization Unit/CN=myca.com"
# [Optional] Generate self-signed CA certificate one-liner with subject.
```
OpenSSL uses the information you specify to compile a X.509 certificate using the information prompted to the user, the public key that is extracted from the specified private key which is also used to generate the signature.

Example of **Distinguished Names** (DN), defined in [RFC1779](https://tools.ietf.org/html/rfc1779):
```bash
C = US
ST = My CA State
L = My CA City
O = My CA Organization Name, Inc.
OU = My CA Organization Unit
CN = myca.com
```
```bash
$ openssl x509 -text -noout -in myCA.pem
# View certificate.
```

### 2. Create CSR for your domain

```bash
$ openssl genrsa -out my.domain.com.key 2048
# Generate site private key.
```
Now you can use [`ssl.conf`](ssl.conf) file, where full CSR setup is done, and generate it with:
```bash
$ openssl req -new -out my.domain.com.csr -config ssl.conf
# Generate CSR for site certification with configuration file.
```
Or you can follow next steps manually with certificate extention file:
```bash
$ openssl req -new -key my.domain.com -out my.domain.com.csr
# Generate CSR for site certification.
# You will be prompted for Subject (organization info).
# Provide meaningful information here.
# You may skip (press ENTER) when asked for challenge password and optional company name.

# To automate input, you can add -subj option to the above command:
$ openssl req -new -key my.domain.com -out my.domain.com.csr \
    -subj "/C=PL/ST=My State/L=My City/O=My Organization, Inc./OU=My Organization Unit/CN=domain.com/emailAddress=me@gmail.com"
# [Optional] Generate CSR for site certification one-liner with subject.
```
Prepare ext file with SSL cert extension (X.509v3):
```bash
$ nano my.domain.com.ext
```
And paste following content:
```
authorityKeyIdentifier = keyid, issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = my.domain.com
DNS.2 = my2.domain.com
```
For more detailed info refer to `[ v3_req ]` section in `/etc/ssl/openssl.cnf` file.
You may also sign any subdomain with asterisk `*`:
```
[alt_names]
DNS.1 = domain.com
DNS.2 = www.domain.com
DNS.3 = *.domain.com
DNS.4 = *.my.domain.com
```

### 3. Create SSL certificate for your domain

```bash
$ openssl x509 -req -days 825 -sha256 \
    -in my.domain.com.csr \
    -CA myCA.pem -CAkey myCA.key -CAcreateserial \
    -out my.domain.com.crt \
    -extfile my.domain.com.ext
# Generate site certificate (CRT) signed by your own CA,
# using: CA cert, CA key, site CSR and site ext file.
# Skip -extfile option if you've used ssl.conf file to create CSR.
```
> **Certificate Serial Number**  
> Each issued certificate must contain a unique serial number assigned by the CA. It must be unique for each certificate given by a given CA. OpenSSL keeps the used serial numbers on a file (by default it has the same name as the CA certificate file with the extension replaced by srl). So a file named `myCA.srl` is created here too.
```bash
$ openssl verify -CAfile myCA.pem my.domain.com.crt
# [Optional] Verify site cert with CA cert.
```
Sometimes you may need to convert your site cert to PEM format in case when app requires it:
```bash
$ openssl x509 -in my.domain.com.crt -out my.domain.com.pem -outform PEM
# [Optional] Convert CRT to PEM format.
```

### 4. Add your CA certificate to OS database

Now you need to add `myCA.pem` certificate to your OS collection of Trusted Root Certification Authorities (TRCA).

Bear in mind that some apps (e.g. Firefox browser) may hold their own (OS independent) TRCA database.

#### Windows

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
7. Relaunch your browser(s) or even you may need to restart OS to make changes to take effect.

#### macOS

1. Double-click the root CA certificate to open it in **Keychain Access**. The root CA certificate appears in **login**.
2. Copy the root CA certificate to **System**. You must copy the certificate to System to ensure that it is trusted by all users and local system processes.
3. Open the root CA certificate, expand **Trust**, select **Use System Defaults**, and save your changes.
4. Reopen the root CA certificate, expand **Trust**, select **Always Trust**, and save your changes.
5. Delete the root CA certificate from **login**.

### 5. Add your domain to `hosts` file
If your domain does not exist in DNS system, you may add it to the `hosts` file on your client machine to resolve IP of the host that is meant to be pointed by the domain. 

Windows: `C:\Windows\System32\drivers\etc\hosts`

```bash
# My domain
<your host IP> my.domain.com
```

# Public Key Infrastructure (PKI)

The dual role of the certificates that forms the foundation of the PKI is to:
- encrypt communications,
- authenticate the identity of the certificate owner. 

## Chain of Trust (CoT)

Typical CoT looks like this:

`Root CA > [Intermediate CA >] Digital Certificate`

where:

- `Root CA` has self-signed certificate (it's inherently trusted).
- `Intermediate CA` has certificate signed by `Root CA`, but it's optional in CoT.
- Your `Digital Certificate` is signed by `Intermediate CA`.

## Revocation Services (CRL, OCSP)

Refer to [keyfactor.com](https://blog.keyfactor.com/certificate-revocation-list-crl-ocsp) for more details.

Every certificate has a finite validity period, which as of September 1st, 2020 is set to 13 months. However, during that validity period, a certificate owner and/or CA that issued the certificate may declare it is no longer trusted. In these unfortunate cases, the untrusted certificates need to be revoked and users need to be informed. This is done by adding the untrusted TLS/SSL certificate to a Certificate Revocation List (CRL).

### Certificate Revocation List (CRL)

The CA Security Council [defines](https://casecurity.org/2013/03/08/the-importance-of-checking-for-certificate-revocation/) a CRL as *“a digitally-signed file containing a list of certificates that have been revoked and have not yet expired.”* The digital signature of the CRL files by the issuing CAs is important to prove the authenticity of the file and to prevent tampering.

[RFC 5280](https://tools.ietf.org/html/rfc5280) describes a CRL as *“a time-stamped and signed data structure that a certificate authority (CA) or CRL issuer periodically issues to communicate the revocation status of affected digital certificates.”*

Depending on a CAs internal policies, CRLs are published on a regular periodic basis which might be hourly, daily, or weekly. The status of a certificate in the CRL can be either “revoked,” when it has been irreversibly revoked, or “hold” when it is temporarily invalid.

The format of a CRL is defined in the X.509 standard and in RFC 5280. Each entry in a Certificate Revocation List includes the identity of the revoked certificate and the revocation date. Optional information includes a time limit, if the revocation applies for a specific time period, and a reason for the revocation.

### Online Certificate Status Protocol (OCSP)

Instead of downloading the latest CRL and parsing it to check whether a requested certificate on the list, the browser requests the status for a particular certificate from the issuing CA's revocation server.

Using the certificate's serial number (srl), the OCSP service checks for certificate status, then the CA replies with a digitally signed response containing the certificate status. An OCSP response contains one of three values: “good”, “revoked”, or “unknown”. OCSP responses are smaller than CRL files and are suitable for devices with limited memory.

#### OSCP Stapling

OCSP stapling is an enhancement to the standard OCSP protocol and is defined in [RFC 6066](https://tools.ietf.org/html/rfc6066). Enabling OCSP stapling eliminates the need for a browser to send OCSP requests directly to the CA. Instead, the web server caches the OSCP response from the CA and when a TLS handshake is initiated by the client, the web server “staples” the OSCP response to the certificate it sends to the browser.
