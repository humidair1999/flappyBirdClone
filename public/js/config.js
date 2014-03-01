require.config({
	baseUrl: 'js/',
    paths: {
    	// subdirectory paths
    	scenes: 'scenes',
    	backdrops: 'backdrops',
    	entities: 'entities',

        underscore: 'libs/underscore',
        radio: 'libs/radio.min',
        when: 'libs/when',
        createjs: 'libs/createjs-2013.12.12.min'
    },
    urlArgs: 'bust=' +  (new Date()).getTime(),
    // TODO: exports only required for non-AMD modules
    shim: {
        'underscore': {
            exports: '_'
        },
        'radio': {
        	exports: 'radio'
        },
        'when': {
        	exports: 'when'
        },
        'createjs': {
        	exports: 'createjs'
        }
    }
});