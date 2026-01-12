# Maintenance Mode

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REMOTE_ADDR} !^192\.168\.0\.0
    RewriteCond %{REMOTE_ADDR} !^127\.0\.0\.1
    RewriteCond %{DOCUMENT_ROOT}/maintenance.html -f
    RewriteCond %{DOCUMENT_ROOT}/.maintenance-on -f
    RewriteCond %{SCRIPT_FILENAME} !maintenance.html
    RewriteRule ^.*$ /maintenance.html [R=503,L]
    ErrorDocument 503 /maintenance.html
    Header Set Cache-Control "max-age=0, no-store"
</IfModule>
```

Create the `maintenance.html` to appear how you desire. Avoid using resources from the server that is undergoing maintenance. Process images to base64 datauri or an inline SVG if possible. Styles and scripts should be inline.

To enable maintenance mode, create a file called `.maintenance-on`, it just needs to exist and can be empty. Thats it!

To disable maintenance mode, either remove or rename `.maintenance-on`.

## .htaccess Breakdown

### 1. Turn on rewrite engine

```apache
RewriteEngine On
```

### 2. Don't enable for specific IP addresses

Add any IP addresses that need to gain access behind maintenance mode.

```apache
RewriteCond %{REMOTE_ADDR} !^192\.168\.0\.0
RewriteCond %{REMOTE_ADDR} !^127\.0\.0\.1
```

### 3. Make sure the maintenance files exist

Both the `maintenance.html` and `maintenance.enable` need to exist.

Adding, removing or renaming `maintenance.enable` will be how you turn maintenance mode on/off.

```apache
RewriteCond %{DOCUMENT_ROOT}/maintenance.html -f
RewriteCond %{DOCUMENT_ROOT}/.maintenance-on -f
```

### 4. Don't apply rules to the maintenance page

Doing our best to avoid a redirect loop

```apache
RewriteCond %{SCRIPT_FILENAME} !maintenance.html
```

### 5. Redirect and 503 the maintenance page itself

> 503: The server is currently unable to handle the request due to a temporary overload or scheduled maintenance, which will likely be alleviated after some delay.

This is the most appropriate status code to use for maintenance according to:

- [Description for the 503 status code](https://httpstatuses.com/503)
- [Google](https://webmasters.googleblog.com/2011/01/how-to-deal-with-planned-site-downtime.html)
- [Yoast SEO](https://yoast.com/http-503-site-maintenance-seo/)

```apache
RewriteRule ^.*$ /maintenance.html [R=503,L]
ErrorDocument 503 /maintenance.html
```

### 6. Avoid caching the maintenance page

```apache
Header Set Cache-Control "max-age=0, no-store"
```
