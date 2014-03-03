define([	'underscore',
			'when',
			'createjs'],
function(	_,
			when,
			createjs) {

	'use strict';

	var deadSonicImage = FLAPPYSONIC.loadQueue.getResult('sonicDead');

	var dataDeadSonic = new createjs.SpriteSheet({
		'images': [deadSonicImage],
		'frames': {
			'width': 48,
			'height': 64,
			'regX': 0,
			'regY': 0,
			'count': 2
		},
		'animations': {
			'jump': [0, 0, 'jump'],
		   	'fall': [1, 1, 'fall']
		}
	});

	var DeadSonic = function(sonicXPos, sonicYPos) {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		this.x = sonicXPos + 10;
		this.y = sonicYPos - 10;

		this.framerate = 1;
	};

	// don't have to override prototype because it's not an actual
	//	createjs construct with a default initialize()

	// var p = Button.prototype = new createjs.Container();
	// Button.prototype.Container_initialize = p.initialize;
	// Button.prototype.initialize = function(label) {
	//     this.Container_initialize();
	//     // add custom setup logic here.
	// }

	// TODO: why can't I proxy the fucking initialize() method here?

	DeadSonic.prototype = new createjs.Sprite(dataDeadSonic, 'jump');

	DeadSonic.prototype.plummet = _.once(function() {
		var deferred = when.defer();

		if (!createjs.Ticker.getPaused()) {
			createjs.Tween.get(this, { override: true })
				.to({ y: (this.y - 40) }, 300, createjs.Ease.getPowIn(2.2))
				.wait(300)
				.to({ y: FLAPPYSONIC.canvasHeight }, 800, createjs.Ease.cubicInOut)
				.wait(500)
				.call(function() {
					createjs.Sound.play('die', createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 0.8, 0);

					deferred.resolve();
				});
		}

		return deferred.promise;
	});
 
	return DeadSonic;

});