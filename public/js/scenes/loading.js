define([	'when',
			'createjs'],
function(	when,
			createjs) {

	'use strict';

	// manifest array representing all the assets required within the game
	var manifest = [
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
	    	id: 'flap',
	    	src: 'snd/flap.mp3'
	    },
	    {
	    	id: 'crash',
	    	src: 'snd/crash.mp3'
	    },
	    {
	    	id: 'die',
	    	src: 'snd/die.mp3'
	    },
	    {
	    	id: 'marbleZoneSong',
	    	src: 'snd/03-marble-zone.mp3'
	    }
	];

	var LoadingScene = function() {
		this.filesLoaded = 0;

		this.initialize();
	};

	// don't have to override prototype because it's not an actual
	//	createjs construct with a default initialize()
	LoadingScene.prototype.initialize = function() {
		this.loadingMessage = new createjs.Text('Loading', 'bold 24px Helvetica', '#FFFFFF');

		this.loadingMessage.textAlign = 'center';
		this.loadingMessage.x = FLAPPYSONIC.canvas.width / 2;
		this.loadingMessage.y = FLAPPYSONIC.canvas.height / 2;
	};

	LoadingScene.prototype.render = function() {
		var deferred = when.defer();

		FLAPPYSONIC.stage.addChild(this.loadingMessage);

		FLAPPYSONIC.stage.update();

		deferred.resolve();

		return deferred.promise;
	};

	LoadingScene.prototype.loadAssets = function() {
		var deferred = when.defer();

		var handleLoad = function() {
			this.filesLoaded++;

			this.loadingMessage.text = this.filesLoaded + ' of ' + manifest.length + ' files loaded';

	    	FLAPPYSONIC.stage.update();
		};

		var handleComplete = function() {
			this.loadingMessage.text = 'Click to start';

			FLAPPYSONIC.stage.update();

			deferred.resolve();
		};

		// we have to proxy the callbacks to ensure 'this' within them is still bound to
		//	the scene; note that you could also either simply alias 'this' or utilize underscore's
		//	bind() functions to accomplish the same end goal

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