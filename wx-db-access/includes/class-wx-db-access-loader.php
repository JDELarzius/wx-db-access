<?php

/**
 * Register all actions and filters for the plugin
 *
 * @link       http://example.com
 * @since      1.0.0
 *
 * @package    wx_db_access
 * @subpackage wx_db_access/includes
 */

/**
 * Register all actions and filters for the plugin.
 *
 * Maintain a list of all hooks that are registered throughout
 * the plugin, and register them with the WordPress API. Call the
 * run function to execute the list of actions and filters.
 *
 * @package    wx_db_access
 * @subpackage wx_db_access/includes
 * @author     Your Name <email@example.com>
 */
class wx_db_access_Loader {

	/**
	 * The array of actions registered with WordPress.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      array    $actions    The actions registered with WordPress to fire when the plugin loads.
	 */
	protected $actions;

	/**
	 * The array of filters registered with WordPress.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      array    $filters    The filters registered with WordPress to fire when the plugin loads.
	 */
	protected $filters;

	/**
	 * Initialize the collections used to maintain the actions and filters.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {

		$this->actions = array();
		$this->filters = array();

	}

	/**
	 * Add a new action to the collection to be registered with WordPress.
	 *
	 * @since    1.0.0
	 * @param    string               $hook             The name of the WordPress action that is being registered.
	 * @param    object               $component        A reference to the instance of the object on which the action is defined.
	 * @param    string               $callback         The name of the function definition on the $component.
	 * @param    int                  $priority         Optional. The priority at which the function should be fired. Default is 10.
	 * @param    int                  $accepted_args    Optional. The number of arguments that should be passed to the $callback. Default is 1.
	 */
	public function add_action( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->actions = $this->add( $this->actions, $hook, $component, $callback, $priority, $accepted_args );
	}

	// /**
	//  * Add a new filter to the collection to be registered with WordPress.
	//  *
	//  * @since    1.0.0
	//  * @param    string               $hook             The name of the WordPress filter that is being registered.
	//  * @param    object               $component        A reference to the instance of the object on which the filter is defined.
	//  * @param    string               $callback         The name of the function definition on the $component.
	//  * @param    int                  $priority         Optional. The priority at which the function should be fired. Default is 10.
	//  * @param    int                  $accepted_args    Optional. The number of arguments that should be passed to the $callback. Default is 1
	//  */
	// public function add_filter( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
	// 	$this->filters = $this->add( $this->filters, $hook, $component, $callback, $priority, $accepted_args );
	// }

	/**
	 * A utility function that is used to register the actions and hooks into a single
	 * collection.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @param    array                $hooks            The collection of hooks that is being registered (that is, actions or filters).
	 * @param    string               $hook             The name of the WordPress filter that is being registered.
	 * @param    object               $component        A reference to the instance of the object on which the filter is defined.
	 * @param    string               $callback         The name of the function definition on the $component.
	 * @param    int                  $priority         The priority at which the function should be fired.
	 * @param    int                  $accepted_args    The number of arguments that should be passed to the $callback.
	 * @return   array                                  The collection of actions and filters registered with WordPress.
	 */
	private function add( $hooks, $hook, $component, $callback, $priority, $accepted_args ) {

		$hooks[] = array(
			'hook'          => $hook,
			'component'     => $component,
			'callback'      => $callback,
			'priority'      => $priority,
			'accepted_args' => $accepted_args
		);

		return $hooks;

	}

	/**
	 * Register the filters and actions with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {

		add_shortcode('wx_station_data', 'wx_get_station_data');
		// add_shortcode('wx_current_obs', 'wx_get_current_obs');
		// add_shortcode('wx_graph_data', 'wx_get_graph_data');

		function wx_get_station_data($atts = [], $content = null) {
			$atts = array_change_key_case( (array) $atts, CASE_LOWER);
			$stationId = $atts['stationid'];

			$stationInfo = wx_get_from_db("select * from stations where StationID = ".$stationId);
			$currentObs = wx_get_from_db("select * from observations WHERE StationID = ".$stationId." ORDER BY ObservationUTC DESC LIMIT 1");
			$currentObsDate = $currentObs[0]->ObservationLocalDate;
			$highsAndLows = wx_get_from_db("select * from highs_and_lows WHERE StationID = ".$stationId." and Date = '".$currentObsDate."'");
			$graphData = wx_get_from_db("select * from observations WHERE StationID = ".$stationId." and ObservationLocalDate = '".$currentObsDate."' and EXTRACT(MINUTE FROM ObservationLocalTime) IN(0,10,20,30,40,50) ORDER BY ObservationUTC DESC");
			$wxData = new stdClass();
			$wxData->stationInfo = $stationInfo[0];
			$wxData->currentObservation = $currentObs[0];
			$wxData->highsAndLows = $highsAndLows[0];
			$wxData->graphData = $graphData;
			$wxData->currentObsDate = $currentObsDate;

			return json_encode($wxData);
		}

		// function wx_get_station_info($atts = [], $content = null) {
		// 	$atts = array_change_key_case( (array) $atts, CASE_LOWER);
		// 	$stationId = $atts['stationid'];
		// 	$stationInfo = wx_get_from_db('select * from stations where StationID = '.$stationId);
		// 	return json_encode($stationInfo);
		// }

		// function wx_get_current_obs($atts = [], $content = null) {
		// 	$atts = array_change_key_case( (array) $atts, CASE_LOWER);
		// 	$stationId = $atts['stationid'];

		// 	$currentObs = wx_get_from_db("select * from observations WHERE StationID = ".$stationId." ORDER BY ObservationUTC DESC LIMIT 1");
		// 	return json_encode($currentObs);
		// }

		// function wx_get_graph_data($atts = [], $content = null) {
		// 	// $atts = array_change_key_case( (array) $atts, CASE_LOWER);
		// 	// $stationId = $atts['stationid'];

		// 	$currentDate = date("c");
		// 	// $currentObs = wx_get_from_db("select * from observations WHERE StationID = ".$stationId." and ObservationLocalDate = ".$currentDate." and EXTRACT(MINUTE FROM ObservationLocalTime) IN(0,10,20,30,40,50) ORDER BY ObservationUTC DESC");
		// 	return json_encode($currentDate);
		// }

		function wx_get_from_db($query = '') {
			$wxdb = new wpdb('ksdillons_wx_ro','yj,9@46F4z>o','ksdillons_weather','localhost');
			return $wxdb->get_results($query);
		}
	}

	
}
