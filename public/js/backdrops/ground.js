define([	'createjs'],
function(	createjs) {

	'use strict';

	var Ground = function(xPos) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = xPos;
		this.y = (FLAPPYSONIC.canvas.height - this.height);
	};

	Ground.prototype = new createjs.Bitmap(FLAPPYSONIC.loadQueue.getResult('floor'));
 
	return Ground;

});