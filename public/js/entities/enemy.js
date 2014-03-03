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

		// TODO: give enemy some sort of more accurate hitbox?

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

	Enemy.prototype.checkCollision = function(sonicXPos, sonicWidth, sonicYPos, sonicHeight) {
		// right-side collision: if sonic is past the right edge of the enemy,
		if (sonicXPos >= this.x + this.width ||
			// left-side collision: if sonic is past the left edge of the enemy,
			sonicXPos + sonicWidth <= this.x ||
			// bottom collision: if sonic is underneath the enemy,
			sonicYPos >= this.y + this.height ||
			// and top collision: if sonic is above the enemy
			sonicYPos + sonicHeight <= this.y ) {
			return false;
		}
		else {
			return true;
		}
	};
 
	return Enemy;

});