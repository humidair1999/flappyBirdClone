define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var enemyImage = FLAPPYSONIC.loadQueue.getResult('enemy');

	var dataEnemy = new createjs.SpriteSheet({
		'images': [enemyImage],
		'frames': {
			'width': 48,
			'height': 52,
			'regX': 0,
			'regY': 0,
			'count': 2
		},
		'animations': {
			'stay': [0, 1, 'stay']
		}
	});

	var Enemy = function() {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = 200;
		this.y = 50;

		this.framerate = Math.floor((Math.random() * 8) + 1);
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

	Enemy.prototype = new createjs.Sprite(dataEnemy, 'stay');

	Enemy.prototype.move = function(deltaPerSecond) {
		this.x -= deltaPerSecond * 40;
	};
 
	return Enemy;

});