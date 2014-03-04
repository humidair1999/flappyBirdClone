define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var PauseButton = function() {
		this.graphics.beginFill("#ff0000").drawRect(FLAPPYSONIC.canvas.width - 40, 10, 30, 30);
	};

	// don't have to override prototype because it's not an actual
	//	createjs construct with a default initialize()

	// var p = Button.prototype = new createjs.Container();
	// Button.prototype.Container_initialize = p.initialize;
	// Button.prototype.initialize = function(label) {
	//     this.Container_initialize();
	//     // add custom setup logic here.
	// }

	// TODO: why can't I proxy the fucking initialize() method here?

	PauseButton.prototype = new createjs.Shape();

	PauseButton.prototype.togglePause = function(evt) {
		createjs.Ticker.setPaused(!createjs.Ticker.getPaused());
	};
 
	return PauseButton;

});