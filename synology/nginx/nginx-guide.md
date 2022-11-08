# Synology Nginx Guide

Author: Krzysztof Przygoda, 2022

## Reference
- Nginx [Configuring Logging](https://docs.nginx.com/nginx/admin-guide/monitoring/logging/)

## Reverse Proxy
@todo Author

## CloudFlare

### Reverse Proxy behind CloudFlare
You need to remember that CF, according to `Your SSL/TLS encryption mode` option, always communicates with your origin server on port:
- `80` for either `Off` or `Flexible` mode,
- `443` for either `Full` or `Full (strict)` mode. 

So, if your app is set on port `443` at your Reverse Proxy, it will never be accessible via CloudFlare `Proxied` (sub)domain in `Off` or `Flexible` encryption mode. This setup works with `DNS only` (sub)domain proxy status, i.e. when your origin server is directly exposed to the client browser.

### Multi-level subdomains
Unfortunately, only first level `Proxied` subdomains like `app.domain.com` are covered by universal (free) certificate.
Subdomains like `my.app.domain.com` requires `DNS only` proxy status or purchase of the Advanced Certificate Manager to use Total TLS for full certificate coverage of proxied hostnames.

## Logging

```bash
$ sudo vim /usr/syno/share/nginx/nginx.mustache
# Edit config template.
```

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
```bash
$ sudo synosystemctl restart nginx
# Restart Nginx webserver.
```
