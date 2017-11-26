var ballX = 200, ballY = 200;
var prevBallX = ballX, prevBallY = ballY;
var ballVelX = 500, ballVelY = 500;
var ballWidth = 20;

var dbgX = 200, dbgY = 200;
var prevDbgX = 200, prevDbgY = 200;
var dbgVelX = ballVelX, dbgVelY = ballVelY;

var canvasWidth = 500, canvasHeight = 250;

var numCells = {x: canvasWidth / 50,
				y: canvasHeight / 25};
var minDist = 5;

// Paddles
var paddleWidth = 20, paddleHeight = 50;
var paddleLX = 0, paddleLY = 100;
var paddleRX = canvasWidth - paddleWidth, paddleRY = 100;

// Time
var ts = 0;
var prevTs = 0;
var deltaT = 0;

var stop = false;

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
		if (collideWithWalls()) {
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

		if (collidesWithWalls()) {
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
}

function keyPressed() {
	if (keyCode === LEFT_ARROW) {
		stop = true;
	} 
	else if (keyCode === RIGHT_ARROW) {
		stop = false;
		prevTs = new Date().getTime();
	}

	return false;
}

function setup() {
	// Maximized
	//createCanvas(window.screen.width * window.devicePixelRatio, window.screen.height * window.devicePixelRatio);
	// frameRate(10);
	createCanvas(canvasWidth, canvasHeight);
	prevTs = new Date().getTime();
}

function draw() {
	if (stop === false) {
		background(0);

		calcDeltaT();

		paddleLY = constrain(mouseY, paddleHeight/2, canvasHeight - paddleHeight/2);
		
		collide(deltaT);
		
		// moveBall(deltaT);

		drawBall();
		drawPaddles();

		// visualDbg(1000);
	}
}

module.exports = {
	distanceInTime:distanceInTime,
	nextEndingPosition:nextEndingPosition,
	nextMinPosition:nextMinPosition
};