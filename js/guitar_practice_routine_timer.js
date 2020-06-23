var ghPracticeStudio = (function () {

    // Instance stores a reference to the Singleton
    var instance;

    function init() {

	// Singleton

	// States and const
	
	const DEV = true;
	const SPEED = 1.0;
	const STATES = {
	    NONE: 'NONE',
	    FUNDAMENTALS: "FUNDAMENTALS",
	    MUSICALEXERCISES: "MUSICALEXERCISES",
	    POMODORO: 'POMODORO',
	    OUTOFTHEPLATEAU: 'OUTOFTHEPLATEAU',
	    OUTOFTHEBOX: 'OUTOFTHEBOX'
	};

	/* Subdivision of states in minutes */
	const STATES_PERIODS = {
	    FUNDAMENTALS: [5/SPEED,5/SPEED],
	    MUSICALEXERCISES: [5/SPEED,5/SPEED,5/SPEED,5/SPEED],
	    POMODORO: [5/SPEED],
	    OUTOFTHEPLATEAU: [3/SPEED,3/SPEED,3/SPEED,3/SPEED,3/SPEED],
	    OUTOFTHEBOX: [10/SPEED]
	};

	const STATES_ORDER = [
	    "FUNDAMENTALS",
	    "MUSICALEXERCISES",
	    "POMODORO",
	    "OUTOFTHEPLATEAU",
	    "OUTOFTHEBOX"
	];

	const STATES_NEXT = {
	    "NONE": "FUNDAMENTALS",
	    "FUNDAMENTALS": "MUSICALEXERCISES",
	    "MUSICALEXERCISES": "POMODORO",
	    "POMODORO": "OUTOFTHEPLATEAU",
	    "OUTOFTHEPLATEAU": "OUTOFTHEBOX",
	    "OUTOFTHEBOX": undefined
	};
	
	// Private methods and variables, name all private members with _

	var _dom_root = undefined;
	var _dom_time = undefined;
	var _dom_period_time = undefined;
	var _dom_period_time_bar = undefined;
	var _dom_period = undefined;
	var _timer = undefined;
	var _startTime = undefined;
	var _state = STATES.NONE;
	var _state_period = undefined; // Current exercise in period
	var _stateStartTime = undefined; // Time when the current state was started
	var _statePeriodStartTime = undefined; // Time when the current state period was started

	// Sounds
	var _snd_transition = new Howl({
	    src: ['i/clave.wav']
	});

	_log = function(msg) {
	    if(DEV){
		console.log({
		    'msg': msg,
		    'state': _state
		});
	    }
	};

	window.performance = window.performance || {};
	performance.now = (function() {
            return performance.now       ||
		performance.mozNow    ||
		performance.msNow     ||
		performance.oNow      ||
		performance.webkitNow ||
                function() {
                    //Doh! Crap browser!
                    return new Date().getTime(); 
                };
        })();
	
	var _getTime = function() {return performance.now();};

	/** 
	 * This is the correct way to format mathematically but the other function below looks better to a human
	 */
	var _formatTimeOld = function(t) {
	    var hours = Math.floor((t%(1000 * 60 * 60 * 24))/(1000 * 60 * 60)); 
	    var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60)); 
	    var seconds = Math.floor((t % (1000 * 60)) / 1000);
	    //var seconds = Math.floor((Math.round(t/1000) %  60));

	    minutes = minutes + 60*hours;
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    
	    return minutes + ':' + seconds; 
	};

	
	var _formatTime = function(t) {
	    t = Math.round(t/1000);
	    var hours = Math.floor((t%(60 * 60 * 24))/(60 * 60)); 
	    var minutes = Math.floor((t % (60 * 60)) / (60)); 
	    var seconds = Math.floor((t % (60)));
	    
	    minutes = minutes + 60*hours;
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    
	    return minutes + ':' + seconds; 
	};
	
	var _stop = function() {
	    // TODO clean up all variables
	    //clearInterval(_timer); // check exception TODO
	    if (_timer)
		_timer.stop();
	    _timer = undefined;
	    _startTime = undefined;
	    _state = STATES.NONE;
	    _stateStartTime = undefined;

	    _gotoState(STATES.NONE, undefined);

	    _dom_root.querySelector(".control-stop").style.display = "none";
	    _dom_root.querySelector(".control-play").style.display = "block";
	    _dom_root.querySelector(".header .led-red").className="led-red off";
	    _dom_period_time.textContent = "--";
	    _dom_period.textContent = "--";
	    _dom_time.textContent = "--:--";
	};
	
	var _start = function() {
	    _dom_root.querySelector(".control-stop").style.display = "block";
	    _dom_root.querySelector(".control-play").style.display = "none";
	    _dom_root.querySelector(".header .led-red").className="led-red";

	    _startTime  = _getTime();
	    _gotoState(STATES.FUNDAMENTALS, _startTime);

	    _snd_transition.play();
	    
	    //_timer = setInterval(_tick, 100);
	    _timer = new Timer( _tick, 1000, -1, false);
	};

	var _next = function() {
	    if (_startTime) {
		// Timer in progress
		var endTime = _statePeriodStartTime + STATES_PERIODS[_state][_state_period]*60*1000;
		var now = _getTime();
		var drift = endTime - now;
		_log([now,endTime,drift]);
		if (drift > 0) {
		    _statePeriodStartTime -= drift;
		    //_startTime -= drift;
		    _stateStartTime -= drift;
		}
	    }
	}

	var _back = function() { // TODO, this logic does not work, need to manually change states
	    if (_startTime) {
		// Timer in progress
		var now = _getTime();
		var drift = now - _statePeriodStartTime;
		_log(drift);
		if (drift > 0) {
		    _statePeriodStartTime += drift;
		    _startTime += drift;
		    _stateStartTime += drift;
		}
	    }
	}

	/*
	  * Main loop to manage states and update graphics
	  */
	function _tick() {
	    var now = _getTime();
	    if (_gotoNextPeriodOrState(now)) {
	    
		_dom_time.textContent = _formatTime(now - _startTime);
		if (STATES_PERIODS[_state]) {
		    _dom_period_time.textContent = _formatTime(_statePeriodStartTime + STATES_PERIODS[_state][_state_period]*60*1000 - now);
		    _dom_period_time_bar.className = "c100 big gh p"+ Math.round(100.0 * (now-_statePeriodStartTime) / (STATES_PERIODS[_state][_state_period]*60*1000));;
		}
	    } else {
		// We reached the end, display a message
		alert("Done!");
	    }
	}

	var _gotoState = function(st, now) {
	    // make everything off
	    els = _dom_root.querySelectorAll(".dash-phase h3");
	    for (var i = 0; i < els.length; ++i) {
		els[i].classList.add("off");
	    }

	    _dom_root.querySelector(".dash-phase h3."+st).classList.remove("off");
	    
	    switch(st) {
	    case STATES.NONE:
		return; // Do not update variables if we're off
		break;
	    }
	    
	    _state = st;
	    _state_period = 0;
	    _stateStartTime =  now;
	    _statePeriodStartTime =  _stateStartTime;
	    _dom_period.textContent = (_state_period+1) + "/" + STATES_PERIODS[_state].length;
	};

	/** Check the current time and switch to another period if it's time, return true if still in progress, false if finished */
	var _gotoNextPeriodOrState = function(t) {
	    var endTime = _statePeriodStartTime + STATES_PERIODS[_state][_state_period]*60*1000;
	    if (t >= endTime) {
		_snd_transition.play();
		if (_state_period >= STATES_PERIODS[_state].length-1) {
		    // no period left in this state
		    nextSt = STATES_NEXT[_state];
		    if (nextSt != undefined) 
			_gotoState(nextSt, endTime);
		    else {
			_stop();
			return false;
		    }
		} else {
		    // go to next period in current state
		    _state_period = _state_period+1;
		    _statePeriodStartTime =  endTime;
		    _dom_period.textContent = (_state_period+1) + "/" + STATES_PERIODS[_state].length;
		}
	    }
	    return true;
	}

	/* Utility class and variables */
	
	function Timer(func, delay, repeat, runAtStart)
	{
	    this.func = func;
	    this.delay = delay;
	    this.repeat = repeat || 0;
	    this.runAtStart = runAtStart;

	    this.count = 0;
	    this.startTime = performance.now();

	    if (this.runAtStart)
		this.tick();
	    else
	    {
		var _this = this;
		this.timeout = window.setTimeout( function(){ _this.tick(); }, this.delay);
	    }
	}
	Timer.prototype.tick = function()
	{
	    this.func();
	    this.count++;

	    if (this.repeat === -1 || (this.repeat > 0 && this.count < this.repeat) )
	    {
		var adjustedDelay = Math.max( 1, this.startTime + ( (this.count+(this.runAtStart ? 2 : 1)) * this.delay ) - performance.now() );
		var _this = this;
		this.timeout = window.setTimeout( function(){ _this.tick(); }, adjustedDelay);
	    }
	}
	Timer.prototype.stop = function()
	{
	    window.clearTimeout(this.timeout);
	}
	
	return {

	    // Public methods and variables
	    start: function () {
		_log("Starting ghPracticeStudio");
		_stop();
		_start();
	    },

	    stop: function() {
		_log("stopping ghPracticeStudio");
		_stop();
	    },

	    next: function() {
		_log("Next");
		_next();
	    },

	    setupEvents: function(root_id) {
		_dom_root = document.getElementById(root_id);
		// Setup all events
		_dom_root.querySelector(".control-play").onclick = function(){instance.start();};
		_dom_root.querySelector(".control-stop").onclick = function(){instance.stop();};
		_dom_root.querySelector(".control-skip").onclick = function(){instance.next();};
		
		_dom_time = _dom_root.querySelector("#dash-time");
		_dom_period_time = _dom_root.querySelector("#dash-period-time");
		_dom_period_time_bar = _dom_root.querySelector("#dash-period-time-bar");		
		_dom_state_time = _dom_root.querySelector("#dash-period-time");
		_dom_period = _dom_root.querySelector("#dash-period");

		_dom_root.querySelector(".control-stop").style.display = "none";
	    }
	};

    };

    return {

	// Get the Singleton instance if one exists
	// or create one if it doesn't
	getInstance: function () {

	    if ( !instance ) {
		instance = init();
	    }

	    return instance;
	}

    };

})().getInstance();

window.addEventListener("DOMContentLoaded", function() {
    ghPracticeStudio.setupEvents("pst");
}, false);

