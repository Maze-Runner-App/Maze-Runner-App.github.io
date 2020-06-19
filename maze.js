const createMaze = (cellsHorizontal, cellsVertical) => {
	const { Engine, Render, Runner, World, Bodies, Body, Events, Svg, Vertices, Common, Composites } = Matter;
	const canvas = document.querySelector('div.canvas');

	const width = canvas.offsetWidth;
	const height = window.innerHeight;

	const unitLengthX = width / cellsHorizontal;
	const unitLengthY = height / cellsVertical;

	const engine = Engine.create();
	engine.world.gravity.y = 0;
	const { world } = engine;
	const render = Render.create({
		element: canvas, // essentially creates a canvas element where it renders our output
		engine: engine,
		options: {
			width,
			height,
			wireframes: false,
			background: '#2b2a2a'
		}
	});

	const runner = Runner.create();

	//Walls
	const walls = [
		Bodies.rectangle(width / 2, 0, width, 2, {
			isStatic: true
		}),
		Bodies.rectangle(width / 2, height, width, 2, {
			isStatic: true
		}),
		Bodies.rectangle(0, height / 2, 2, height, {
			isStatic: true
		}),
		Bodies.rectangle(width, height / 2, 2, height, {
			isStatic: true
		})
	]; //first two params are position(x,y) - second pair is width and height of shape
	World.add(world, walls);

	//grid generation

	const shuffle = (arr) => {
		let counter = arr.length;
		while (counter > 0) {
			const index = Math.floor(Math.random() * counter);

			counter--;

			const temp = arr[counter];
			arr[counter] = arr[index];
			arr[index] = temp;
		}
		return arr;
	};

	const grid = new Array(cellsVertical).fill(null).map(() => new Array(cellsHorizontal).fill(false));

	const verticals = new Array(cellsVertical).fill(null).map(() => new Array(cellsHorizontal - 1).fill(false));

	const horizontals = new Array(cellsVertical - 1).fill(null).map(() => new Array(cellsHorizontal).fill(false));

	//randomly pick a starting cell
	const startingRow = Math.floor(Math.random() * cellsVertical);
	const startingCol = Math.floor(Math.random() * cellsHorizontal);

	const stepThroughCells = (row, col) => {
		// If I have visited the cell at [row, column], then return
		if (grid[row][col]) {
			return;
		}
		// Mark this cell as being visited
		grid[row][col] = true;
		// Assemble randomly ordered list of neighbors
		const neighbors = shuffle([
			[ row - 1, col, 'up' ],
			[ row, col + 1, 'right' ],
			[ row + 1, col, 'down' ],
			[ row, col - 1, 'left' ]
		]);
		// For each neighbor:

		for (let neighbor of neighbors) {
			const [ nextRow, nextCol, direction ] = neighbor;
			// See if neighbor is out of bounds
			if (nextRow < 0 || nextRow >= cellsVertical || nextCol < 0 || nextCol >= cellsHorizontal) {
				continue;
			}
			// If we have visited that neighbor, continue to next neighbor
			if (grid[nextRow][nextCol]) {
				continue;
			}
			// Remove wall from verticals or horizontals
			if (direction === 'right') {
				verticals[row][col] = true;
			} else if (direction === 'left') {
				verticals[row][col - 1] = true;
			} else if (direction === 'up') {
				horizontals[row - 1][col] = true;
			} else if (direction === 'down') {
				horizontals[row][col] = true;
			}
			// Visit that next cell (call stepThrough function again)
			stepThroughCells(nextRow, nextCol);
		}
	};

	stepThroughCells(startingRow, startingCol);

	//drawing horizontal walls
	horizontals.forEach((row, rowIndex) => {
		row.forEach((open, columnIndex) => {
			if (open) {
				return;
			} else {
				// x, y, width, height, options
				const wall = Bodies.rectangle(
					columnIndex * unitLengthX + unitLengthX / 2,
					rowIndex * unitLengthY + unitLengthY,
					unitLengthX,
					5,
					{
						isStatic: true,
						label: 'wall',
						render: {
							fillStyle: 'red'
						}
					}
				);
				World.add(world, wall);
			}
		});
	});

	//drawing vertical walls
	verticals.forEach((row, rowIndex) => {
		row.forEach((open, columnIndex) => {
			if (open) {
				return;
			} else {
				const wall = Bodies.rectangle(
					columnIndex * unitLengthX + unitLengthX,
					rowIndex * unitLengthY + unitLengthY / 2,
					5,
					unitLengthY,
					{
						isStatic: true,
						label: 'wall',
						render: {
							fillStyle: 'red'
						}
					}
				);
				World.add(world, wall);
			}
		});
	});

	//drawing goal
	const textureSizeGoal = 650;


	const goal = Bodies.rectangle(
		width - unitLengthX / 2,
		height - unitLengthY / 2,
		unitLengthX * 0.7,
		unitLengthY * 0.7,
		{
			isStatic: true,
			label: 'goal',
			render: {
				strokeStyle: '#ffffff',
				sprite: {
					texture: './assets/strawberry1.png',
					xScale: unitLengthX * 0.7 / textureSizeGoal,
					yScale: unitLengthY * 0.7 / textureSizeGoal
				}
			}
		}
	);

	World.add(world, goal);

	//drawing ball
	const textureSizeBall = 600;

	const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
	const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
		label: 'ball',
		inertia: Infinity,
		render: {
			fillStyle: 'yellow',
			sprite: {
				texture: './assets/ghost2.png',
					xScale: unitLengthX * 0.7 / textureSizeBall,
					yScale: unitLengthY * 0.7 / textureSizeBall
			}
		}
	});

	World.add(world, ball);

	// timer creation and keydown events

	const handleNav = (event) => {
		const { x, y } = ball.velocity;
		if (event.keyCode === 87) {
			Body.setVelocity(ball, { x, y: y - 5 });
		}
		if (event.keyCode === 83) {
			Body.setVelocity(ball, { x, y: y + 5 });
		}
		if (event.keyCode === 68) {
			Body.setVelocity(ball, { x: x + 5, y });
		}
		if (event.keyCode === 65) {
			Body.setVelocity(ball, { x: x - 5, y });
		}
	};

	const timer = new Timer(timerDisplay, startBtn, pauseBtn, {
		onStart() {
			if (gameOverScreen.className.includes('hidden') && winnerScreen.className.includes('hidden')) {
				document.addEventListener('keydown', handleNav);
				document.querySelector('.pauseScreen').classList.add('hidden');
			}
		},
		onPause() {
			if (gameOverScreen.className.includes('hidden') && winnerScreen.className.includes('hidden')) {
				document.removeEventListener('keydown', handleNav);
				document.querySelector('.pauseScreen').classList.remove('hidden');
			}
		},
		onComplete() {
			document.querySelector('.pauseScreen').classList.add('hidden');
			gameOverScreen.classList.remove('hidden');
		}
	});

	// collision detection

	Events.on(engine, 'collisionStart', (event) => {
		event.pairs.forEach((collision) => {
			const labels = [ 'ball', 'goal' ];

			if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
				
				winnerScreen.classList.remove('hidden');
				timer.pause();
				timer.startBtn.removeEventListener('click', timer.start);
				world.gravity.y = 1;
				world.bodies.forEach((body) => {
					if (body.label === 'wall' || body.label === 'goal') {
						Body.setStatic(body, false);
					}
				});
				engine.events = {};
			}
		});
	});

	

	Runner.run(runner, engine);
	Render.run(render);
};
