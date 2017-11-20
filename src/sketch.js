var ballX = 200, ballY = 200;
var ballVelX = 3, ballVelY = 5;
var ballWidth = 20;
var canvasWidth = 500, canvasHeight = 250;

// Paddles
var paddleWidth = 20, paddleHeight = 50;
var paddleLX = 0, paddleLY = 100;
var paddleRX = canvasWidth - paddleWidth, paddleRY = 100;

function drawBall() {
	fill(255, 0, 0);
	rect(ballX, ballY, ballWidth, ballWidth);
}

function moveBall() {
	ballX += ballVelX;
	ballY += ballVelY;
}

function collide() {
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

function setup() {
	//createCanvas(window.screen.width * window.devicePixelRatio, window.screen.height * window.devicePixelRatio);
	createCanvas(canvasWidth, canvasHeight);
}

function draw() {
	background(0);

	collide();

	drawBall();
	drawPaddles();

	moveBall();
}