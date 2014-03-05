define([	'underscore',
			'createjs',
			'radio'],
function(	_,
			createjs,
			radio) {

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

	var DeadSonic = function() {
		this.width = this.getBounds().width;
		this.height = this.getBounds().height;
		
		// we don't actually need to position dead sonic, as he will be positioned when
		//	sonic dies and he's rendered to the stage

		this.framerate = 1;

		this.initialize();
	};

	DeadSonic.prototype = new createjs.Sprite(dataDeadSonic, 'jump');

	DeadSonic.prototype.initialize = function() {
		// subscribe to various pubsub publishers
		radio('deadSonic:rendered').subscribe([this.plummet, this]);
	};

	DeadSonic.prototype.plummet = _.once(function() {
		if (!createjs.Ticker.getPaused()) {
			createjs.Tween.get(this, { override: true })
				.to({ y: (this.y - 40) }, 300, createjs.Ease.getPowIn(2.2))
				.wait(300)
				.to({ y: FLAPPYSONIC.canvas.height }, 800, createjs.Ease.cubicInOut)
				.wait(500)
				.call(function() {
					createjs.Sound.play('die', createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 0.8, 0);

					radio('deadSonic:finished').broadcast();
				});
		}
	});
 
	return DeadSonic;

});