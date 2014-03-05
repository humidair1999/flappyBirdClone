define([	'underscore',
			'when',
			'createjs',
			'radio'],
function(	_,
			when,
			createjs,
			radio) {

	'use strict';

	// function definitions to be used as event listener callbacks

	var publishPlayerClick = function() {
		radio('player:click').broadcast();
	};

	var publishPlayerPause = function() {
		radio('player:pause').broadcast();
	};

	// scene constructor

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

		// subscribe to various pubsub publishers
		radio('sonic:tick').subscribe([this.hasHitGround, this]);

		radio('sonic:collided').subscribe([this.handleDeath, this]);

		radio('deadSonic:finished').subscribe([this.endScene, this]);
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
			that.deadSonic = new DeadSonic();

			// place the first enemy directly off-screen on instantiation, and place the second
			//	behind it, based on the first's calculations

			that.enemy1 = new Enemy(FLAPPYSONIC.canvas.width, false);
			that.enemy2 = new Enemy((that.enemy1.x + that.enemy1.width), true);

			that.ui.pauseButton = new PauseButton();

			that.ui.playerScore = new PlayerScore();

			deferred.resolve();
		});

		return deferred.promise;
	};

	GameScene.prototype.attachListeners = function() {
		var deferred = when.defer();

		FLAPPYSONIC.canvas.element.addEventListener('click', publishPlayerClick);

		this.ui.pauseButton.addEventListener('click', publishPlayerPause);

		deferred.resolve();

		return deferred.promise;
	};

	GameScene.prototype.removeListeners = function() {
		FLAPPYSONIC.canvas.element.removeEventListener('click', publishPlayerClick);

		this.ui.pauseButton.removeEventListener('click', publishPlayerPause);

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
									this.ui.playerScore);

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

	GameScene.prototype.tick = function(evt) {
		// convert delta from milliseconds into seconds
		var deltaInSeconds = evt.delta / 1000;

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

			FLAPPYSONIC.stage.update(evt);
		}
	};

	// functions for moving scenery/backdrops

	GameScene.prototype.moveClouds = function(pixelsPerDelta) {
		if (this.clouds1.x <= -this.clouds1.width) {
		    this.clouds1.x = this.clouds2.x + this.clouds2.width;
		}
		else {
	 		this.clouds1.x -= pixelsPerDelta;
		}

		if (this.clouds2.x <= -this.clouds2.width) {
		    this.clouds2.x = this.clouds1.x + this.clouds1.width;
		}
		else {
			this.clouds2.x -= pixelsPerDelta;
		}
	};

	GameScene.prototype.moveGround = function(pixelsPerDelta) {
		if (this.ground1.x <= -this.ground1.width) {
			// push the ground just a tiny bit left after moving it, because a little overlap
			//	in the ground pieces is better than having a weird tiny gap
		    this.ground1.x = this.ground2.x + this.ground2.width - 4;
		}
		else {
	 		this.ground1.x -= pixelsPerDelta;
		}

		if (this.ground2.x <= -this.ground2.width) {
		    this.ground2.x = this.ground1.x + this.ground1.width - 4;
		}
		else {
			this.ground2.x -= pixelsPerDelta;
		}
	};
 
	// pubsub callbacks

	// since scenery is considered inanimate objects that don't directly interact with
	//	player, the scene handles interactions with them
	GameScene.prototype.hasHitGround = function(sonicXPos, sonicYPos, sonicWidth, sonicHeight) {
		if ((sonicYPos + sonicHeight) >= FLAPPYSONIC.canvas.height) {
			radio('sonic:collided').broadcast();
		}
	};

	GameScene.prototype.handleDeath = _.once(function() {
		this.removeListeners();

		this.renderDeadSonic().then(function() {
			radio('deadSonic:rendered').broadcast();
		});
	});

	GameScene.prototype.endScene = _.once(function() {
		var deferreds = [];

		var fadeChild = function(element) {
			var deferred = when.defer();

			createjs.Tween.get(element).to({alpha:0}, 1000).call(function() {
				deferred.resolve();
			});

			return deferred.promise;
		};

		// for every item on the stage, execute the fadeChild function and push its resultant
		//	resolved deferred into the deferreds array
		_.each(FLAPPYSONIC.stage.children, function(element) {
			deferreds.push(fadeChild(element));
		});

		// when every item has been successfully faded, refresh the browser, effectively
		//	restarting the game
		when.all(deferreds).then(function() {
			window.location.reload(false);
		});
	});

	return GameScene;

});