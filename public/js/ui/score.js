define([	'createjs',
			'radio'],
function(	createjs,
			radio) {

	'use strict';

	var PlayerScore = function() {
		this.width = this.getMeasuredWidth();
		this.height = this.getMeasuredHeight();
		this.x = 10;
		this.y = 5;

		this.score = 0;

		this.text = this.score;

		this.initialize();
	};

	PlayerScore.prototype = new createjs.Text(' ', 'bold 24px Helvetica', '#FFFFFF');

	PlayerScore.prototype.initialize = function() {
		// subscribe to various pubsub publishers
		radio('sonic:scored').subscribe([this.increaseScore, this]);
	};

	// TODO: calculate time elapsed since enemy passed certain point
	PlayerScore.prototype.increaseScore = function() {
		this.score += 1;

		this.text = this.score;

		// TODO: trigger stage update?
	};
 
	return PlayerScore;

});