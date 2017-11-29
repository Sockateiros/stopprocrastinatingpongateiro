var ballX = 50, ballY = 200;
var prevBallX = ballX, prevBallY = ballY;
var ballVelX = -300, ballVelY = 700;
var ballWidth = 20;

var dbgX = 200, dbgY = 200;
var prevDbgX = 200, prevDbgY = 200;
var dbgVelX = ballVelX, dbgVelY = ballVelY;

// Maximized
var canvasWidth = window.screen.width * window.devicePixelRatio;
var canvasHeight = window.screen.height * window.devicePixelRatio;

// var canvasWidth = 500, canvasHeight = 250;

var numCells = {x: canvasWidth / 50,
				y: canvasHeight / 25};
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

var mousePressBall = {x: -1, y: -1, pressing: false};
var mouseReleaseBall = {x: -1, y: -1};

var dbgMode = 0;

function drawBall() {
	fill(255, 0, 0);
	rect(ballX, ballY, ballWidth, ballWidth);
}

// Determines the distance made by the ball in <ts> seconds
function ballDistanceInTime(ts) {
	return {x: ballVelX * ts * .001,
			y: ballVelY * ts * .001
			};
}

// Determines the distance made by the ball in <ts> seconds
function distanceInTime(speed, ts) {
	return {x: speed.x * ts * .001,
			y: speed.y * ts * .001
			};
}

function moveDbg(ts) {
	var pos = dbgDistanceInTime(ts); 
	dbgX += pos.x
	dbgY += pos.y;	
}

function moveBall(ts) {
	var pos = ballDistanceInTime(ts); 
	ballX += pos.x
	ballY += pos.y;
}

function setSliderValues(vx, vy) {
	vxSlider.setValue(vx);
	vySlider.setValue(vy);
}

function collideWithWalls() {
	// Collide with left or right walls
	if (ballX + ballWidth > canvasWidth || ballX < 0) {
		ballVelX *= -1;
		return true;
	}

	// Collide with top or bottom walls
	if (ballY < 0 || ballY + ballWidth > canvasHeight) {
		ballVelY *= -1;
		return true;
	}

	return false;
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

function collidesWithWalls() {
	// Collide with left or right walls
	if (dbgX + ballWidth > canvasWidth || dbgX < 0) {
		dbgVelX *= -1;
		return true;
	}

	// Collide with top or bottom walls
	if (dbgY < 0 || dbgY + ballWidth > canvasHeight) {
		dbgVelY *= -1;
		return true;
	}

	return false;
}

function reflectBallOnPaddle(intersection) {
	var horizontalColisionArea = Math.min(Math.abs(intersection.right), 
		Math.abs(intersection.left));

	var verticalColisionArea = Math.min(Math.abs(intersection.top), 
		Math.abs(intersection.bottom));

	// Vertical surface reflection
	if (horizontalColisionArea <= verticalColisionArea) {
		ballVelX *= -1;
	}
	else {
		// Horizontal surface reflection
		ballVelY *= -1;
	}
}

function reflectDbgOnPaddle(intersection) {
	var horizontalColisionArea = Math.min(Math.abs(intersection.right), 
		Math.abs(intersection.left));

	var verticalColisionArea = Math.min(Math.abs(intersection.top), 
		Math.abs(intersection.bottom));

	// Vertical surface reflection
	if (horizontalColisionArea <= verticalColisionArea) {
		dbgVelX *= -1;
	}
	else {
		// Horizontal surface reflection
		dbgVelY *= -1;
	}
}

function collideWithPaddles() {
	var rBallIntersect = ballX + ballWidth - (paddleLX);
	if (rBallIntersect <= 0) {
		return false;
	}
	var lBallIntersect = ballX - (paddleLX + paddleWidth);
	if (lBallIntersect >= 0) {
		return false;
	}
	var tBallIntersect = ballY - (paddleLY + paddleHeight);
	if (tBallIntersect >= 0) {
		return false;
	}
	var bBallIntersect = ballY + ballWidth - (paddleLY);
	if (bBallIntersect <= 0) {
		return false;
	}
	
	// paddleLY = paddleLY;
	// ball.position = Object.assign({}, ball.oldPosition);

	// Arriving here means the ball collided with a paddle
	reflectBallOnPaddle( 
		{right: rBallIntersect,
		left: lBallIntersect,
		top: tBallIntersect,
		bottom: bBallIntersect
	});

	return true;
}

function collidesWithPaddles() {
	var rBallIntersect = dbgX + ballWidth - (paddleLX);
	if (rBallIntersect <= 0) {
		return false;
	}
	var lBallIntersect = dbgX - (paddleLX + paddleWidth);
	if (lBallIntersect >= 0) {
		return false;
	}
	var tBallIntersect = dbgY - (paddleLY + paddleHeight);
	if (tBallIntersect >= 0) {
		return false;
	}
	var bBallIntersect = dbgY + ballWidth - (paddleLY);
	if (bBallIntersect <= 0) {
		return false;
	}
	
	// Arriving here means the ball collided with a paddle
	reflectDbgOnPaddle( 
		{right: rBallIntersect,
		left: lBallIntersect,
		top: tBallIntersect,
		bottom: bBallIntersect
	});

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

	var nextPos = nextEndingPosition({x: ballX, y: ballY}, {x: ballVelX, y: ballVelY}, ts);
	var nextMinPos = nextMinPosition(nextPos, {x: ballX, y: ballY}, minDist);

	var distToNextPos = sqrt((nextPos.x - ballX)**2 + (nextPos.y - ballY)**2);
	var numCollisionChecks = floor(distToNextPos / minDist) + 1;

	for (var i = 0; i < numCollisionChecks; i++) {
		if (collideWithWalls() || collideWithPaddles()) {

			ballX = prevBallX;
			ballY = prevBallY;

			// Distance to next position
			var d = sqrt((nextPos.x - ballX)**2 + (nextPos.y - ballY)**2);

			var partialTs = ts * (d / distToNextPos);
			nextPos = nextEndingPosition({x: ballX, y: ballY}, {x: ballVelX, y: ballVelY}, partialTs);

			i--;
		}

		nextMinPos = nextMinPosition(nextPos, {x: ballX, y: ballY}, minDist);

		prevBallX = ballX;
		prevBallY = ballY;
		ballX = nextMinPos.x;
		ballY = nextMinPos.y;
	}
	ballX = nextPos.x;
	ballY = nextPos.y;
}

function visualDbg(ts) {

	dbgX = ballX;
	dbgY = ballY;
	dbgVelX = ballVelX;
	dbgVelY = ballVelY;
	prevDbgX = dbgX;
	prevDbgY = dbgY;

	var collX = dbgX;
	var collY = dbgY;

	var nextPos = nextEndingPosition({x: dbgX, y: dbgY}, {x: dbgVelX, y: dbgVelY}, ts);
	var nextMinPos = nextMinPosition(nextPos, {x: dbgX, y: dbgY}, minDist);

	var distToNextPos = sqrt((nextPos.x - dbgX)**2 + (nextPos.y - dbgY)**2);
	var numCollisionChecks = floor(distToNextPos / minDist) + 1;

	for (var i = 0; i < numCollisionChecks; i++) {

		if (collidesWithWalls() || collidesWithPaddles()) {
			// stop = true;

			// Go to previous position
			dbgX = prevDbgX;
			dbgY = prevDbgY;

			// Distance to next position
			var d = sqrt((nextPos.x - dbgX)**2 + (nextPos.y - dbgY)**2);

			var partialTs = ts * (d / distToNextPos);

			nextPos = nextEndingPosition({x: dbgX, y: dbgY}, {x: dbgVelX, y: dbgVelY}, partialTs);

			stroke(255);
			line(collX, collY, dbgX, dbgY);
			stroke(0, 255, 255);
			line(collX, collY + ballWidth, dbgX, dbgY + ballWidth);

			collX = dbgX;
			collY = dbgY;
			i--;
		}
		nextMinPos = nextMinPosition(nextPos, {x: dbgX, y: dbgY}, minDist);

		prevDbgX = dbgX;
		prevDbgY = dbgY;
		dbgX = nextMinPos.x;
		dbgY = nextMinPos.y;
	}
	dbgX = nextPos.x;
	dbgY = nextPos.y;

	stroke(255);
	line(collX, collY, dbgX, dbgY);
	stroke(0, 255, 255);
	line(collX, collY + ballWidth, dbgX, dbgY + ballWidth);
}

// Obj: {x, y, w, h}
function mouseInObj(obj) {
	return mouseX > obj.x && mouseX < obj.x + obj.w && mouseY > obj.y && mouseY < obj.y + obj.h;
}

function changeBallSpeed(newSpeed) {
	ballVelX = newSpeed.x;
	ballVelY = newSpeed.y;
}

function checkDbgInteraction(kCode) {
	if (kCode > 50 || kCode < 48) {
		return false;
	}
	dbgMode = kCode - 48;
	
	return true;
}

function drawDbgMenu() {
	fill(255);

	textSize(32);
	text("Debug Menu", 100, 100);

	textSize(22);
	text("0 - Reset", 100, 140);

	textSize(22);
	text("1 - Set Ball Vel", 100, 180);

	textSize(22);
	text("SPACEBAR - Start / Resume", 100, 220);
}

function dbgSaveInitialMousePos() {	
	var ballObj = {x: ballX, y: ballY, w: ballWidth, h: ballWidth}; 
	if (mouseInObj(ballObj)) {
		mousePressBall.pressing = true;
		mousePressBall.x = mouseX;
		mousePressBall.y = mouseY;
	}
}

function dbgSaveFinalMousePos() {
	if (mousePressBall.pressing === true) {
		mousePressBall.pressing = false;
		mouseReleaseBall.x = mouseX;
		mouseReleaseBall.y = mouseY;

		newSpeed = {x: mouseReleaseBall.x - mousePressBall.x,
					y: mouseReleaseBall.y - mousePressBall.y};

		changeBallSpeed(newSpeed);
	}
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

	if (stop) {
		checkDbgInteraction(keyCode);
	}

	return false;
}

function mousePressed() {
	if (stop === false) {
		return false;
	}
	
	if (dbgMode === 1) {
		console.log('mousePressed');
		dbgSaveInitialMousePos();
	}
	
	return false;
}

function mouseReleased() { 
	if (stop === false) {
		return false;
	}
	
	if (dbgMode === 1) {
		console.log('mouseReleased');
		dbgSaveFinalMousePos();
	}

	return false;
}

function setup() {
	// Maximized
	createCanvas(canvasWidth, canvasHeight);
	prevTs = new Date().getTime();
}

function draw() {
	background(0);
	if (stop === false) {
		calcDeltaT();
	}
	paddleLY = constrain(mouseY, paddleHeight/2, canvasHeight - paddleHeight/2);

	if (stop === false) {
		collide(deltaT);	
		// moveBall(deltaT);
	}
	drawBall();
	drawPaddles();
	visualDbg(1000);

	drawDbgMenu();
}

module.exports = {
	distanceInTime:distanceInTime,
	nextEndingPosition:nextEndingPosition,
	nextMinPosition:nextMinPosition
};