// TO-DO
// . Add id, w, h to balls and paddles


// Maximized
// var canvasWidth = window.screen.width * window.devicePixelRatio;
// var canvasHeight = window.screen.height * window.devicePixelRatio;
var canvasWidth = 800, canvasHeight = 800;

var ballWidth = 20;
var balls = [	{	x: 250, y: 200, prevX: 250, prevY: 200, velX: -100, velY: -10,
					dbg: {x: 200, y: 200, prevX: 200, prevY: 200, velX: -100, velY: -10}	
				}
			];

// Paddles
var paddleWidth = 20, paddleHeight = 50;
var paddles = 	[	{x: 0, y: 100},
					{x: canvasWidth - paddleWidth, y: 100}
				];

var minDist = 1;

// Time
var ts = 0;
var prevTs = 0;
var deltaT = 0;

var stop = false;
var stepFrame = false;

var mousePressBall = {x: -1, y: -1, pressing: false, ballIdx: -1};
var mouseReleaseBall = {x: -1, y: -1};

var dbgMode = 0;
var showDbgMenu = true;
var collidedSurface = {x1: -10, y1: -10, x2: -10, y2: -10};

var minDistSlider;

var checkpoints = [];

function drawBalls() {
	fill(255, 0, 0);

	for (var i = 0; i < balls.length; i++) {
		rect(balls[i].x, balls[i].y, ballWidth, ballWidth);
	}
}

// Determines the distance made by the ball in <ts> seconds
function distanceInTime(speed, ts) {
	return {x: speed.x * ts * .001,
			y: speed.y * ts * .001
			};
}

function highlightCollisionSurface() {
	if (collidedSurface.x1 === -10 || collidedSurface.x2 === -10 || collidedSurface.y1 === -10 || collidedSurface.y2 === -10) {
		return;
	}
	fill(255, 0, 0);
	rect(collidedSurface.x1, collidedSurface.y1, collidedSurface.x2, collidedSurface.y2);
	noFill();
}

function setCollidedSurface(x1, y1, x2, y2) {
	collidedSurface.x1 = x1;
	collidedSurface.x2 = x2;
	collidedSurface.y1 = y1;
	collidedSurface.y2 = y2;
}

function drawPaddles() {
	fill(0, 255, 0);
	rect(paddles[0].x, paddles[0].y, paddleWidth, paddleHeight);
	rect(paddles[1].x, paddles[1].y, paddleWidth, paddleHeight);
}

function calcDeltaT() {
	ts = new Date().getTime();
	deltaT = ts - prevTs;
	prevTs = ts;
}

// Object <obj> collision with walls
function collisionWithWalls(obj, objW, objH) {

	var collided = false;
	var thickness = 2;

	// Collide with right wall
	if (obj.x + objW > canvasWidth) {
		obj.velX *= -1;
		setCollidedSurface(canvasWidth - thickness, 0, thickness, canvasHeight);
		collided = true;
	}
	// Collide with left wall
	if (obj.x < 0) {
		obj.velX *= -1;
		setCollidedSurface(0, 0, thickness, canvasHeight);
		collided = true;		
	}
	// Collide with top wall
	if (obj.y < 0) {
		obj.velY *= -1;
		setCollidedSurface(0, 0, canvasWidth, thickness);
		collided = true;
	}
	// Collide with bottom wall
	if (obj.y + objH > canvasHeight) {
		obj.velY *= -1;
		setCollidedSurface(0, canvasHeight - thickness, canvasWidth, thickness);
		collided = true;
	}

	return collided;
}

// Object <obj> collision with paddles
function collisionWithPaddles(obj, objW, objH) {
	var rBallIntersect = obj.x + objW - (paddles[0].x);
	if (rBallIntersect <= 0) {
		return false;
	}
	var lBallIntersect = obj.x - (paddles[0].x + paddleWidth);
	if (lBallIntersect >= 0) {
		return false;
	}
	var tBallIntersect = obj.y - (paddles[0].y + paddleHeight);
	if (tBallIntersect >= 0) {
		return false;
	}
	var bBallIntersect = obj.y + objH - (paddles[0].y);
	if (bBallIntersect <= 0) {
		return false;
	}
	
	// Arriving here means the dbg line collided with a paddle
	reflectOnPaddle( 
		{	right: rBallIntersect,
			left: lBallIntersect,
			top: tBallIntersect,
			bottom: bBallIntersect
		},	obj, objW, objH
		);
	
	return true;
}

// Reflects an object in a paddle.
// obj: {x, y, velX, velY}
function reflectOnPaddle(intersection, obj, objW, objH) {
	var horizontalColisionArea = Math.min(Math.abs(intersection.right), 
		Math.abs(intersection.left));

	var verticalColisionArea = Math.min(Math.abs(intersection.top), 
		Math.abs(intersection.bottom));

	var thickness = 2;

	// Vertical surface reflection
	if (horizontalColisionArea <= verticalColisionArea) {
		// Collided with left surface
		if (obj.x < paddles[0].x) {
			setCollidedSurface(paddles[0].x - thickness, paddles[0].y, thickness, paddleHeight);
			obj.velX = Math.abs(obj.velX) * -1;
			obj.prevX = paddles[0].x - objW - 1;
		}
		// Collided with right surface
		else {
			setCollidedSurface(paddles[0].x + paddleWidth, paddles[0].y, thickness, paddleHeight);
			obj.velX = Math.abs(obj.velX);
			obj.prevX = paddles[0].x + paddleWidth + 1;
		}
	}

	// Horizontal surface reflection
	else {
		// Collided with top
		if (obj.y < paddles[0].y) {
			setCollidedSurface(paddles[0].x, paddles[0].y - thickness, paddleWidth, thickness);
			obj.velY = Math.abs(obj.velY) * -1;
			obj.prevY = paddles[0].y - objH - 1;
		}
		// Collided with bottom
		else  {
			setCollidedSurface(paddles[0].x, paddles[0].y + paddleHeight, paddleWidth, thickness);
			obj.velY = Math.abs(obj.velY);
			obj.prevY = paddles[0].y + paddleHeight + 1;
		}
	}
}

function nextEndingPosition(currentPos, speed, ts) {
	var nextPos = distanceInTime(speed, ts);
	return {x: nextPos.x + currentPos.x, y: nextPos.y + currentPos.y};
}

function nextMinPosition(nextPos, currentPos, mininumDist) {
	var angle = Math.atan2(nextPos.y - currentPos.y, nextPos.x - currentPos.x);
	var nextMinPos = {	x: Math.cos(angle) * mininumDist + currentPos.x,
						y: Math.sin(angle) * mininumDist + currentPos.y 
					};	
	return nextMinPos;
}

function collide(ts) {

	for (var i = 0; i < balls.length; i++) {
		var nextPos = nextEndingPosition({x: balls[i].x, y: balls[i].y}, {x: balls[i].velX, y: balls[i].velY}, ts);
		var nextMinPos = nextMinPosition(nextPos, {x: balls[i].x, y: balls[i].y}, minDist);

		var distToNextPos = sqrt((nextPos.x - balls[i].x)**2 + (nextPos.y - balls[i].y)**2);
		var numCollisionChecks = floor(distToNextPos / minDist) + 1;
		var tsPerCollision = ts / numCollisionChecks;
		for (var j = 0; j < numCollisionChecks; j++) {
			if (collisionWithWalls(balls[i], ballWidth, ballWidth) || collisionWithPaddles(balls[i], ballWidth, ballWidth)) {
				balls[i].x = balls[i].prevX;
				balls[i].y = balls[i].prevY;

				var partialTs = (numCollisionChecks - j) * tsPerCollision;
				nextPos = nextEndingPosition({x: balls[i].x, y: balls[i].y}, {x: balls[i].velX, y: balls[i].velY}, partialTs);
				j--;
			}

			nextMinPos = nextMinPosition(nextPos, {x: balls[i].x, y: balls[i].y}, minDist);

			balls[i].prevX = balls[i].x;
			balls[i].prevY = balls[i].y;
			balls[i].x = nextMinPos.x;
			balls[i].y = nextMinPos.y;
		}
		balls[i].x = nextPos.x;
		balls[i].y = nextPos.y;
	}
}

function visualDbg(ts) {

	for (var i = 0; i < balls.length; i++) {

		balls[i].dbg.x = balls[i].x;
		balls[i].dbg.y = balls[i].y;
		balls[i].dbg.velX = balls[i].velX;
		balls[i].dbg.velY = balls[i].velY;
		balls[i].dbg.prevX = balls[i].dbg.x;
		balls[i].dbg.prevY = balls[i].dbg.y;

		var collX = balls[i].dbg.x;
		var collY = balls[i].dbg.y;

		var nextPos = nextEndingPosition({x: balls[i].dbg.x, y: balls[i].dbg.y}, {x: balls[i].dbg.velX, y: balls[i].dbg.velY}, ts);
		var nextMinPos = nextMinPosition(nextPos, {x: balls[i].dbg.x, y: balls[i].dbg.y}, minDist);

		var distToNextPos = sqrt((nextPos.x - balls[i].dbg.x)**2 + (nextPos.y - balls[i].dbg.y)**2);
		var numCollisionChecks = floor(distToNextPos / minDist) + 1;
		var tsPerCollision = ts / numCollisionChecks;
		for (var j = 0; j < numCollisionChecks; j++) {

			if (collisionWithWalls(balls[i].dbg, ballWidth, ballWidth) || collisionWithPaddles(balls[i].dbg, ballWidth, ballWidth)) {
				// Go to previous position
				balls[i].dbg.x = balls[i].dbg.prevX;
				balls[i].dbg.y = balls[i].dbg.prevY;
				var partialTs = (numCollisionChecks - j) * tsPerCollision;

				nextPos = nextEndingPosition({x: balls[i].dbg.x, y: balls[i].dbg.y}, {x: balls[i].dbg.velX, y: balls[i].dbg.velY}, partialTs);

				stroke(255);
				line(collX, collY, balls[i].dbg.x, balls[i].dbg.y);
				stroke(0, 255, 255);
				line(collX, collY + ballWidth, balls[i].dbg.x, balls[i].dbg.y + ballWidth);
				noStroke();

				collX = balls[i].dbg.x;
				collY = balls[i].dbg.y;
				j--;
			}
			nextMinPos = nextMinPosition(nextPos, {x: balls[i].dbg.x, y: balls[i].dbg.y}, minDist);

			balls[i].dbg.prevX = balls[i].dbg.x;
			balls[i].dbg.prevY = balls[i].dbg.y;
			balls[i].dbg.x = nextMinPos.x;
			balls[i].dbg.y = nextMinPos.y;
		}
		balls[i].dbg.x = nextPos.x;
		balls[i].dbg.y = nextPos.y;

		stroke(255);
		line(collX, collY, balls[i].dbg.x, balls[i].dbg.y);
		stroke(0, 255, 255);
		line(collX, collY + ballWidth, balls[i].dbg.x, balls[i].dbg.y + ballWidth);
		noStroke();

		// Drawings
		highlightCollisionSurface();
		if (showDbgMenu) {
			drawDbgMenu();
		}
		else {
			minDistSlider.style('visibility', 'hidden');	
		}
	}
}

// Obj: {x, y, w, h}
function mouseInObj(obj) {
	return mouseX > obj.x && mouseX < obj.x + obj.w && mouseY > obj.y && mouseY < obj.y + obj.h;
}

function changeBallSpeed(newSpeed, ballIdx) {
	balls[ballIdx].velX = newSpeed.x;
	balls[ballIdx].velY = newSpeed.y;
}

function checkDbgInteraction(kCode) {
	if (kCode > 53 || kCode < 48) {
		return false;
	}
	dbgMode = kCode - 48;
	
	return true;
}

function changeDbgMenuEntryColor(mode) {
	if (dbgMode === mode) {
		return color(0, 255, 255);
	}
	return color(255);
}

function drawDbgMenu() {
	fill(255);

	textSize(32);
	text("Debug Menu (stop game to use)", 100, 100);

	textSize(22);
	fill(changeDbgMenuEntryColor(0));
	text("0 --- Reset", 100, 140);

	fill(changeDbgMenuEntryColor(1));
	text("1 --- Set Ball Vel", 100, 180);

	fill(changeDbgMenuEntryColor(2));
	text("2 --- Drag n Drop Ball", 100, 220);

	fill(changeDbgMenuEntryColor(3));
	text("3 --- Spawn ball", 100, 260);

	fill(changeDbgMenuEntryColor(4));
	text("4 --- Save checkpoint", 100, 300);

	fill(changeDbgMenuEntryColor(5));
	text("5 --- Restore last checkpoint", 100, 340);

	fill(255);
	text("Min Collision Dist (currently: " + minDistSlider.value() + ")", 100, 380);
	minDistSlider.style('visibility', 'visible');

	text("UP_ARROW --- Step by frame", 100, 420);

	text("SPACEBAR --- Start / Resume", 100, 460);

	text("ENTER --- Hide / Show Debug Menu", 100, 500);	
	noFill();
}

function dbgSaveInitialMousePos() {
	for (var i = 0; i < balls.length; i++) {
		var ballObj = {x: balls[i].x, y: balls[i].y, w: ballWidth, h: ballWidth}; 
		if (mouseInObj(ballObj)) {
			mousePressBall.pressing = true;
			mousePressBall.x = mouseX;
			mousePressBall.y = mouseY;
			mousePressBall.ballIdx = i;
			break;
		}
	}
}

function dbgSaveFinalMousePos() {
	if (mousePressBall.pressing === true) {
		mousePressBall.pressing = false;
		mouseReleaseBall.x = mouseX;
		mouseReleaseBall.y = mouseY;

		if (dbgMode === 1) {
			newSpeed = {x: mouseReleaseBall.x - mousePressBall.x,
						y: mouseReleaseBall.y - mousePressBall.y};

			changeBallSpeed(newSpeed, mousePressBall.ballIdx);
		}
		else if (dbgMode === 2) {
			balls[mousePressBall.ballIdx].x = mouseX;
			balls[mousePressBall.ballIdx].y = mouseY;
		}
	}
}

function spawnBall(x, y) {
	var newBall = {x: x, y: y, prevX: 100, prevY: 100, velX: -100, velY: 0};
	balls.push(newBall);
}

function saveCheckpoint() {
	// Save paddles
	var lPaddle = {x: paddles[0].x, y: paddles[0].y};
	var rPaddle = {x: paddles[1].x, y: paddles[1].y};

	// Save balls
	var tmpBalls = JSON.parse(JSON.stringify(balls));
	checkpoints.push({balls: tmpBalls, paddles: [lPaddle, rPaddle]});
}

function restoreCheckpoint() {
	var lastCheckpoint = checkpoints[checkpoints.length - 1];

	// Restore paddles
	paddles[0].x = lastCheckpoint.paddles[0].x;
	paddles[0].y = lastCheckpoint.paddles[0].y;

	// Restore balls
	balls = lastCheckpoint.balls;
}

//
// P5 built-in functions
//

function keyPressed() {
	if (keyCode === 32) { // Spacebar
		stop = !stop;
		if (stop === false) {
			prevTs = new Date().getTime();
		}
	} 

	else if (keyCode === 13) { // Enter
		showDbgMenu = !showDbgMenu;
	}

	if (!stop) {
		return false;
	}

	checkDbgInteraction(keyCode);

	if (keyCode == 52) { // 4
		saveCheckpoint();
	}
	else if (keyCode == 53) { // 5
		restoreCheckpoint();
	}

	else if (keyCode === 38) { // ARROW_UP
		stepFrame = true;
		prevTs = new Date().getTime();
	}

	return false;
}

function mousePressed() {
	if (stop === false) {
		return false;
	}

	if (dbgMode === 1 || dbgMode === 2) {
		dbgSaveInitialMousePos();
	}

	else if (dbgMode === 3) {
		spawnBall(mouseX, mouseY);
	}
}

function mouseReleased() { 
	if (stop === false) {
		return false;
	}
	
	if (dbgMode === 1 || dbgMode === 2) {
		dbgSaveFinalMousePos();
	}

	return false;
}

function setup() {
	createCanvas(canvasWidth, canvasHeight);
	prevTs = new Date().getTime();

	minDistSlider = createSlider(1, 100, 20);
	minDistSlider.position(100, 380);
	minDistSlider.style('visibility', 'hidden');
}

// Main loop
function draw() {
	background(0);
	minDist = minDistSlider.value();

	if (stop === false  || stepFrame === true) {
		calcDeltaT();
	}

	var paddlePosY = constrain(mouseY, paddleHeight/2, canvasHeight - paddleHeight/2);
	paddles[0].y += (paddlePosY - paddles[0].y) * .05;

	if (stop === false || stepFrame === true) {
		collide(deltaT);	
	}
	drawBalls();
	drawPaddles();

	visualDbg(1000);

	stepFrame = false;
}

module.exports = {
	distanceInTime:distanceInTime,
	nextEndingPosition:nextEndingPosition,
	nextMinPosition:nextMinPosition
};