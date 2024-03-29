# Synology Nginx Guide

Author: Krzysztof Przygoda, 2022

## Reference

[CloudFlare Reverse Proxy]: https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/

- Based on Synology DSM v7.1
- Synology [Reverse Proxy setup](https://kb.synology.com/en-us/DSM/help/DSM/AdminCenter/system_login_portal_advanced?version=7).
- CloudFlare [What is a Reverse Proxy?][CloudFlare Reverse Proxy]
- CloudFlare [Network ports](https://developers.cloudflare.com/fundamentals/get-started/reference/network-ports/)
- CloudFlare [Proxies' IP Ranges](https://www.cloudflare.com/en-gb/ips/)
- Nginx [Configuring Logging](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/)

## Reverse Proxy

There are several benefits of using Reverse Proxy described in [Cloudflare guide][CloudFlare Reverse Proxy]. One of them is presented below.

When you expose one or more apps to the Internet (*Docker* containers or native app like *VPN Plus Server*), typically you need to forward ports on your router to access them. For example:

- App 1: `https://domain.com:8080` > `10.10.10.10:8069`,
- App 2: `https://domain.com:8088` > `10.10.10.10:5050`,
- App 3: `https://domain.com:443` > `10.10.10.10:443`,

where `10.10.10.10` is your Synology LAN IP.

With Reverse Proxy it is possible to change this scenario to (sub)domain forwarding, exposing only one port (here `443`):

- App 1: `https://app1.domain.com` > `10.10.10.10:8069`,
- App 2: `https://app2.domain.com` > `10.10.10.10:5050`,
- App 3: `https://anotherdomain.com` > `10.10.10.10:443`.

To setup Synology Reverse Proxy follow steps below.

### 1. Setup access profile

Prepare `Control Panel` > `Login Portal` > `Advanced` > `Access Control Profile` if you need other than default public access to your application.

### 2. Setup an application

Go to `Control Panel` > `Login Portal` > `Advanced` > `Reverse Proxy` > `Create`.

#### General

- Source > Protocol: `HTTPS`
- Source > Hostname: your domain FQDN like `app.domain.com`
- Source > Port: `443`
- Source > Enable HSTS: `Yes`
- Source > Access control profile: `Not configured` for public access or choose your custom profile.
- Destination > Protocol: `HTTP` or `HTTPS` depending on your needs.
- Destination > Hostname: `IP` or FQDN of your app (machine, docker conatiner etc.)
- Destination > Port: `Port` of your app.

#### Custom headers

These are optional and may be required to setup in some cases like these:

- mixed content SSL error,
- tracking original client IP, etc.

Some of them are:

```
X-Forwarded-Host: $host
X-Forwarded-For: $remote_addr
X-Real-IP: $remote_addr
```

> NOTICE: More info about headers on [Nginx: Using the Forwarded header](https://www.nginx.com/resources/wiki/start/topics/examples/forwarded/). `X-Forwarded-For` header security consideretions on [sekurak.pl](https://sekurak.pl/naglowek-x-forwarded-for-problemy-bezpieczenstwa/) (Polish language only).

Add `Create` > `WebSocket` headers if your application uses [WebSocket](https://en.wikipedia.org/wiki/WebSocket) protocol (Synology will add ready to use header entries).

#### Advanced Setting

Adjust them to your liking. You may leave defaults.

### 3. Setup routing

- You need to forward port `443` and `80` (for *Let's Encrypt* cert creation) on your router to your DSM machine with Reverse Proxy configured.
- At the same time open corresponding ports on DSM `Control Panel` > `Security` > `Firewall` > `Edit Rules`.
- You may also need to add [CloudFlare proxy servers' IPs](https://www.cloudflare.com/ips/) to your DSM `Control Panel` > `Security` > `Trusted Proxies` (both IPv4 and IPv6 addresses).

### 4. Setup SSL certificate

#### 4.1. Add certificate

Go to `Control Panel` > `Security` > `Certificate` > `Add`.

Create one or import existing one.

For *Let's Encrypt* follow [How do I obtain a certificate from Let's Encrypt on my Synology NAS?](https://kb.synology.com/en-me/DSM/tutorial/How_to_enable_HTTPS_and_create_a_certificate_signing_request_on_your_Synology_NAS)

> Notice that Synology does not support *Let's Encrypt* wildcard certificates creation. Thus, perhaps, you are forced to create separate cert for every subdomain you need. Anyway, while getting your own *Let's Encrypt* certificate for particular subdomain, remember to paste its FQDN (e.g. app.domain.com) into `Domain name` as well as into `Subject Alternative Name` (SAN).

For `Proxied` domains you may use `CloudFlare Origin Certificate` created and downloaded from CloudFlare. This way CF covers wildcard certificate for client and you don't have to create dedicated any more for new apps (just use the same orgin cert for every app at Reverse Proxy).

#### 4.2. Map certificate with the app

Go to `Control Panel` > `Security` > `Certificate` > `Settings` and map your app (its domain) with certificate.

## CloudFlare

### Reverse Proxy behind CloudFlare

You need to remember that CF, according to `Your SSL/TLS encryption mode` option, by default (and for free) always communicates with your origin server on port:

- `80` for either `Off` or `Flexible` mode,
- `443` for either `Full` or `Full (strict)` mode. 

So, if your app is set on port `443` at your Reverse Proxy, it will never be accessible via CloudFlare `Proxied` (sub)domain in `Off` or `Flexible` encryption mode until you switch this (sub)domain to `DNS only` proxy status, i.e. when CloudFlare is bypassed and your origin server is directly exposed to the client. But this setup also requires valid CA certificate (e.g. issued by *Let's Encrypt*) to be installed directly on your Reverse Proxy (CloudFlare Origin Certificate won't work here because it is not a part of Public Key Infrastructure and publicly recognized as secure).

> Note that only `Full (strict)` encryption mode prevents you from the Man-In-The-Middle (MITM) attacks.

### Multi-level subdomains

Unfortunately, only first level `Proxied` subdomains like `app.domain.com` are covered by universal (free) certificate.
Subdomains like `my.app.domain.com` requires `DNS only` proxy status on free account or purchase of the **Advanced Certificate Manager to use Total TLS for full certificate coverage of proxied hostnames.

## Logging

For debug purposes you may need to know what's coming from CloudFlare to your Synology Reverse Proxy.
The easiest way is to modify Nginx config template.

Go to `Control Panel` > `Terminal & SNMP` > `Terminal` > `Enable SSH service`: `Yes` (remember to disable it when you finish).

```bash
$ ssh <user-admin>@<dsm-ip>
# Login to DSM SSH using your admin account.
```

### Error Log

```bash
$ sudo tail -F /var/log/nginx/error.log
# Monitor error log.
```

### Access Log

By default Synology Nginx access log is off. See [Custom Log](#custom-log) section below to enable it.

### Custom Log

```bash
$ sudo vim /usr/syno/share/nginx/nginx.mustache
# Edit config template. Provide admin password if asked.
```

See [vim cheetsheet](https://devhints.io/vim) for editing hints.

Add your custom log config under default one (look for `access_log  off;` line).

Custom log config example:

```nginx
    #<KPrzygoda> Custom access log
    access_log  on;

    #Set custom log format
    log_format  accesslog  '$remote_addr - $remote_user [$time_local] $server_name|$host:$server_port "$request" '
        '$status $body_bytes_sent "$http_referer" '
    
    #Exclude traffic from ports started with 10
    map $server_port $loggable {
        ~^10 0;
        default 1;
    }

    #Add log entries to the local Log Center app
    access_log  syslog:server=127.0.0.1:514,facility=local7,tag=nginx_access accesslog if=$loggable;
    #</KPrzygoda>
```

To apply new config:

```bash
$ sudo synosystemctl restart nginx
# Restart Nginx webserver.
```
