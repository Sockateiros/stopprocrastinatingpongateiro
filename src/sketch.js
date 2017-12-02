var ballX = 250, ballY = 200;
var ballPrevX = ballX, ballPrevY = ballY;
var ballVelX = -100, ballVelY = 0;
var ballWidth = 20;

var balls = [	{	x: 250, y: 200, prevX: 250, prevY: 200, velX: -100, velY: -10,
					dbgX: 200, dbgY: 200, prevDbgX: 200, prevDbgY: 200, dbgVelX: -100, dbgVelY: -10	
				}
			];

// Maximized
// var canvasWidth = window.screen.width * window.devicePixelRatio;
// var canvasHeight = window.screen.height * window.devicePixelRatio;

var canvasWidth = 800, canvasHeight = 800;

var minDist = 1;

// Paddles
var paddleWidth = 20, paddleHeight = 50;
var paddleLX = 0, paddleLY = 100;
var paddleRX = canvasWidth - paddleWidth, paddleRY = 100;

// Time
var ts = 0;
var prevTs = 0;
var deltaT = 0;

var stop = false;

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

function collideWithWalls(ballIdx) {
	var collided = false;

	var thickness = 2;

	// Collide with right wall
	if (balls[ballIdx].x + ballWidth > canvasWidth) {
		setCollidedSurface(canvasWidth - thickness, 0, thickness, canvasHeight);

		balls[ballIdx].velX *= -1;
		collided = true;
	}
	// Collide with left wall
	if (balls[ballIdx].x < 0) {
		setCollidedSurface(0, 0, thickness, canvasHeight);

		balls[ballIdx].velX *= -1;
		collided = true;		
	}
	// Collide with top wall
	if (balls[ballIdx].y < 0) {
		setCollidedSurface(0, 0, canvasWidth, thickness);

		balls[ballIdx].velY *= -1;
		collided = true;
	}
	// Collide with bottom wall
	if (balls[ballIdx].y + ballWidth > canvasHeight) {
		setCollidedSurface(0, canvasHeight - thickness, canvasWidth, thickness);

		balls[ballIdx].velY *= -1;
		collided = true;
	}

	return collided;
}

function drawPaddles() {
	fill(0, 255, 0);
	rect(paddleLX, paddleLY, paddleWidth, paddleHeight);
	rect(paddleRX, paddleRY, paddleWidth, paddleHeight);
}

function calcDeltaT() {
	ts = new Date().getTime();
	deltaT = ts - prevTs;
	prevTs = ts;
}

function collidesWithWalls(ballIdx) {
	// Collide with left or right walls
	if (balls[ballIdx].dbgX + ballWidth > canvasWidth || balls[ballIdx].dbgX < 0) {
		balls[ballIdx].dbgVelX *= -1;
		return true;
	}

	// Collide with top or bottom walls
	if (balls[ballIdx].dbgY < 0 || balls[ballIdx].dbgY + ballWidth > canvasHeight) {
		balls[ballIdx].dbgVelY *= -1;
		return true;
	}

	return false;
}

// Reflects an object in a paddle.
// obj: {x, y, w, h, velX, velY}
function reflectOnPaddle(intersection, obj, ballIdx) {
	var horizontalColisionArea = Math.min(Math.abs(intersection.right), 
		Math.abs(intersection.left));

	var verticalColisionArea = Math.min(Math.abs(intersection.top), 
		Math.abs(intersection.bottom));

	var thickness = 2;
	var newObj = {x: obj.x, y: obj.y, velX: obj.velX, velY: obj.velY};

	// Vertical surface reflection
	if (horizontalColisionArea <= verticalColisionArea) {
		// Collided with left surface
		if (obj.x < paddleLX) {
			setCollidedSurface(paddleLX - thickness, paddleLY, thickness, paddleHeight);
			newObj.velX = Math.abs(obj.velX) * -1;
			newObj.x = paddleLX - obj.w - 1;
		}
		// Collided with right surface
		else {
			setCollidedSurface(paddleLX + paddleWidth, paddleLY, thickness, paddleHeight);
			newObj.velX = Math.abs(obj.velX);
			newObj.x = paddleLX + paddleWidth + 1;
		}
	}

	// Horizontal surface reflection
	else {
		// Collided with top
		if (obj.y < paddleLY) {
			setCollidedSurface(paddleLX, paddleLY - thickness, paddleWidth, thickness);
			newObj.velY = Math.abs(obj.velY) * -1;
			newObj.y = paddleLY - obj.h - 1;
		}
		// Collided with bottom
		else  {
			setCollidedSurface(paddleLX, paddleLY + paddleHeight, paddleWidth, thickness);
			newObj.velY = Math.abs(obj.velY);
			newObj.y = paddleLY + paddleHeight + 1;
		}
	}

	return newObj;
}

function collideWithPaddles(ballIdx) {

	var rBallIntersect = balls[ballIdx].x + ballWidth - (paddleLX);
	if (rBallIntersect <= 0) {
		return false;
	}
	var lBallIntersect = balls[ballIdx].x - (paddleLX + paddleWidth);
	if (lBallIntersect >= 0) {
		return false;
	}
	var tBallIntersect = balls[ballIdx].y - (paddleLY + paddleHeight);
	if (tBallIntersect >= 0) {
		return false;
	}
	var bBallIntersect = balls[ballIdx].y + ballWidth - (paddleLY);
	if (bBallIntersect <= 0) {
		return false;
	}
	
	// Arriving here means the ball collided with a paddle
	var obj = {x: balls[ballIdx].x, y: balls[ballIdx].y, w: ballWidth, h: ballWidth, velX: balls[ballIdx].velX, velY: balls[ballIdx].velY};
	var newObj = reflectOnPaddle( 
		{	right: rBallIntersect,
			left: lBallIntersect,
			top: tBallIntersect,
			bottom: bBallIntersect
		},	obj, ballIdx
		);

	balls[ballIdx].velX = newObj.velX;
	balls[ballIdx].velY = newObj.velY;
	balls[ballIdx].prevX = newObj.x;
	balls[ballIdx].prevY = newObj.y;

	return true;
}

function collidesWithPaddles(ballIdx) {
	var rBallIntersect = balls[ballIdx].dbgX + ballWidth - (paddleLX);
	if (rBallIntersect <= 0) {
		return false;
	}
	var lBallIntersect = balls[ballIdx].dbgX - (paddleLX + paddleWidth);
	if (lBallIntersect >= 0) {
		return false;
	}
	var tBallIntersect = balls[ballIdx].dbgY - (paddleLY + paddleHeight);
	if (tBallIntersect >= 0) {
		return false;
	}
	var bBallIntersect = balls[ballIdx].dbgY + ballWidth - (paddleLY);
	if (bBallIntersect <= 0) {
		return false;
	}
	
	// Arriving here means the dbg line collided with a paddle
	var obj = {x: balls[ballIdx].dbgX, y: balls[ballIdx].dbgY, w: ballWidth, h: ballWidth, velX: balls[ballIdx].dbgVelX, velY: balls[ballIdx].dbgVelY};
	var newObj = reflectOnPaddle( 
		{	right: rBallIntersect,
			left: lBallIntersect,
			top: tBallIntersect,
			bottom: bBallIntersect
		},	obj, ballIdx
		);

	balls[ballIdx].dbgVelX = newObj.velX;
	balls[ballIdx].dbgVelY = newObj.velY;
	balls[ballIdx].prevDbgX = newObj.x;
	balls[ballIdx].prevDbgY = newObj.y;
	
	return true;
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
			if (collideWithWalls(i) || collideWithPaddles(i)) {
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

		balls[i].dbgX = balls[i].x;
		balls[i].dbgY = balls[i].y;
		balls[i].dbgVelX = balls[i].velX;
		balls[i].dbgVelY = balls[i].velY;
		balls[i].prevDbgX = balls[i].dbgX;
		balls[i].prevDbgY = balls[i].dbgY;

		var collX = balls[i].dbgX;
		var collY = balls[i].dbgY;

		var nextPos = nextEndingPosition({x: balls[i].dbgX, y: balls[i].dbgY}, {x: balls[i].dbgVelX, y: balls[i].dbgVelY}, ts);
		var nextMinPos = nextMinPosition(nextPos, {x: balls[i].dbgX, y: balls[i].dbgY}, minDist);

		var distToNextPos = sqrt((nextPos.x - balls[i].dbgX)**2 + (nextPos.y - balls[i].dbgY)**2);
		var numCollisionChecks = floor(distToNextPos / minDist) + 1;
		var tsPerCollision = ts / numCollisionChecks;
		for (var j = 0; j < numCollisionChecks; j++) {

			if (collidesWithWalls(i) || collidesWithPaddles(i)) {
				// stop = true;

				// Go to previous position
				balls[i].dbgX = balls[i].prevDbgX;
				balls[i].dbgY = balls[i].prevDbgY;
				var partialTs = (numCollisionChecks - j) * tsPerCollision;

				nextPos = nextEndingPosition({x: balls[i].dbgX, y: balls[i].dbgY}, {x: balls[i].dbgVelX, y: balls[i].dbgVelY}, partialTs);

				stroke(255);
				line(collX, collY, balls[i].dbgX, balls[i].dbgY);
				stroke(0, 255, 255);
				line(collX, collY + ballWidth, balls[i].dbgX, balls[i].dbgY + ballWidth);
				noStroke();

				collX = balls[i].dbgX;
				collY = balls[i].dbgY;
				j--;
			}
			nextMinPos = nextMinPosition(nextPos, {x: balls[i].dbgX, y: balls[i].dbgY}, minDist);

			balls[i].prevDbgX = balls[i].dbgX;
			balls[i].prevDbgY = balls[i].dbgY;
			balls[i].dbgX = nextMinPos.x;
			balls[i].dbgY = nextMinPos.y;
		}
		balls[i].dbgX = nextPos.x;
		balls[i].dbgY = nextPos.y;

		stroke(255);
		line(collX, collY, balls[i].dbgX, balls[i].dbgY);
		stroke(0, 255, 255);
		line(collX, collY + ballWidth, balls[i].dbgX, balls[i].dbgY + ballWidth);
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

	text("SPACEBAR --- Start / Resume", 100, 420);

	text("ENTER --- Hide / Show Debug Menu", 100, 460);	
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
	var lPaddle = {x: paddleLX, y: paddleLY};
	var rPaddle = {x: paddleRX, y: paddleRY};

	// Save balls
	var tmpBalls = JSON.parse(JSON.stringify(balls));
	checkpoints.push({balls: tmpBalls, paddles: [lPaddle, rPaddle]});
}

function restoreCheckpoint() {
	var lastCheckpoint = checkpoints[checkpoints.length - 1];

	// Restore paddles
	paddleLX = lastCheckpoint.paddles[0].x;
	paddleLY = lastCheckpoint.paddles[0].y;

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

	if (keyCode === 13) { // Enter
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

	if (stop === false) {
		calcDeltaT();
	}

	var paddlePosY = constrain(mouseY, paddleHeight/2, canvasHeight - paddleHeight/2);
	paddleLY += (paddlePosY - paddleLY) * .05;

	if (stop === false) {
		collide(deltaT);	
	}
	drawBalls();
	drawPaddles();

	visualDbg(1000);
}

module.exports = {
	distanceInTime:distanceInTime,
	nextEndingPosition:nextEndingPosition,
	nextMinPosition:nextMinPosition
};