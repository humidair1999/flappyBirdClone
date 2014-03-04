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
		// play the background music as soon as the game is instantiated; the user needs
		//	something to listen to while the rest of setup continues!
		createjs.Sound.play('marbleZoneSong', createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 1, 0);
	};

	GameScene.prototype.attachAssets = function() {
		var deferred = when.defer(),
			that = this;

		// TODO: would be sweet to not have to load the assets separately like this
		require([	'backdrops/clouds',
					'backdrops/ground',
					'entities/sonic',
					'entities/dead-sonic',
					'entities/enemy',
					'ui/pause-button',
					'ui/score'],
		function(	Clouds,
					Ground,
					Sonic,
					DeadSonic,
					Enemy,
					PauseButton,
					PlayerScore) {

			// for clouds and ground, pass in their x positions; for the second of each,
			//	base their x position on the x of the partner element

			that.clouds1 = new Clouds(0);
			that.clouds2 = new Clouds(that.clouds1.width);

			that.ground1 = new Ground(0);
			that.ground2 = new Ground(that.ground1.width);

			// note that sonic (the player) and dead sonic are two separate entities; this is
			//	because they utilize two different sprite sheets and sets of metrics

			that.sonic = new Sonic();
			that.deadSonic = new DeadSonic(that.sonic.x, that.sonic.y);

			that.enemy1 = new Enemy(0);
			that.enemy2 = new Enemy(that.enemy1.x);

			that.ui.pauseButton = new PauseButton();

			that.ui.playerScore = new PlayerScore();

			// TODO: remove this once canvas is proper size
			that.ui.barrierWall = new createjs.Shape();
			that.ui.barrierWall.graphics.beginFill("#ffffff").drawRect(319, 0, 1, 288);

			deferred.resolve();
		});

		return deferred.promise;
	};

	// memoize a reference to these proxied listeners so that both the attachers and removers have access
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

		FLAPPYSONIC.canvas.element.addEventListener('click', listenerProxies.flyUpProxy);

		this.ui.pauseButton.addEventListener('click', listenerProxies.togglePauseProxy);

		deferred.resolve();

		return deferred.promise;
	};

	GameScene.prototype.removeListeners = function() {
		var listenerProxies = this.generateListenerProxies();

		FLAPPYSONIC.canvas.element.removeEventListener('click', listenerProxies.flyUpProxy);

		this.ui.pauseButton.removeEventListener('click', listenerProxies.togglePauseProxy);

		FLAPPYSONIC.stage.removeChild(this.ui.pauseButton);

		FLAPPYSONIC.stage.update();
	};

	GameScene.prototype.startTicker = function() {
		var deferred = when.defer(),
			tickProxy;

		// if no event listener exists for the 'tick' event, create one
		if (!createjs.Ticker.hasEventListener('tick')) {
			// proxy the callback, so 'this' within the tick callback refers to this scene
			//	instance
			tickProxy = createjs.proxy(this.tick, this);

		    createjs.Ticker.addEventListener('tick', tickProxy);
		    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			createjs.Ticker.setFPS(30);

			deferred.resolve();
		}
		// otherwise, can assume the listener already exists
		else {
			deferred.resolve();
		}

		return deferred.promise;
	};

	GameScene.prototype.render = function() {
		FLAPPYSONIC.stage.addChild(	this.clouds1,
									this.clouds2,
									this.ground1,
									this.ground2,
									this.enemy1,
									this.enemy2,
									this.sonic,
									this.ui.pauseButton,
									this.ui.playerScore,
									this.ui.barrierWall);

		FLAPPYSONIC.stage.update();
	};

	// dead sonic only needs to ever be rendered once, so utilize the render as a singleton
	GameScene.prototype.renderDeadSonic = _.once(function() {
		var deferred = when.defer();

		// slightly manipulate dead sonic's position so he appears in the center of live sonic
		this.deadSonic.x = this.sonic.x + 10;
		this.deadSonic.y = this.sonic.y - 10;

		// add dead sonic to the stage directly after live sonic, to make him appear on top
		FLAPPYSONIC.stage.addChildAt(this.deadSonic, (FLAPPYSONIC.stage.getChildIndex(this.sonic) + 1));

		FLAPPYSONIC.stage.update();

		deferred.resolve();

		return deferred.promise;
	});

	GameScene.prototype.moveClouds = function(pixelsPerDelta) {
		if (this.clouds1.x <= -this.clouds1.width){
		    this.clouds1.x = this.clouds2.x + this.clouds2.width;
		}
		else {
	 		this.clouds1.x -= pixelsPerDelta;
		}

		if (this.clouds2.x <= -this.clouds2.width){
		    this.clouds2.x = this.clouds1.x + this.clouds1.width;
		}
		else {
			this.clouds2.x -= pixelsPerDelta;
		}
	};

	GameScene.prototype.moveGround = function(pixelsPerDelta) {
		if (this.ground1.x <= -this.ground1.width){
		    this.ground1.x = this.ground2.x + this.ground2.width - 4;
		}
		else {
	 		this.ground1.x -= pixelsPerDelta;
		}

		if (this.ground2.x <= -this.ground2.width){
		    this.ground2.x = this.ground1.x + this.ground1.width - 4;
		}
		else {
			this.ground2.x -= pixelsPerDelta;
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
			// convert delta from milliseconds into seconds
			deltaInSeconds = evt.delta / 1000;

		if (!createjs.Ticker.getPaused()) {
			// every delta (or 'change event'), move a fraction of total pixels per second
			//	(33.999 / 1000) * 20
			//	= 0.0339 * 20
			//	= 0.639 pixels per delta
			this.moveClouds(deltaInSeconds * 20);
			this.moveGround(deltaInSeconds * 40);

			this.sonic.tick(evt, deltaInSeconds);

			this.enemy1.tick(evt, deltaInSeconds, this.enemy2.x, this.enemy2.width, this.enemy2.xSpacing);
			this.enemy2.tick(evt, deltaInSeconds, this.enemy1.x, this.enemy1.width, this.enemy1.xSpacing);

			// intentionally slow the rate at which collisions are checked; again, for performance reasons
			// time divided by change in time is evenly divisible by factor of 5
			if (Math.floor(evt.time / evt.delta % 5) === 0) {
				if (this.sonic.x >= (this.enemy1.x + this.enemy1.width) ||
					this.sonic.x >= (this.enemy2.x + this.enemy2.width)) {
					this.ui.playerScore.increaseScore();
				}

				if (this.enemy1.checkCollision(	this.sonic.x,
												this.sonic.width,
												this.sonic.y,
												this.sonic.height) ||
					this.enemy2.checkCollision(	this.sonic.x,
												this.sonic.width,
												this.sonic.y,
												this.sonic.height)) {
						this.handleDeath();
				}

				if (this.sonic.y + this.sonic.height >= FLAPPYSONIC.canvas.height) {
					this.handleDeath();
				}
			}

			FLAPPYSONIC.stage.update(evt);
		}
	};

	GameScene.prototype.endScene = _.once(function() {
		var deferreds = [];

		var fadeChild = function(element) {
			var deferred = when.defer();

			createjs.Tween.get(element).to({alpha:0}, 1000).call(function() {
				console.log('done');

				deferred.resolve();
			});

			return deferred.promise;
		};

		_.each(FLAPPYSONIC.stage.children, function(element) {
			deferreds.push(fadeChild(element));
		});

		when.all(deferreds).then(function() {
			window.location.reload(false);
		});
	});
 
	return GameScene;

});