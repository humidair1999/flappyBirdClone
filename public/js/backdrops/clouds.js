define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var Clouds = function(xPos) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = xPos;
		this.y = 0;

		this.initialize();
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

	Clouds.prototype = new createjs.Bitmap(FLAPPYSONIC.loadQueue.getResult('clouds'));

	Clouds.prototype._initialize = Clouds.prototype.initialize;

	Clouds.prototype.initialize = function() {
		console.log('clouds init ', this.x);

		//this._initialize();
	};
 
	return Clouds;

});