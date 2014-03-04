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
		this.y = (FLAPPYSONIC.canvas.height - this.height);
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
 
	return Ground;

});