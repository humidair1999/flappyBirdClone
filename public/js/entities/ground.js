define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var Ground = function(xPos) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = xPos;
		this.y = (FLAPPYSONIC.canvasHeight - this.height);

		console.log(this.width);
		console.log(this.x);
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

	Ground.prototype = new createjs.Bitmap(FLAPPYSONIC.loadQueue.getResult('floor'));

	Ground.prototype.move = function(deltaPerSecond, oppositeGroundXPos) {
		if (this.x <= -this.width){
		    this.x = (oppositeGroundXPos + this.width) - 4;
		}
		else {
			// (elapsedTimeInMS / 1000msPerSecond * pixelsPerSecond)
			this.x -= (deltaPerSecond * 40);
		}
	};
 
	return Ground;

});