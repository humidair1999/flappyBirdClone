define([	'underscore',
			'when',
			'createjs',
			'radio'],
function(	_,
			when,
			createjs,
			radio) {

	'use strict';

	var PauseButton = function() {
		this.graphics.beginFill("#ff0000").drawRect(FLAPPYSONIC.canvas.width - 40, 10, 30, 30);

		this.initialize();
	};

	PauseButton.prototype = new createjs.Shape();

	PauseButton.prototype.initialize = function() {
		// subscribe to various pubsub publishers
		radio('player:pause').subscribe([this.togglePause, this]);
	};

	PauseButton.prototype.togglePause = function(evt) {
		createjs.Ticker.setPaused(!createjs.Ticker.getPaused());
	};
 
	return PauseButton;

});