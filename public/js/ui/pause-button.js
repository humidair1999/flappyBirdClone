define([	'createjs',
			'radio'],
function(	createjs,
			radio) {

	'use strict';

	var PauseButton = function() {
		this.graphics.beginFill("#6D6D6D").drawRect(FLAPPYSONIC.canvas.width - 40, 10, 30, 30);

		this.initialize();
	};

	PauseButton.prototype = new createjs.Shape();

	PauseButton.prototype.initialize = function() {
		// subscribe to various pubsub publishers
		radio('player:pause').subscribe([this.togglePause, this]);
	};

	PauseButton.prototype.togglePause = function() {
		createjs.Ticker.setPaused(!createjs.Ticker.getPaused());
	};
 
	return PauseButton;

});