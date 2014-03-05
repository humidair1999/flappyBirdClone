define([	'underscore',
			'createjs',
			'radio'],
function(	_,
			createjs,
			radio) {

	'use strict';

	var sonicImage = FLAPPYSONIC.loadQueue.getResult('sonic');

	var dataSonic = new createjs.SpriteSheet({
		'images': [sonicImage],
		'frames': {
			'width': 64,
			'height': 64,
			'regX': 0,
			'regY': 0,
			'count': 12
		},
		'animations': {
			'up': [0, 2, 'up'],
			'straight': [3, 5, 'straight'],
			'down': [6, 8, 'down'],
			'empty': [9, 11, 'empty']
		}
	});

	// TODO: store more properties of sonic on constructor, rather than relying on singletons?

	var Sonic = function() {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = 50;
		this.y = 50;

		// TODO: scale framerate based on framerate of ticker

		this.framerate = 2;

		this.initialize();
	};

	Sonic.prototype = new createjs.Sprite(dataSonic, 'straight');

	Sonic.prototype.initialize = function() {
		// subscribe to various pubsub publishers
		radio('sonic:collided').subscribe([this.die, this]);

		radio('player:click').subscribe([this.flyUp, this]);
	};

	Sonic.prototype.glideDown = function(pixelsPerDelta) {
		this.y += pixelsPerDelta;
	};

	// TODO: might be nice to wrap() ticker getPaused() checks in some sort of reusable
	//	function

	Sonic.prototype.flyUp = function() {
		var newYPos = (this.y <= 70) ? 0 : (this.y - 70);

		if (!createjs.Ticker.getPaused()) {
			this.gotoAndPlay('up');

			createjs.Sound.play('flap', createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 0.8, 0);

			createjs.Tween.get(this, { override: true })
				.to({ y: newYPos }, 700, createjs.Ease.cubicInOut)
				.call(function() {
					if (this.currentAnimation !== 'empty') {
						this.gotoAndPlay('down');
					}					
				});
		}
	};

	// Sonic can only ever die once, so let's utilize the die() method as a singleton
	Sonic.prototype.die = _.once(function() {
		createjs.Sound.play('crash', createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 0.8, 0);

		this.gotoAndPlay('empty');
	});

	Sonic.prototype.tick = function(evt, deltaInSeconds) {
		this.glideDown(deltaInSeconds * 80);

		// intentionally slow the rate at which sonic broadcasts his movements; again, for
		//	performance reasons
		// (time) divided by (change in time) is evenly divisible by factor of 5
		if (Math.floor((evt.time / evt.delta) % 4) === 0) {
			radio('sonic:tick').broadcast(this.x, this.y, this.width, this.height);
		}
	};
 
	return Sonic;

});