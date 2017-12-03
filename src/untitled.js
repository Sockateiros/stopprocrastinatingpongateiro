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
	var collidedObj = {x: obj.x, y: obj.y, w: objW, h: objH, velX: obj.velX, velY: obj.velY};
	var newObj = reflectOnPaddle( 
		{	right: rBallIntersect,
			left: lBallIntersect,
			top: tBallIntersect,
			bottom: bBallIntersect
		},	collidedObj
		);

	obj.velX = newObj.velX;
	obj.velY = newObj.velY;
	obj.prevX = newObj.x;
	obj.prevY = newObj.y;
	
	return true;
}
