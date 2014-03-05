define([	'createjs',
			'radio'],
function(	createjs,
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

		// since we're reusing the same few enemies, we need a boolean to track whether the
		//	player has already passed each one, so we can reset the flag when they 'respawn'
		this.canIncreaseScore = true;

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

		    this.canIncreaseScore = true;
		}
		else {
			this.x -= pixelsPerDelta;
		}
	};

	Enemy.prototype.hasCollided = function(sonicXPos, sonicYPos, sonicWidth, sonicHeight) {
		// if sonic's left edge is NOT past the right edge of the enemy,
		if (!(sonicXPos >= this.x + this.width) &&
			// AND sonic's right edge is NOT past the left edge of the enemy,
			!(sonicXPos + sonicWidth <= this.x) &&
			// AND sonic's top edge is NOT past the bottom edge of the enemy,
			!(sonicYPos >= this.y + this.height) &&
			// AND sonic's bottom edge is NOT past the top edge of the enemy
			!(sonicYPos + sonicHeight <= this.y)) {
			radio('sonic:collided').broadcast();
		}
	};

	// we're ignoring every parameter except sonic's x position here, because we simply don't
	//	need his other metrics
	Enemy.prototype.hasPassed = function(sonicXPos) {
		// if sonic has passed by the current enemy (and hasn't already done so), broadcast
		//	a 'scored' event
		if ((sonicXPos >= (this.x + this.width)) && this.canIncreaseScore) {
			this.canIncreaseScore = false;

			radio('sonic:scored').broadcast();
		}
	};

	Enemy.prototype.tick = function(evt, deltaInSeconds, oppositeEnemyXPos, oppositeEnemyWidth, oppositeEnemyXSpacing) {
		this.move((deltaInSeconds * 40), oppositeEnemyXPos, oppositeEnemyWidth, oppositeEnemyXSpacing);
	};
 
	return Enemy;

});