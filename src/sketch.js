// TO-DO
// . Add id, w, h to balls and paddles

// Maximized
var canvasWidth = window.screen.width * window.devicePixelRatio;
var canvasHeight = window.screen.height * window.devicePixelRatio;
// var canvasWidth = 800, canvasHeight = 800;

var ballWidth = 20;
var balls = [	{	x: 100, y: 100, prevX: 250, prevY: 200, velX: 100, velY: 0, prevVelX: 100, prevVelY: 0,
					dbg: {x: 200, y: 200, prevX: 200, prevY: 200, velX: -100, velY: -10, prevVelX: 100, prevVelY: 0}	
				},
				{	x: 200, y: 100, prevX: 250, prevY: 200, velX: -200, velY: 0, prevVelX: 100, prevVelY: 0,
					dbg: {x: 200, y: 200, prevX: 200, prevY: 200, velX: -100, velY: -10, prevVelX: 100, prevVelY: 0}	
				}/*,
				{	x: 150, y: 50, prevX: 250, prevY: 200, velX: 0, velY: 100, prevVelX: 100, prevVelY: 0,
					dbg: {x: 200, y: 200, prevX: 200, prevY: 200, velX: -100, velY: -10, prevVelX: 100, prevVelY: 0}	
				},
				{	x: 150, y: 150, prevX: 250, prevY: 200, velX: 0, velY: -100, prevVelX: 100, prevVelY: 0,
					dbg: {x: 200, y: 200, prevX: 200, prevY: 200, velX: -100, velY: -10, prevVelX: 100, prevVelY: 0}	
				},
				{	x: 150, y: 100, prevX: 250, prevY: 200, velX: 0, velY: 0, prevVelX: 100, prevVelY: 0,
					dbg: {x: 200, y: 200, prevX: 200, prevY: 200, velX: -100, velY: -10, prevVelX: 100, prevVelY: 0}	
				}	*/			
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

var nC = 0;

function drawBalls() {
	fill(255, 0, 0);

	for (var i = 0; i < balls.length; i++) {
		rect(balls[i].x, balls[i].y, ballWidth, ballWidth);
	}
}

// Determines the distance made by the ball in <ts> seconds
function distanceInTime(obj, ts) {
	return {x: obj.velX * ts * .001,
			y: obj.velY * ts * .001
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
	for (var i = 0; i < paddles.length; i++) {
		rect(paddles[i].x, paddles[i].y, paddleWidth, paddleHeight);
	}
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

	var collided = false;

	for (var i = 0; i < paddles.length; i++) {
	
		var rBallIntersect = obj.x + objW - (paddles[i].x);
		if (rBallIntersect <= 0) {
			continue;
		}
		var lBallIntersect = obj.x - (paddles[i].x + paddleWidth);
		if (lBallIntersect >= 0) {
			continue;
		}
		var tBallIntersect = obj.y - (paddles[i].y + paddleHeight);
		if (tBallIntersect >= 0) {
			continue;
		}
		var bBallIntersect = obj.y + objH - (paddles[i].y);
		if (bBallIntersect <= 0) {
			continue;
		}
		
		// Arriving here means the dbg line collided with a paddle
		collided = true;
		
		reflectOnPaddle(paddles[i], 
			{	right: rBallIntersect,
				left: lBallIntersect,
				top: tBallIntersect,
				bottom: bBallIntersect
			},	obj, objW, objH
		);
	}

	return collided;
}

// Reflects an object in a paddle.
// obj: {x, y, velX, velY}
function reflectOnPaddle(paddle, intersection, obj, objW, objH) {
	var horizontalColisionArea = Math.min(Math.abs(intersection.right), 
		Math.abs(intersection.left));

	var verticalColisionArea = Math.min(Math.abs(intersection.top), 
		Math.abs(intersection.bottom));

	var thickness = 2;

	// Vertical surface reflection
	if (horizontalColisionArea <= verticalColisionArea) {
		// Collided with left surface
		if (obj.x < paddle.x) {
			setCollidedSurface(paddle.x - thickness, paddle.y, thickness, paddleHeight);
			obj.velX = Math.abs(obj.velX) * -1;
			obj.prevX = paddle.x - objW - 1;
		}
		// Collided with right surface
		else {
			setCollidedSurface(paddle.x + paddleWidth, paddle.y, thickness, paddleHeight);
			obj.velX = Math.abs(obj.velX);
			obj.prevX = paddle.x + paddleWidth + 1;
		}
	}

	// Horizontal surface reflection
	else {
		// Collided with top
		if (obj.y < paddle.y) {
			setCollidedSurface(paddle.x, paddle.y - thickness, paddleWidth, thickness);
			obj.velY = Math.abs(obj.velY) * -1;
			obj.prevY = paddle.y - objH - 1;
		}
		// Collided with bottom
		else  {
			setCollidedSurface(paddle.x, paddle.y + paddleHeight, paddleWidth, thickness);
			obj.velY = Math.abs(obj.velY);
			obj.prevY = paddle.y + paddleHeight + 1;
		}
	}
}

function nextEndingPosition(ball, ts) {
	var nextPos = distanceInTime(ball, ts);
	return {x: nextPos.x + ball.x, y: nextPos.y + ball.y};
}

function nextMinPosition(nextPos, obj, mininumDist) {
	var angle = Math.atan2(nextPos.y - obj.y, nextPos.x - obj.x);
	var nextMinPos = {	x: Math.cos(angle) * mininumDist + obj.x,
						y: Math.sin(angle) * mininumDist + obj.y 
					};	
	return nextMinPos;
}

// <obj> collision with <ball>
function collisionWithBall(obj, objW, objH, ball) {
	var rBallIntersect = obj.x + objW - (ball.x);
	if (rBallIntersect <= 0) {
		return false;
	}
	var lBallIntersect = obj.x - (ball.x + objW);
	if (lBallIntersect >= 0) {
		return false;
	}
	var tBallIntersect = obj.y - (ball.y + objH);
	if (tBallIntersect >= 0) {
		return false;
	}
	var bBallIntersect = obj.y + objH - (ball.y);
	if (bBallIntersect <= 0) {
		return false;
	}
	
	// Arriving here means the ball collided with another ball
	reflectOnBall( 
		{	right: rBallIntersect,
			left: lBallIntersect,
			top: tBallIntersect,
			bottom: bBallIntersect
		},	obj, objW, objH, ball
		);
	
	return true;
}


function collisionWithBalls(objIdx, objW, objH) {
	var ball = balls[objIdx];
	for (var i = 0; i < balls.length; i++) {
		if (i !== objIdx) {
			collisionWithBall(ball, ballWidth, ballWidth, balls[i]);
		}
	}
}

// Obj collision with ball
// To-do: Change ball vel
function reflectOnBall(intersection, obj, objW, objH, ball) {
	var horizontalColisionArea = Math.min(Math.abs(intersection.right), 
		Math.abs(intersection.left));

	var verticalColisionArea = Math.min(Math.abs(intersection.top), 
		Math.abs(intersection.bottom));

	// Thickness of the collided surface for visual debugging
	var thickness = 2;

	// Vertical surface reflection
	if (horizontalColisionArea <= verticalColisionArea) {
		// Collided with left surface
		if (obj.x < ball.x) {
			setCollidedSurface(ball.x - thickness, ball.y, thickness, objH);
			obj.velX = Math.abs(obj.velX) * -1;
			obj.prevX = ball.x - objW - 1;
		}
		// Collided with right surface
		else {
			setCollidedSurface(ball.x + objW, ball.y, thickness, objH);
			obj.velX = Math.abs(obj.velX);
			obj.prevX = ball.x + objW + 1;
		}
		nC +=1;
		// console.log(obj.x, obj.velX, ball.prevVelX);
		// obj.velX = ball.prevVelX;
		// obj.velY = obj.velY + ball.prevVelY;
	}

	// Horizontal surface reflection
	else {
		// Collided with top
		if (obj.y < ball.y) {
			setCollidedSurface(ball.x, ball.y - thickness, objW, thickness);
			obj.velY = Math.abs(obj.velY) * -1;
			obj.prevY = ball.y - objH - 1;
		}
		// Collided with bottom
		else  {
			setCollidedSurface(ball.x, ball.y + objH, objW, thickness);
			obj.velY = Math.abs(obj.velY);
			obj.prevY = ball.y + objH + 1;
		}
	}
}

function hasCollided(ball, i) {
	return collisionWithWalls(ball, ballWidth, ballWidth) || collisionWithPaddles(ball, ballWidth, ballWidth) || collisionWithBalls(i, ballWidth, ballWidth);
}

function nextBallPosAfterCollision(ball, ts) {
	ball.x = ball.prevX;
	ball.y = ball.prevY;

	return nextEndingPosition(ball, ts);
}

function stepBallPosition(ball, nextPos) {
	var nextMinPos = nextMinPosition(nextPos, ball, minDist);

	ball.prevX = ball.x;
	ball.prevY = ball.y;
	ball.x = nextMinPos.x;
	ball.y = nextMinPos.y;
}

function manageBallCollision(ts, idxBall, numCollisionChecks, nextPos) {

	// . Check collisions between the current ball position and the
	// next ending position (if there are no collisions) 
	// . If there is a collision, a new ending position is 
	// calculated (<nextPos>)
	var tsPerCollision = ts / numCollisionChecks;
	var collided = false;
	for (var j = 0; j < numCollisionChecks && !collided; j++) {
		var collided = hasCollided(balls[idxBall], idxBall);
		if (collided) {
			var partialTs = (numCollisionChecks - j) * tsPerCollision;
			nextPos = nextBallPosAfterCollision(balls[idxBall], partialTs);
			j--;
		}

		stepBallPosition(balls[idxBall], nextPos);
	}
	balls[idxBall].x = nextPos.x;
	balls[idxBall].y = nextPos.y;
}

function collide(ts) {

	for (var i = 0; i < balls.length; i++) {
		var nextPos = nextEndingPosition(balls[i], ts);
		var distToNextPos = sqrt((nextPos.x - balls[i].x)**2 + (nextPos.y - balls[i].y)**2);
		var numCollisionChecks = floor(distToNextPos / minDist) + 1;

		manageBallCollision(ts, i, numCollisionChecks, nextPos);
	}
}

function drawDbgLine(x1, y1, x2, y2) {
	stroke(255);
	noFill();
	quad(x1, y1, x1, y1+ballWidth, x2, y2+ballWidth, x2, y2);
	quad(x1+ballWidth, y1, x1+ballWidth, y1+ballWidth, x2+ballWidth, y2+ballWidth, x2+ballWidth, y2);
	noStroke();
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

		var nextPos = nextEndingPosition(balls[i].dbg, ts);
		var nextMinPos = nextMinPosition(nextPos, balls[i].dbg, minDist);

		var distToNextPos = sqrt((nextPos.x - balls[i].dbg.x)**2 + (nextPos.y - balls[i].dbg.y)**2);
		var numCollisionChecks = floor(distToNextPos / minDist) + 1;
		var tsPerCollision = ts / numCollisionChecks;
		
		// . Check collisions between the current ball position and the
		// next ending position (if there are no collisions) 
		// . If there is a collision, a new ending position is 
		// calculated (<nextPos>)
		for (var j = 0; j < numCollisionChecks; j++) {

			if (hasCollided(balls[i].dbg, i)) {
				var partialTs = (numCollisionChecks - j) * tsPerCollision;

				nextPos = nextBallPosAfterCollision(balls[i].dbg, partialTs);

				drawDbgLine(collX, collY, balls[i].dbg.x, balls[i].dbg.y);

				collX = balls[i].dbg.x;
				collY = balls[i].dbg.y;
				j--;
			}
			stepBallPosition(balls[i].dbg, nextPos);
		}
		balls[i].dbg.x = nextPos.x;
		balls[i].dbg.y = nextPos.y;
		drawDbgLine(collX, collY, balls[i].dbg.x, balls[i].dbg.y);

		// Drawings
		highlightCollisionSurface();
		if (showDbgMenu) {
			drawDbgMenu();
		}
		else {
			minDistSlider.style('visibility', 'hidden');	
		}
	}
	fill(255);
	text("FPS: " + ceil(frameRate()), canvasWidth-100, 40);
	noFill();
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

		if (dbgMode === 1) {
			newSpeed = {x: mouseX - mousePressBall.x,
						y: mouseY - mousePressBall.y};

			changeBallSpeed(newSpeed, mousePressBall.ballIdx);
		}
		else if (dbgMode === 2) {
			balls[mousePressBall.ballIdx].x = mouseX;
			balls[mousePressBall.ballIdx].y = mouseY;
		}
	}
}

function spawnBall(x, y) {
	var vx = (Math.random() * 2 - 1) * 100;
	var vy = (Math.random() * 2 - 1) * 100;
	var newBall = 	{	x: x, y: y, prevX: x, prevY: y, velX: vx, velY: vy,
						dbg: {x: x, y: y, prevX: x, prevY: y, velX: vx, velY: vy}
					};
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

function movePaddles() {
	for (var i = 0; i < paddles.length; i++) {
		paddles[i].y = constrain(mouseY, paddleHeight/2, canvasHeight - paddleHeight/2);
	}
}

function updateBallVel() {
	for (var i = 0; i < balls.length; i++) {
		balls[i].prevVelX = balls[i].velX;
		balls[i].prevVelY = balls[i].velY;
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

function mouseDragged() {
	if (stop === false) {
		return false;
	}

	if (dbgMode === 1 || dbgMode === 2) {
		dbgSaveFinalMousePos();
	}
}

function mouseReleased() { 
	if (stop === false) {
		return false;
	}
		
	if (mousePressBall.pressing === true) {
		mousePressBall.pressing = false;
	}

	return false;
}

function setup() {
	stop = true;
	createCanvas(canvasWidth, canvasHeight);
	prevTs = new Date().getTime();

	minDistSlider = createSlider(1, 100, 1);
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

	movePaddles();

	if (stop === false || stepFrame === true) {
		collide(deltaT);	
	}
	// visualDbg(1000);

	updateBallVel();

	drawBalls();
	drawPaddles();


	stepFrame = false;
}

module.exports = {
	distanceInTime:distanceInTime,
	nextEndingPosition:nextEndingPosition,
	nextMinPosition:nextMinPosition
};