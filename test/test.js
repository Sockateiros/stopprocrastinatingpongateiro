var assert = require('assert');
var sketch = require('../src/sketch.js')
describe('Movement', function() {
	it('should return next ending position', function() {
		var numTests = 4;
		
		var ts = 1000;

		var pos = [	{x: 0,	y: 0},
					{x: 200,y: 0},
					{x: 0,  y: 200},
					{x: 200,y:200}
					];

		var speed = [ 	{x: 200,  y: 200},
						{x: -200, y: 200},
						{x: 200,  y: -200},
						{x: -200, y: -200}
					];

		var expected =	[	{x: 200, y: 200},
							{x: 0, y: 200},
							{x: 200, y: 0},
							{x: 0, y: 0}
						];

		for (var i = 0; i < numTests; i++) {
			assert.deepEqual(expected[i], sketch.nextEndingPosition(pos[i], speed[i], ts));			
		}			
	});
	
	it('should return next mininum position', function() {
		var numTests = 4;

		var decimals = 5;
		var mininumDist = 5;

		var currentPos =	{x: 200, y: 200};

		var nextPos =	 	[	{x: 230, y: 240},
								{x: 230, y: 160},
								{x: 170, y: 160},
								{x: 170, y: 240}
							];
		
		var expected =		[ 	{x: 203, y: 204},
								{x: 203, y: 196},
								{x: 197, y: 196},
								{x: 197, y: 204}
							];

		for (var i = 0; i < numTests; i++) {
			var result = sketch.nextMinPosition(nextPos[i], currentPos, mininumDist);
			result.x = result.x.toFixed(decimals);
			result.y = result.y.toFixed(decimals);

			assert.deepEqual(expected[i], result);			
		}			
	});
});