<?php

/**
 * @package GuitarHacksPracticeRoutineTracker
 */

/*
Plugin Name: Guitar Hacks Practice Routine Tracker
Plugin URI: https://github.com/GiorgioRegni/GuitarPracticeRoutineTracker
Description: This plugins implements a Guitar Practice Routine Tracker WebApp
Version: 1.1
Author: Giorgio Regni
Author URI: http://github.com/GiorgioRegni/
License: Commercial @www.guitarhacks.com
*/

class GHPRT {

  const PLAYER_KEY = '***REMOVED***';
  const PLAYER_DOMAIN = 'cdn.jwplayer.com';
  const PLAYER_SECRET = '***REMOVED***';
  const PLAYER_EXPIRE_TIME = 60*20; // 20 minutes link validity
  
  /**
   * Singleton
   */
  public static function init() {
    static $instance = false;
    if ( ! $instance )
      $instance = new GHPRT;
    return $instance;
  }

  function __construct() {
    add_shortcode( 'ghprt', array( $this, 'shortcode_callback' ) );
  }

  /**
   * Return URL to asset in plugin directory
   *
   * @param string $file if sent, it will return the full URL to the file.
   *
   * @return string
   */
  function plugin_url( $file = '' ) {
    return plugins_url( ltrim( $file, '\\/' ) , __FILE__ );
  }

  /**
   * Renders the practice studio
   *
   * @link http://codex.wordpress.org/Shortcode_API Shortcode API
   * @param array $attr shortcode attributes
   * @return string HTML markup or blank string on fail
   */
  public function shortcode_callback( $attr, $content = '' ) {

    
    wp_enqueue_style('GHPRT_CSS_CIRCLE', $this->plugin_url( 'css/circle.css' ) );
    wp_enqueue_style('GHPRT_CSS_PST', $this->plugin_url( 'css/practice_studio_timer.css' ) );

    wp_enqueue_script('GHPRT_HOWLER', $this->plugin_url( 'js/howler.min.js' ) );
    wp_enqueue_script('GHPRT_ICONIFY', $this->plugin_url( 'js/iconify.min.js' ) );
    wp_enqueue_script('GHPRT_PST', $this->plugin_url( 'js/guitar_practice_routine_timer.js' ) );
    wp_enqueue_script('GHPRT_METRONOME', $this->plugin_url( 'js/metronome.js' ) );
    
    $attr = shortcode_atts( array(
			'id' => '9mmBjRtJ'
		), $attr );

    if ( is_feed() )
      return '';

      $baseURL = $this->plugin_url();
      ob_start();
      include('guitar_practice_routine_tracker.phtml');
      //assign the file output to $content variable and clean buffer
      $content = ob_get_clean();
      return $content;
  }
}

// Initialize the video shortcode handler.
GHPRT::init();
