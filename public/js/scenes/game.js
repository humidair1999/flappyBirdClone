define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var GameScene = function() {
		this.initialize();
	};

	// don't have to override prototype because it's not an actual
	//	createjs construct with a default initialize()

	GameScene.prototype.initialize = function() {
		console.log('init game');

		// TODO: use pubsub to make sonic fly

		//canvas.addEventListener("click", flyUp);

		if (!createjs.Ticker.hasEventListener("tick")) {
			var tickProxy = createjs.proxy(this.tick, this);

		    createjs.Ticker.addEventListener("tick", tickProxy);
		    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
			createjs.Ticker.setFPS(30);
		}
	};

	GameScene.prototype.attachAssets = function() {
		var deferred = when.defer(),
			that = this;

		require(['backdrops/clouds'], function(Clouds) {
			that.clouds1 = new Clouds(0);
			that.clouds2 = new Clouds(that.clouds1.width);

			deferred.resolve();
		});

		return deferred.promise;
	};

	GameScene.prototype.render = function() {
		FLAPPYSONIC.stage.addChild(this.clouds1, this.clouds2);

		FLAPPYSONIC.stage.update();
	};

	GameScene.prototype.tick = function(evt) {
		if (!createjs.Ticker.getPaused()) {
			// (elapsedTimeInMS / 1000msPerSecond * pixelsPerSecond)
		 	this.clouds1.x -= evt.delta / 1000 * 20;
			this.clouds2.x -= evt.delta / 1000 * 20;

			if (this.clouds1.x <= -this.clouds1.width){
			    this.clouds1.x = this.clouds2.x + this.clouds1.width;
			}

			if (this.clouds2.x <= -this.clouds1.width){
			    this.clouds2.x = this.clouds1.x + this.clouds1.width;
			}

			FLAPPYSONIC.stage.update(evt);
		}
	};
 
	return GameScene;

});