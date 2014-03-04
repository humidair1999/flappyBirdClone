require([	'when',
			'createjs',
			'scenes/loading',
			'scenes/game'],
function(	when,
			createjs,
			LoadingScene,
			GameScene) {

	'use strict';

	// grab the canvas using good-ol' vanilla js
	var canvasElement = document.getElementById('gameCanvas');

	var clearStage = function() {
		FLAPPYSONIC.stage.removeAllChildren();

		FLAPPYSONIC.stage.update();
	};

	var initializeGame = function() {
		clearStage();

		// set the loading scene to null in order to assist with garbage collection
		loadingScene = null;

		// remove the event listeners currently attached to the canvas; normally, these events
		//	would be attached to an element within the stage, and would be removed as part of the
		//	stage cleanup process
		FLAPPYSONIC.canvas.element.removeEventListener('click', initializeGame);

		// instantiate the second scene: the actual 'game' screen
		var gameScene = new GameScene();

		gameScene.attachAssets().then(function() {
			return gameScene.attachListeners();
		}).then(function() {
			return gameScene.startTicker();
		}).then(function() {
			gameScene.render();
		}, function() {
			console.log('failed to instantiate game scene');
		});
	};

	// create the canvas and cache some references to its metrics
	FLAPPYSONIC.canvas = {
		element: canvasElement,
		width: canvasElement.offsetWidth,
		height: canvasElement.offsetHeight
	};

	// create the createjs stage
	FLAPPYSONIC.stage = new createjs.Stage(FLAPPYSONIC.canvas.element);

	// create a createjs asset loadqueue and install the createjs sound plugin
	FLAPPYSONIC.loadQueue = new createjs.LoadQueue();
	FLAPPYSONIC.loadQueue.installPlugin(createjs.Sound);

	// instantiate the first scene: a 'loading' screen
	var loadingScene = new LoadingScene();

	// loading scene is rendered first because we want to show the loading progress to the
	//	user; after the assets are loaded, attach a click handler to begin the game
	loadingScene.render().then(function() {
		return loadingScene.loadAssets();
	}).then(function() {
		FLAPPYSONIC.canvas.element.addEventListener('click', initializeGame);
	}, function(errorMsg) {
		console.log('error loading assets: ', errorMsg);
	});

});