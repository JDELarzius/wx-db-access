<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    wx_db_access
 * @subpackage wx_db_access/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    wx_db_access
 * @subpackage wx_db_access/admin
 * @author     Your Name <email@example.com>
 */
class wx_db_access_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $wx_db_access    The ID of this plugin.
	 */
	private $wx_db_access;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $wx_db_access       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $wx_db_access, $version ) {

		$this->wx_db_access = $wx_db_access;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in wx_db_access_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The wx_db_access_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->wx_db_access, plugin_dir_url( __FILE__ ) . 'css/wx-db-access-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in wx_db_access_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The wx_db_access_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->wx_db_access, plugin_dir_url( __FILE__ ) . 'js/wx-db-access-admin.js', array( 'jquery' ), $this->version, false );

	}

}
