<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              http://example.com
 * @since             1.0.0
 * @package           wx_db_access
 *
 * @wordpress-plugin
 * Plugin Name:       KSDillons WX DB Access Plugin
 * Plugin URI:        http://example.com/wx-db-access-uri/
 * Description:       Allows access to the KSDillons WX Database
 * Version:           1.0.0
 * Author:            KSdillons.com
 * Author URI:        https://ksdillons.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       wx_db_access
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'wx_db_access_VERSION', '1.0.0' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-wx-db-access-activator.php
 */
function activate_wx_db_access() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wx-db-access-activator.php';
	wx_db_access_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-wx-db-access-deactivator.php
 */
function deactivate_wx_db_access() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wx-db-access-deactivator.php';
	wx_db_access_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_wx_db_access' );
register_deactivation_hook( __FILE__, 'deactivate_wx_db_access' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-wx-db-access.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_wx_db_access() {

	$plugin = new wx_db_access();
	$plugin->run();

}
run_wx_db_access();

// function create_block_wx_observations() {
// 	register_block_type( __DIR__ . '/build')
// }