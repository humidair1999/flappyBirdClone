define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var LoadingScene = function() {
		this.loadingMessage = new createjs.Text('Loading', 'bold 24px Helvetica', '#FFFFFF');

		this.initialize();
	};

	// don't have to override prototype because it's not an actual
	//	createjs construct with a default initialize()

	LoadingScene.prototype.initialize = function() {
		this.loadingMessage.textAlign = 'center';
		this.loadingMessage.x = FLAPPYSONIC.canvasWidth / 2;
		this.loadingMessage.y = FLAPPYSONIC.canvasHeight / 2;
	};

	LoadingScene.prototype.render = function() {
		FLAPPYSONIC.stage.addChild(this.loadingMessage);

		FLAPPYSONIC.stage.update();

		return this;
	};

	LoadingScene.prototype.loadAssets = function() {
		var deferred = when.defer(),
			manifest = [
				// define images
			    {
			    	id: 'floor',
			    	src: 'img/background1.png'
			    },
			    {
			    	id: 'clouds',
			    	src: 'img/background2.png'
			    },
			    {
			    	id: 'sonic',
			    	src: 'img/sonic.png'
			    },
			    {
			    	id: 'sonicDead',
			    	src: 'img/sonicdeath.png'
			    },
			    {
			    	id: 'enemy',
			    	src: 'img/enemy.png'
			    },
			    // define audio
			    {
			    	id: 'wingsFlap',
			    	src: 'snd/flap.mp3'
			    },
			    {
			    	id: 'marbleZoneSong',
			    	src: 'snd/03-marble-zone.mp3'
			    }
			],
			filesLoaded = 0;

		var handleLoad = function() {
			filesLoaded++;

			this.loadingMessage.text = filesLoaded + ' of ' + manifest.length + ' files loaded';

	    	FLAPPYSONIC.stage.update();
		};

		var handleComplete = function() {
			this.loadingMessage.text = 'Click to start';

			FLAPPYSONIC.stage.update();

			deferred.resolve();
		};

		var handleLoadProxy = createjs.proxy(handleLoad, this);
		FLAPPYSONIC.loadQueue.addEventListener('fileload', handleLoadProxy);

		var handleCompleteProxy = createjs.proxy(handleComplete, this);
		FLAPPYSONIC.loadQueue.addEventListener('complete', handleCompleteProxy);

		FLAPPYSONIC.loadQueue.addEventListener('error', function(evt) {
			deferred.reject(evt.text);
		});

		FLAPPYSONIC.loadQueue.loadManifest(manifest);

		return deferred.promise;
	};
 
	return LoadingScene;

});