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
			that = this,
			enemies = [];

		// TODO: would be sweet to not have to load the assets separately like this
		require([	'backdrops/clouds',
					'entities/ground',
					'entities/sonic',
					'entities/dead-sonic',
					'entities/enemy',
					'ui/pause-button'],
		function(	Clouds,
					Ground,
					Sonic,
					DeadSonic,
					Enemy,
					PauseButton) {

			that.clouds1 = new Clouds(0);
			that.clouds2 = new Clouds(that.clouds1.width);

			that.ground1 = new Ground(0);
			that.ground2 = new Ground(that.ground1.width);

			that.sonic = new Sonic();
			that.deadSonic = new DeadSonic(that.sonic.x, that.sonic.y);

			for (var i = 0; i < 3; i++) {
				enemies[i] = new Enemy();

				enemies[i].x = (40 * i) + 300;
			}

			that.enemies = enemies;

			console.log(that.enemies);

			that.ui.pauseButton = new PauseButton();

			// TODO: remove this once canvas is proper size
			that.ui.barrierWall = new createjs.Shape();
			that.ui.barrierWall.graphics.beginFill("#ffffff").drawRect(319, 0, 1, 288);

			deferred.resolve();
		});

		return deferred.promise;
	};

	// cache a reference to these proxied listeners so that both the attachers and removers have access
	//	to the exact same proxies
	GameScene.prototype.generateListenerProxies = _.memoize(function() {
		return {
			flyUpProxy: createjs.proxy(this.sonic.flyUp, this.sonic),
			togglePauseProxy: createjs.proxy(this.ui.pauseButton.togglePause, this.ui.pauseButton)
		};
	});

	GameScene.prototype.attachListeners = function() {
		var listenerProxies = this.generateListenerProxies(),
			deferred = when.defer();

		console.log(listenerProxies);

		FLAPPYSONIC.canvas.addEventListener('click', listenerProxies.flyUpProxy);

		this.ui.pauseButton.addEventListener('click', listenerProxies.togglePauseProxy);

		deferred.resolve();

		return deferred.promise;
	};

	GameScene.prototype.removeListeners = function() {
		var listenerProxies = this.generateListenerProxies();

		console.log(FLAPPYSONIC.canvas);

		FLAPPYSONIC.canvas.removeEventListener('click', listenerProxies.flyUpProxy);

		// TODO: need to remove event for pause button?
		//this.ui.pauseButton.removeEventListener('click', listenerProxies.togglePauseProxy);
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
		FLAPPYSONIC.stage.addChild(this.clouds1, this.clouds2, this.ground1, this.ground2, this.sonic, this.ui.pauseButton, this.ui.barrierWall);

		for (var i = 0; i < this.enemies.length; i++) {
			FLAPPYSONIC.stage.addChildAt(this.enemies[i], (FLAPPYSONIC.stage.getChildIndex(this.ground2) + (i + 1)));
		}

		FLAPPYSONIC.stage.update();
	};

	// dead sonic only needs to ever be rendered once, so utilize the render as a singleton
	GameScene.prototype.renderDeadSonic = _.once(function() {
		var deferred = when.defer();

		this.deadSonic.x = this.sonic.x + 10;
		this.deadSonic.y = this.sonic.y - 10;

		FLAPPYSONIC.stage.addChildAt(this.deadSonic, (FLAPPYSONIC.stage.getChildIndex(this.sonic) + 1));

		deferred.resolve();

		return deferred.promise;
	});

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

	GameScene.prototype.handleDeath = _.once(function() {
		var that = this;

		this.removeListeners();

		this.sonic.die();

		this.renderDeadSonic().then(function(deadSonic) {
			return that.deadSonic.plummet();
		}).then(function() {
			that.endScene();
		});
	});

	GameScene.prototype.tick = function(evt) {
		var that = this,
			deltaPerSecond = evt.delta / 1000;

		if (!createjs.Ticker.getPaused()) {
			this.moveClouds(deltaPerSecond);

			this.ground1.move(deltaPerSecond, this.ground2.x);
			this.ground2.move(deltaPerSecond, this.ground1.x);

			this.sonic.glideDown(deltaPerSecond);

			for (var i = 0; i < this.enemies.length; i++) {
				this.enemies[i].move(deltaPerSecond);
			}

			// intentionally slow the rate at which collisions are checked; again, for performance reasons
			// time divided by change in time is evenly divisible by factor of 5
			if (Math.floor(evt.time / evt.delta % 5) === 0) {
				for (var j = 0; j < this.enemies.length; j++) {
					if (this.enemies[j].checkCollision(this.sonic.x, this.sonic.width, this.sonic.y, this.sonic.height)) {
						this.handleDeath();
					}
				}
			}

			FLAPPYSONIC.stage.update(evt);
		}
	};

	GameScene.prototype.endScene = _.once(function() {
		console.log('game over');
	});
 
	return GameScene;

});