
var canvas = document.getElementById("gameCanvas"),
	canvasWidth = canvas.offsetWidth,
	canvasHeight = canvas.offsetHeight;

var stage = new createjs.Stage(canvas);

var messageField = new createjs.Text("Loading", "bold 24px Helvetica", "#FFFFFF");

messageField.textAlign = "center";
messageField.x = canvas.width / 2;
messageField.y = canvas.height / 2;

stage.addChild(messageField);
stage.update();

var manifest = [
    {
    	id:"floor",
    	src:"img/background1.png"
    },
    {
    	id:"clouds",
    	src:"img/background2.png"
    },
    {
    	id:"sonic",
    	src:"img/sonic.png"
    },
    {
    	id:"enemy",
    	src:"img/enemy.png"
    }
];

var preload = new createjs.LoadQueue();

preload.addEventListener("complete", doneLoading);
preload.addEventListener("progress", updateLoading);
preload.loadManifest(manifest);

function updateLoading() {  
    messageField.text = "Loading " + (preload.progress*100|0) + "%";

    stage.update();
}

function doneLoading(event) {
     messageField.text = "Click to start";

     watchRestart();
}

function watchRestart() {  
    canvas.addEventListener("click", handleClick);

    stage.addChild(messageField);

    stage.update();
}

function handleClick() {  
	console.log("handleClick");

    stage.removeAllChildren();

    restart();
}

// TODO: use clone()?

var floor,
	floor2,
	floorWidth,
	floorHeight,
	clouds,
	clouds2,
	cloudsWidth,
	cloudsHeight,
	sonic,
	enemy;

function restart() {
	console.log(stage);

    stage.removeAllChildren();
    canvas.removeEventListener("click", handleClick);

    canvas.addEventListener("click", flyUp);

    // establish floor tiles

    var floorImage = preload.getResult("floor");

	floor = new createjs.Bitmap(floorImage);
	floor2 = new createjs.Bitmap(floorImage);
	floorWidth = floor.getBounds().width;
	floorHeight = floor.getBounds().height;

	floor.x = 0;
    floor.y = canvasHeight - floorHeight;

    floor2.x = floorWidth;
	floor2.y = canvasHeight - floorHeight;

	// establish clouds tiles

	var cloudsImage = preload.getResult("clouds");

	clouds = new createjs.Bitmap(cloudsImage);
	clouds2 = new createjs.Bitmap(cloudsImage);
	cloudsWidth = clouds.getBounds().width;
	cloudsHeight = clouds.getBounds().height;

    clouds.x = 0;
    clouds.y = 0;

    clouds2.x = cloudsWidth;
	clouds2.y = 0;

	// establish sonic

	var sonicImage = preload.getResult("sonic");

	var dataSonic = new createjs.SpriteSheet({
		"images": [sonicImage],
		"frames": {
			"width": 64,
			"height": 64,
			"regX": 0,
			"regY": 0,
			"count": 9
		},
		"animations": {
			"up": [0, 2, "up"],
			"straight": [3, 5, "straight"],
			"down": [6, 8, "down"]
		}
	});

	sonic = new createjs.Sprite(dataSonic, "straight");

	sonic.framerate = 2;

	sonic.x = 50;
	sonic.y = 50;

	// establish enemy

	var enemyImage = preload.getResult("enemy");

	var dataEnemy = new createjs.SpriteSheet({
		"images": [enemyImage],
		"frames": {
			"width": 48,
			"height": 52,
			"regX": 0,
			"regY": 0,
			"count": 2
		},
		"animations": {
			"stay": [0, 1, "stay"]
		}
	});

	var enemies = [];

	for (var i = 0; i < 3; i++) {
		enemies[i] = new createjs.Sprite(dataEnemy, "stay");
		enemies[i].framerate = Math.floor((Math.random() * 8) + 1);
		enemies[i].x = 350;
		enemies[i].y = (50 * i) - 8;
	}

    stage.addChild(clouds, clouds2, floor, floor2, sonic);

    for (var i = 0; i < enemies.length; i++) {
          stage.addChild(enemies[i]);
    }

    if (!createjs.Ticker.hasEventListener("tick")) {
	    createjs.Ticker.addEventListener("tick", tick);
	    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
		createjs.Ticker.setFPS(30);
	}
}

function flyUp() {
	if (!createjs.Ticker.getPaused()) {
		sonic.y -= 30;

		sonic.gotoAndPlay("up");
	}
}

function tick(event) {
	if (!createjs.Ticker.getPaused()) {
		// (elapsedTimeInMS / 1000msPerSecond * pixelsPerSecond)
		floor.x -= event.delta / 1000 * 40;
		floor2.x -= event.delta / 1000 * 40;

	 	clouds.x -= event.delta / 1000 * 20;
		clouds2.x -= event.delta / 1000 * 20;

		if (floor.x <= -floorWidth){
		    floor.x = floor2.x + floorWidth;
		}

		if (floor2.x <= -floorWidth){
		    floor2.x = floor.x + floorWidth;
		}

		if (clouds.x <= -cloudsWidth){
		    clouds.x = clouds2.x + cloudsWidth;
		}

		if (clouds2.x <= -cloudsWidth){
		    clouds2.x = clouds.x + cloudsWidth;
		}

		sonic.y += event.delta / 1000 * 20;

		stage.update(event);
	}
}

function togglePause() {
	var paused = !createjs.Ticker.getPaused();

	createjs.Ticker.setPaused(paused);

	document.getElementById("pauseBtn").value = paused ? "unpause" : "pause";
}