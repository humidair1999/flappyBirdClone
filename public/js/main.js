require([	'underscore',
			'when',
			'createjs',
			'scenes/loading',
			'scenes/game'],
function(	_,
			when,
			createjs,
			LoadingScene,
			GameScene) {

	'use strict';

	var clearStage = function() {
		FLAPPYSONIC.stage.removeAllChildren();

		FLAPPYSONIC.stage.update();
	};

	var initializeGame = function() {
		clearStage();

		loadingScene = null;

		FLAPPYSONIC.canvas.removeEventListener('click', initializeGame);

		var gameScene = new GameScene();

		gameScene.attachAssets().then(function() {
			gameScene.render();
		});
	};

	// create the canvas and cache some references to its metrics
    FLAPPYSONIC.canvas = document.getElementById('gameCanvas'),
	FLAPPYSONIC.canvasWidth = FLAPPYSONIC.canvas.offsetWidth,
	FLAPPYSONIC.canvasHeight = FLAPPYSONIC.canvas.offsetHeight;

	// create the createjs stage
	FLAPPYSONIC.stage = new createjs.Stage(FLAPPYSONIC.canvas);

	// create an asset loadqueue
	FLAPPYSONIC.loadQueue = new createjs.LoadQueue();

	// instantiate the first scene: a 'loading' screen
	var loadingScene = new LoadingScene();

	// TODO: an actual title screen would be cool

	loadingScene.render().loadAssets().then(function() {
		FLAPPYSONIC.canvas.addEventListener('click', initializeGame);
	}, function(errorMsg) {
		console.log('error loading assets: ', errorMsg);
	});

	

});