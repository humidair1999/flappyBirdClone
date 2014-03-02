define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var GameScene = function() {
		// define an empty hash for ui buttons and controls
		this.ui = {};

		this.initialize();
	};

	// don't have to override prototype because it's not an actual
	//	createjs construct with a default initialize()

	GameScene.prototype.initialize = function() {
		console.log('init game');
	};

	GameScene.prototype.attachAssets = function() {
		var deferred = when.defer(),
			that = this;

		// TODO: would be sweet to not have to load the assets separately like this
		require([	'backdrops/clouds',
					'entities/ground',
					'entities/sonic',
					'entities/enemy',
					'ui/pause-button'],
		function(	Clouds,
					Ground,
					Sonic,
					Enemy,
					PauseButton) {

			that.clouds1 = new Clouds(0);
			that.clouds2 = new Clouds(that.clouds1.width);

			that.ground1 = new Ground(0);
			that.ground2 = new Ground(that.ground1.width);

			that.sonic = new Sonic();

			that.enemy = new Enemy();

			that.ui.pauseButton = new PauseButton();

			deferred.resolve();
		});

		return deferred.promise;
	};

	GameScene.prototype.attachListeners = function() {
		var deferred = when.defer();

		var flyUpProxy = createjs.proxy(this.sonic.flyUp, this.sonic);
		FLAPPYSONIC.canvas.addEventListener('click', flyUpProxy);

		var togglePauseProxy = createjs.proxy(this.ui.pauseButton.togglePause, this.ui.pauseButton);
		this.ui.pauseButton.addEventListener('click', togglePauseProxy);

		deferred.resolve();

		return deferred.promise;
	};

	GameScene.prototype.startTicker = function() {
		var deferred = when.defer();

		if (!createjs.Ticker.hasEventListener('tick')) {
			var tickProxy = createjs.proxy(this.tick, this);

		    createjs.Ticker.addEventListener('tick', tickProxy);
		    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			createjs.Ticker.setFPS(30);

			deferred.resolve();
		}
		else {
			deferred.resolve();
		}

		return deferred.promise;
	};

	GameScene.prototype.render = function() {
		FLAPPYSONIC.stage.addChild(this.clouds1, this.clouds2, this.ground1, this.ground2, this.enemy, this.sonic, this.ui.pauseButton);

		FLAPPYSONIC.stage.update();
	};

	GameScene.prototype.moveClouds = function(deltaPerSecond) {
		if (this.clouds1.x <= -this.clouds1.width){
		    this.clouds1.x = this.clouds2.x + this.clouds1.width;
		}
		else {
			// (elapsedTimeInMS / 1000msPerSecond * pixelsPerSecond)
	 		this.clouds1.x -= deltaPerSecond * 20;
		}

		if (this.clouds2.x <= -this.clouds1.width){
		    this.clouds2.x = this.clouds1.x + this.clouds1.width;
		}
		else {
			this.clouds2.x -= deltaPerSecond * 20;
		}
	};

	GameScene.prototype.tick = function(evt) {
		var deltaPerSecond = evt.delta / 1000;

		if (!createjs.Ticker.getPaused()) {
			this.moveClouds(deltaPerSecond);

			this.ground1.move(deltaPerSecond, this.ground2.x);
			this.ground2.move(deltaPerSecond, this.ground1.x);

			this.sonic.glideDown(deltaPerSecond);

			this.enemy.move(deltaPerSecond);

			// right-side collision: if sonic is past the right edge of the enemy,
			if (this.sonic.x >= this.enemy.x + this.enemy.width ||
				// left-side collision: if sonic is past the left edge of the enemy,
				this.sonic.x + this.sonic.width <= this.enemy.x ||
				// bottom collision: if sonic is underneath the enemy,
				this.sonic.y >= this.enemy.y + this.enemy.height ||
				// and top collision: if sonic is above the enemy
				this.sonic.y + this.sonic.height <= this.enemy.y ) {
				console.log('no collision');
			}
			else {
				console.log('collision occurred');

				this.sonic.die();
			}

			FLAPPYSONIC.stage.update(evt);
		}
	};
 
	return GameScene;

});