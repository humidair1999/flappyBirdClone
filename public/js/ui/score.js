define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var PlayerScore = function() {
		this.width = this.getMeasuredWidth();
		this.height = this.getMeasuredHeight();
		this.x = FLAPPYSONIC.canvasWidth - this.width - 10;
		this.y = FLAPPYSONIC.canvasHeight - this.height - 10;

		this.score = 0;

		this.text = this.score;
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

	PlayerScore.prototype = new createjs.Text(' ', 'bold 24px Helvetica', '#FFFFFF');

	// TODO: calculate time elapsed since enemy passed certain point
	PlayerScore.prototype.increaseScore = _.throttle(function() {
		console.log('increase');

		this.score += 1;

		this.text = this.score;

		// TODO: trigger stage update?
	}, 3000, {
		leading: true,
		trailing: false
	});
 
	return PlayerScore;

});