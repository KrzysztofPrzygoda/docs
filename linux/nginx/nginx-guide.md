# nginx Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Install

```bash
$ sudo apt update
$ sudo apt install -y nginx
```

## Configuration

### Reference

#### Docs
- [Config pitfalls](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/)
- [Full example configuration](https://www.nginx.com/resources/wiki/start/topics/examples/full/)
- [Server block examples](https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/)
- [SSL termination](https://docs.nginx.com/nginx/admin-guide/security-controls/terminating-ssl-http/)

#### Guides
- [Improve your Nginx SSL configuration](https://scaron.info/blog/improve-your-nginx-ssl-configuration.html)
- [Self-Signed certificate configuration](https://www.techrepublic.com/article/how-to-enable-ssl-on-nginx/)

### Deploy SSL
```bash
$ sudo cp domain.com.crt /etc/ssl/certs/
# Copy cert
$ sudo cp domain.com.key /etc/ssl/private/
# Copy private key
```

### Create Config

Create new config named `mysite` by duplicating `default` one:
```bash
$ cd /etc/nginx/sites-available
$ sudo cp default mysite
```

Edit `/etc/nginx/sites-available/mysite` config:
```bash
server {
	listen 443 ssl;
	listen [::]:443 ssl;

    ssl_certificate     /etc/ssl/certs/domain.com.crt;
    ssl_certificate_key /etc/ssl/private/domain.com.key;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;

	server_name domain.com;

	root /var/www/html/mysite;
	index index.html;

	location / {
		try_files $uri $uri/ =404;
	}
}
```

### Check Config

```bash
$ sudo nginx -t
# Check server configuration syntax.
```

### Enable Config

Disable `default` site and enable `mysite`:
```bash
$ cd /etc/nginx/sites-enabled
$ sudo rm default
# Remove symbolic link to the default config
$ sudo ln -s /etc/nginx/sites-available/mysite
# Create symlink to your site config
```

## Control

```bash
$ systemctl status nginx
# Show server service status.
$ sudo systemctl restart nginx
# Restart server service.
```

