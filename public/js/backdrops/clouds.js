define([	'createjs'],
function(	createjs) {

	'use strict';

	var Clouds = function(xPos) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = xPos;
		this.y = 0;
	};

	Clouds.prototype = new createjs.Bitmap(FLAPPYSONIC.loadQueue.getResult('clouds'));
 
	return Clouds;

});