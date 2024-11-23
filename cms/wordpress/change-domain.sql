# Watch out for and consider:
# Dirs /path/to/oldurl.tld/subfolder/
# Emails @oldurl.tld
# URLs https://oldurl.com

SET NAMES utf8mb4;
SET @old = 'oldurl.tld';
SET @new = 'newurl.tld';

# Options (incl. some plugins options)
UPDATE wp_options SET option_value = REPLACE(CAST(option_value AS CHAR CHARACTER SET utf8mb4), @old, @new) WHERE option_name IN
('home', 'siteurl', '_transient_pll_languages_list', 'boldgrid_backup_latest_backup', '_transient_dirsize_cache', 'wpseo');

# Posts
UPDATE wp_postmeta SET meta_value = REPLACE(meta_value, @old, @new);
UPDATE wp_posts SET guid = REPLACE(guid, @old, @new);
UPDATE wp_posts SET post_content = REPLACE(post_content, @old, @new);

# Users
UPDATE wp_users SET user_email = REPLACE(user_email, @old, @new);
UPDATE wp_users SET user_url = REPLACE(user_url, @old, @new);

# Plugin: Yoast
UPDATE wp_yoast_indexable SET permalink = REPLACE(permalink, @old, @new);
UPDATE wp_yoast_indexable SET twitter_image = REPLACE(twitter_image, @old, @new);
UPDATE wp_yoast_indexable SET open_graph_image = REPLACE(open_graph_image, @old, @new);
UPDATE wp_yoast_indexable SET open_graph_image_meta = REPLACE(open_graph_image_meta, @old, @new);
UPDATE wp_yoast_seo_links SET url = REPLACE(url, @old, @new);