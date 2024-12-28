<?php
/*
 * Script for activating a plugin via PHP.
 * Useful when a deactivated plugin
 * cannot be reactivated from the admin panel.
 */

define('WP_USE_THEMES', false);
require_once('./wp-load.php');
require_once(ABSPATH . 'wp-admin/includes/plugin.php');
activate_plugin('plugin-name/plugin-name.php');
echo "Plugin activated!";