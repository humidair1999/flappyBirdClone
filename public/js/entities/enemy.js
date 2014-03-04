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

	var Enemy = function(xPos) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;

		this.xSpacing = 225;

		this.x = xPos + this.xSpacing;
		this.y = this.generateRandomYPos();

		// TODO: give enemy some sort of more accurate hitbox?

		this.framerate = Math.floor((Math.random() * 8) + 1);

		this.initialize();
	};

	Enemy.prototype = new createjs.Sprite(dataEnemy, 'stay');

	Enemy.prototype.initialize = function() {
		// subscribe to various pubsub publishers
		radio('sonic:tick').subscribe([function(stuff) {
			console.log(this);
		}, this]);
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

	Enemy.prototype.playCrash = _.once(function() {
		createjs.Sound.play('crash', createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 0.8, 0);
	});

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
			this.playCrash();

			return true;
		}
	};

	Enemy.prototype.tick = function(evt, deltaInSeconds, oppositeEnemyXPos, oppositeEnemyWidth, oppositeEnemyXSpacing) {
		this.move((deltaInSeconds * 40), oppositeEnemyXPos, oppositeEnemyWidth, oppositeEnemyXSpacing);
	};

	// TODO: subscribe to sonic's movements

	// TODO: broadcast that a collision occurred
 
	return Enemy;

});