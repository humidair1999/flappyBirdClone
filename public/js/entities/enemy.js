define([	'underscore',
			'when',
			'createjs',
			'radio'],
function(	_,
			when,
			createjs,
			radio) {

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

	var Enemy = function(xPos, addXSpacing) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;

		this.xSpacing = 225;

		this.x = addXSpacing ? (xPos + this.xSpacing) : xPos;
		this.y = this.generateRandomYPos();

		// TODO: give enemy some sort of more accurate hitbox?

		this.framerate = Math.floor((Math.random() * 8) + 1);

		this.initialize();
	};

	Enemy.prototype = new createjs.Sprite(dataEnemy, 'stay');

	Enemy.prototype.initialize = function() {
		// subscribe to various pubsub publishers
		radio('sonic:tick')
			.subscribe([this.hasCollided, this])
			.subscribe([this.hasPassed, this]);
	};

	Enemy.prototype.generateRandomYPos = function() {
		return Math.floor(Math.random() * (FLAPPYSONIC.canvas.height - this.height));
	};

	Enemy.prototype.move = function(pixelsPerDelta, oppositeEnemyXPos, oppositeEnemyWidth, oppositeEnemyXSpacing) {
		if (this.x <= -this.width){
		    this.x = (oppositeEnemyXPos + oppositeEnemyWidth) + oppositeEnemyXSpacing;

		    this.y = this.generateRandomYPos();
		}
		else {
			this.x -= pixelsPerDelta;
		}
	};

	Enemy.prototype.hasCollided = function(sonicXPos, sonicYPos, sonicWidth, sonicHeight) {
		// right-side collision: if sonic is past the right edge of the enemy,
		if (sonicXPos >= this.x + this.width ||
			// left-side collision: if sonic is past the left edge of the enemy,
			sonicXPos + sonicWidth <= this.x ||
			// bottom collision: if sonic is underneath the enemy,
			sonicYPos >= this.y + this.height ||
			// and top collision: if sonic is above the enemy
			sonicYPos + sonicHeight <= this.y ) {
			
		}
		else {
			radio('sonic:collided').broadcast();
		}
	};

	// we're ignoring every parameter except sonic's x position here, because we simply don't
	//	need his other metrics
	Enemy.prototype.hasPassed = function(sonicXPos) {
		// if sonic has passed by the current enemy, broadcast a 'scored' event
		if (sonicXPos >= (this.x + this.width)) {
			radio('sonic:scored').broadcast();
		}
	};

	Enemy.prototype.tick = function(evt, deltaInSeconds, oppositeEnemyXPos, oppositeEnemyWidth, oppositeEnemyXSpacing) {
		this.move((deltaInSeconds * 40), oppositeEnemyXPos, oppositeEnemyWidth, oppositeEnemyXSpacing);
	};
 
	return Enemy;

});