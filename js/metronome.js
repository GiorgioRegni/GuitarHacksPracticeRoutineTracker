var ghMetronome = (function () {

    // Instance stores a reference to the Singleton
    var instance;

    function init() {

	var _dom_root = undefined;
	var _dom_bpm = undefined;
	var _dom_metronome = undefined;
	
	var audioContext = null;
	var isPlaying = false;      // Are we currently playing?
	var startTime;              // The start time of the entire sequence.
	var currentTwelveletNote;        // What note is currently last scheduled?
	var tempo = 120.0;          // tempo (in beats per minute)
	var meter = 4;
	var masterVolume = 0.5;
	var accentVolume = 1;
	var quarterVolume = 0.75;
	var eighthVolume = 0;
	var sixteenthVolume = 0;
	var tripletVolume = 0;
	var lookahead = 25.0;       // How frequently to call scheduling function
        //(in milliseconds)
	var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
	// This is calculated from lookahead, and overlaps
	// with next interval (in case the timer is late)
	var nextNoteTime = 0.0;     // when the next note is due.
	var noteLength = 0.05;      // length of "beep" (in seconds)
	var notesInQueue = [];      // the notes that have been put into the web audio,
        // and may or may not have played yet. {note, time}
	var timerWorker = null;     // The Web Worker used to fire timer messages

	function maxBeats() {
	    var beats = (meter * 12);
	    return beats;
	}

	function nextTwelvelet() {
	    var secondsPerBeat = 60.0 / tempo;
	    nextNoteTime += 0.08333 * secondsPerBeat;    // Add beat length to last beat time
	    currentTwelveletNote++;    // Advance the beat number, wrap to zero
	    
	    if (currentTwelveletNote == maxBeats()) {
		currentTwelveletNote = 0;
	    }
	}

	function calcVolume(beatVolume) {
	    return (beatVolume * masterVolume);
	}

	function scheduleNote(beatNumber, time) {
	    // push the note on the queue, even if we're not playing.
	    notesInQueue.push({ note: beatNumber, time: time });

	    // create oscillator & gainNode & connect them to the context destination
	    var osc = audioContext.createOscillator();
	    var gainNode = audioContext.createGain();

	    osc.connect(gainNode);
	    gainNode.connect(audioContext.destination);

	    if (beatNumber % maxBeats() === 0) {
		if (accentVolume > 0.25) {
		    osc.frequency.value = 880.0;
		    gainNode.gain.value = calcVolume(accentVolume);
		} else {
		    osc.frequency.value = 440.0;
		    gainNode.gain.value = calcVolume(quarterVolume);
		}
	    } else if (beatNumber % 12 === 0) {   // quarter notes = medium pitch
		osc.frequency.value = 440.0;
		gainNode.gain.value = calcVolume(quarterVolume);
	    } else if (beatNumber % 6 === 0) {
		osc.frequency.value = 440.0;
		gainNode.gain.value = calcVolume(eighthVolume);
	    } else if (beatNumber % 4 === 0) {
		osc.frequency.value = 300.0;
		gainNode.gain.value = calcVolume(tripletVolume);
	    } else if (beatNumber % 3 === 0 ) {                    // other 16th notes = low pitch
		osc.frequency.value = 220.0;
		gainNode.gain.value = calcVolume(sixteenthVolume);
	    } else {
		gainNode.gain.value = 0;   // keep the remaining twelvelet notes inaudible
	    }

	    osc.start(time);
	    osc.stop(time + noteLength);
	}

	function scheduler() {
	    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
		scheduleNote( currentTwelveletNote, nextNoteTime );
		nextTwelvelet();
	    }
	}

	function play() {
	    isPlaying = !isPlaying;

	    if (isPlaying) {
		currentTwelveletNote = 0;
		nextNoteTime = audioContext.currentTime;
		timerWorker.postMessage("start");
		//document.getElementById("play-icon").innerHTML = "pause";
	    } else {
		timerWorker.postMessage("stop");
		//document.getElementById("play-icon").innerHTML = "play_arrow";
	    }
	}

	function setTimeDivision(timeDiv) {
	    switch(timeDiv) {
	    case "2/4":
		meter = 2;
		quarterVolume = 0.75;
		eighthVolume = 0;
		sixteenthVolume = 0;
		tripletVolume = 0;
		break;
	    case "3/4":
		meter = 3;
		quarterVolume = 0.75;
		eighthVolume = 0;
		sixteenthVolume = 0;
		tripletVolume = 0;
		break;
	    case "4/4":
		meter = 4;
		quarterVolume = 0.75;
		eighthVolume = 0;
		sixteenthVolume = 0;
		tripletVolume = 0;
		break;
	    case "5/4":
		meter = 5;
		quarterVolume = 0.75;
		eighthVolume = 0;
		sixteenthVolume = 0;
		tripletVolume = 0;
		break;
	    case "7/8":
		meter = 3.5;
		quarterVolume = 0.75;
		eighthVolume = 0.75;
		sixteenthVolume = 0;
		tripletVolume = 0;
		break;
	    default:
		break;
	    }
	}

	function setup(root_id) {
	    _dom_root = document.getElementById(root_id);
	    _dom_metronome = _dom_root.querySelector("#dash-metronome");
	    _dom_bpm = _dom_root.querySelector("#dash-period-bpm");
	    //_dom_metronome.className = "c100 gh p"+ Math.round(100.0 * .2);
	    _dom_root.querySelector(".control-metronome").onclick = function(){
		_dom_root.querySelector(".control-metronome > *:first-child").classList.toggle('active');
		_dom_metronome.classList.toggle('active');
		_dom_bpm.value = tempo;
		ghMetronome.play();
	    };

	    _dom_bpm.addEventListener("change", function(evt) {
		var tmp = parseInt(_dom_bpm.value, 10);
		if (tmp > 0 && tmp < 400) {
		    tempo = tmp;
		    _dom_bpm.blur();
		}
		else {
		    _dom_bpm.value = tempo;
		}
	    });

	    _dom_root.querySelector(".control-metronome-plus").onclick = function(){
		tempo = tempo + 1;
		_dom_bpm.value = tempo;
	    };

	    _dom_root.querySelector(".control-metronome-minus").onclick = function(){
		tempo = tempo - 1;
		_dom_bpm.value = tempo;
	    };

	     _dom_root.querySelector(".control-metronome-timediv select").onchange = function(et){
		 var value = et.srcElement.value;
		 setTimeDivision(value)
	    };
	    
	    
    	    audioContext = new AudioContext();
	    timerWorker = new Worker("js/metronome_worker.js");
	    
	    timerWorker.onmessage = function(e) {
		if (e.data == "tick") {
		    scheduler();
		} else {
		    console.log("message: " + e.data);
		}
	    };

	    timerWorker.postMessage({"interval":lookahead});
	}

	var requestAnimFrame = (function(){
	    return  window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( callback ){
		    window.setTimeout(callback, 1000 / 60);
		};
	})();
	
	return {
	    "play": play,
	    "setup": setup,
	    "setVolume": function(volume) {
		masterVolume = volume;
	    },
	    "getVolume": function() {
		return masterVolume;
	    },
	    "setTempo": function(bpm) {
		tempo = bpm;
	    },
	    "getTempo": function() {
		return tempo;
	    },
	    "setTimeDivision": function(timeDiv) {
		return setTimeDivision(timeDiv)
	    },
	    "setMeter": function(m) {
		meter = m;
	    }
	}
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
    ghMetronome.setup("pst");
}, false);
