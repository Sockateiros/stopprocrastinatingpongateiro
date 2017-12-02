var ballX = 250, ballY = 200;
var ballPrevX = ballX, ballPrevY = ballY;
var ballVelX = -100, ballVelY = 0;
var ballWidth = 20;

var balls = [	{x: 250, y: 200, prevX: 250, prevY: 200, velX: -100, velY: -10}
			];

// Replacements:
// ballX 		balls[0].x
// ballY 		balls[0].y
// ballPrevX	balls[0].prevX
// ballPrevY	balls[0].prevY
// ballVelX		balls[0].velX 
// ballVelY		balls[0].velY

var dbgX = 200, dbgY = 200;
var prevDbgX = 200, prevDbgY = 200;
var dbgVelX = balls[0].velX, dbgVelY = balls[0].velY;

// Maximized
// var canvasWidth = window.screen.width * window.devicePixelRatio;
// var canvasHeight = window.screen.height * window.devicePixelRatio;

var canvasWidth = 800, canvasHeight = 450;

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
var showDbgMenu = true;
var collidedSurface = {x1: -10, y1: -10, x2: -10, y2: -10};

var minDistSlider;

function drawBalls() {
	fill(255, 0, 0);

	for (var i = 0; i < balls.length; i++) {
		rect(balls[i].x, balls[i].y, ballWidth, ballWidth);
	}
}

// Determines the distance made by the ball in <ts> seconds
function ballDistanceInTime(ts) {
	return {x: balls[0].velX * ts * .001,
			y: balls[0].velY * ts * .001
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
	balls[0].x += pos.x
	balls[0].y += pos.y;
}

function setSliderValues(vx, vy) {
	vxSlider.setValue(vx);
	vySlider.setValue(vy);
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
		if (balls[ballIdx].x < paddleLX) {
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
		if (balls[ballIdx].y < paddleLY) {
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

	// balls[0].x = newObj.x;
	// balls[0].y = newObj.y;
	balls[ballIdx].velX = newObj.velX;
	balls[ballIdx].velY = newObj.velY;
	balls[ballIdx].prevX = newObj.x;
	balls[ballIdx].prevY = newObj.y;
	// balls[0].prevX = canvasWidth / 2;
	// balls[0].prevY = canvasHeight / 2;

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
	
	// Arriving here means the dbg line collided with a paddle
	var obj = {x: dbgX, y: dbgY, w: ballWidth, h: ballWidth, velX: dbgVelX, velY: dbgVelY};
	var newObj = reflectOnPaddle( 
		{	right: rBallIntersect,
			left: lBallIntersect,
			top: tBallIntersect,
			bottom: bBallIntersect
		},	obj
		);

	// dbgX = newObj.x;
	// dbgY = newObj.y;
	dbgVelX = newObj.velX;
	dbgVelY = newObj.velY;
	prevDbgX = newObj.x;
	prevDbgY = newObj.y;
	
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

	dbgX = balls[0].x;
	dbgY = balls[0].y;
	dbgVelX = balls[0].velX;
	dbgVelY = balls[0].velY;
	prevDbgX = dbgX;
	prevDbgY = dbgY;

	var collX = dbgX;
	var collY = dbgY;

	var nextPos = nextEndingPosition({x: dbgX, y: dbgY}, {x: dbgVelX, y: dbgVelY}, ts);
	var nextMinPos = nextMinPosition(nextPos, {x: dbgX, y: dbgY}, minDist);

	var distToNextPos = sqrt((nextPos.x - dbgX)**2 + (nextPos.y - dbgY)**2);
	var numCollisionChecks = floor(distToNextPos / minDist) + 1;
	var tsPerCollision = ts / numCollisionChecks;
	for (var i = 0; i < numCollisionChecks; i++) {

		if (collidesWithWalls() || collidesWithPaddles()) {
			// stop = true;

			// Go to previous position
			dbgX = prevDbgX;
			dbgY = prevDbgY;
			var partialTs = (numCollisionChecks - i) * tsPerCollision;

			nextPos = nextEndingPosition({x: dbgX, y: dbgY}, {x: dbgVelX, y: dbgVelY}, partialTs);

			stroke(255);
			line(collX, collY, dbgX, dbgY);
			stroke(0, 255, 255);
			line(collX, collY + ballWidth, dbgX, dbgY + ballWidth);
			noStroke();

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

// Obj: {x, y, w, h}
function mouseInObj(obj) {
	return mouseX > obj.x && mouseX < obj.x + obj.w && mouseY > obj.y && mouseY < obj.y + obj.h;
}

function changeBallSpeed(newSpeed) {
	balls[0].velX = newSpeed.x;
	balls[0].velY = newSpeed.y;
}

function checkDbgInteraction(kCode) {
	if (kCode > 51 || kCode < 48) {
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

	fill(255);
	text("Min Collision Dist (currently: " + minDistSlider.value() + ")", 100, 300);
	minDistSlider.style('visibility', 'visible');

	text("SPACEBAR --- Start / Resume", 100, 340);

	text("ENTER --- Hide / Show Debug Menu", 100, 380);	
}

function dbgSaveInitialMousePos() {	
	var ballObj = {x: balls[0].x, y: balls[0].y, w: ballWidth, h: ballWidth}; 
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

		if (dbgMode === 1) {
			newSpeed = {x: mouseReleaseBall.x - mousePressBall.x,
						y: mouseReleaseBall.y - mousePressBall.y};

			changeBallSpeed(newSpeed);
		}
		else if (dbgMode === 2) {
			balls[0].x = mouseX;
			balls[0].y = mouseY;
		}
	}
}

function spawnBall(x, y) {
	var newBall = {x: x, y: y, prevX: 100, prevY: 100, velX: -100, velY: 0};
	balls.push(newBall);
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

	if (stop) {
		checkDbgInteraction(keyCode);
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
	minDistSlider.position(100, 300);
	minDistSlider.style('visibility', 'hidden');
}

// Main loop
function draw() {
	background(0);
	minDist = minDistSlider.value();

	if (stop === false) {
		calcDeltaT();
	}
	paddleLY = constrain(mouseY, paddleHeight/2, canvasHeight - paddleHeight/2);

	if (stop === false) {
		collide(deltaT);	
	}
	drawBalls();
	drawPaddles();

	// visualDbg(1000);
}

module.exports = {
	distanceInTime:distanceInTime,
	nextEndingPosition:nextEndingPosition,
	nextMinPosition:nextMinPosition
};