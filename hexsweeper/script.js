const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const easy = document.getElementById("mode-easy");
const medium = document.getElementById("mode-medium");
const hard = document.getElementById("mode-hard");

function loadImage(url) {
	const img = new Image();
	img.src = url;
	return img;
}

const hidden = loadImage("assets/hidden.png");
const revealed = loadImage("assets/revealed.png");

let grid = [];
let rows = 10, cols = 8, mineCount = 10;
let mines = [];
let displayText = "";
let displayLerp = 0;
canvas.width = rows * 172 + 86;
canvas.height = cols * 150 + 50;

// Update canvas size
updateWindow();
window.onresize = updateWindow;
function lerp(a, b, t) {return a + (b - a) * t;}

function updateWindow() {
	if (window.innerWidth / window.innerHeight < canvas.width / (canvas.height / 0.8)) {
		canvas.style.width = "100%";
		canvas.style.height = null;
	} else {
		canvas.style.width = null;
		canvas.style.height = "80vh";
	}
}

class Vector2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

for (let x = 0; x < rows; x++) {
	grid[x] = [];

	for (let y = 0; y < cols; y++) {
		grid[x][y] = {
			state: 0, // 0 = hidden; 1 = flagged; 2 = revealed
			neighbors: 0
		};
	}
}

function reset() {
	start = false;
	win = false;
	gameOver = false;
	grid = [];
	canvas.width = rows * 172 + 86;
	canvas.height = cols * 150 + 50;
	
	for (let x = 0; x < rows; x++) {
		grid[x] = [];
		
		for (let y = 0; y < cols; y++) {
			grid[x][y] = {
				state: 0,
				neighbors: 0
			};
		}
	}
	
	mines = [];
}

// Area = [x1(y2 – y3) + x2(y3 – y1) + x3(y1-y2)]/2
function areaOfTriangle(a, b, c) {
	return Math.abs(
		a.x * (b.y - c.y) +
		b.x * (c.y - a.y) +
		c.x * (a.y - b.y)
	) / 2;
}

// a, b, c are triangle coordinates
// d is the mouse
function isInTriangle(a, b, c, d) {return Math.abs(areaOfTriangle(a, b, c) - areaOfTriangle(d, a, b) - areaOfTriangle(d, b, c) - areaOfTriangle(d, a, c)) < 10e-10;}

// Assuming that point A is top-left and B is bottom-right
function isInRect(a, b, c) {return c.x > a.x && c.x < b.x && c.y > a.y && c.y < b.y;}

function isInHexagon(x, y, clientX, clientY) {
	if (y % 2 == 1) {clientX -= 86;}
	const points = {
		centerPoint: new Vector2(x * 172 + 86, y * 150 + 100),
		upperRightCorner: new Vector2(x * 172 + 172, y * 150 + 50),
		upperLeftCorner: new Vector2(x * 172, y * 150 + 50),
		upperCorner: new Vector2(x * 172 + 86, y * 150),
		lowerRightCorner: new Vector2(x * 172 + 172, y * 150 + 150),
		lowerLeftCorner: new Vector2(x * 172, y * 150 + 150),
		lowerCorner: new Vector2(x * 172 + 86, y * 150 + 200),
	};
	
	if (isInRect(points.upperLeftCorner, points.lowerRightCorner, new Vector2(clientX, clientY))) {return true;}
	if (isInTriangle(points.upperCorner, points.upperLeftCorner, points.upperRightCorner, new Vector2(clientX, clientY))) {return true;}
	if (isInTriangle(points.lowerCorner, points.lowerLeftCorner, points.lowerRightCorner, new Vector2(clientX, clientY))) {return true;}
	return false;
}

function exists(x, y) {return (grid[x] != undefined && grid[x][y] != undefined) ? true : false}
function isMine(x, y) {return mines.find(e => e.x == x && e.y == y);}

function getNeighbors(x, y) {
	let neighbors;
	
	if (y % 2 == 0) {
		neighbors = [
			new Vector2(-1, 0), // Left
			new Vector2(1, 0), // Right
			new Vector2(-1, 1), // Bottom Left
			new Vector2(0, 1), // Bottom Right
			new Vector2(-1, -1), // Top Left
			new Vector2(0, -1) // Top Right
		];
	} else {
		neighbors = [
			new Vector2(-1, 0), // Left
			new Vector2(1, 0), // Right
			new Vector2(0, 1), // Bottom Left
			new Vector2(1, 1), // Bottom Right
			new Vector2(0, -1), // Top Left
			new Vector2(1, -1) // Top Right
		];
	}
	
	const output = [];
	
	for (let i = neighbors.length - 1; i >= 0; i--) {
		if (exists(x + neighbors[i].x, y + neighbors[i].y)) {
			output.push(new Vector2(x + neighbors[i].x, y + neighbors[i].y));
		}
	}
	
	return output;
}

function recursiveNoMines(x, y, j) {
	if (j > rows * cols - mineCount) {return;}
	const neighbors = getNeighbors(x, y);
	
	for (let i = 0; i < neighbors.length; i++) {
		const cell = neighbors[i];
		if (grid[cell.x][cell.y].state == 2) {continue;}
		if (grid[cell.x][cell.y].neighbors && grid[cell.x][cell.y].state == 1) {continue;}
		grid[cell.x][cell.y].state = 2;
		
		if (!grid[cell.x][cell.y].neighbors) {
			recursiveNoMines(cell.x, cell.y, ++j);
		}
	}
}

// Change difficulty
easy.onclick = () => {
	if (gameOver || win) {return;}
	easy.disabled = true;
	medium.disabled = false;
	hard.disabled = false;
	rows = 10;
	cols = 8;
	mineCount = 10;
	reset();
};

medium.onclick = () => {
	if (gameOver || win) {return;}
	easy.disabled = false;
	medium.disabled = true;
	hard.disabled = false;
	rows = 18;
	cols = 14;
	mineCount = 40;
	reset();
};

hard.onclick = () => {
	if (gameOver || win) {return;}
	easy.disabled = false;
	medium.disabled = false;
	hard.disabled = true;
	rows = 24;
	cols = 20;
	mineCount = 99;
	reset();
};

let start = false;
let win = false;
let gameOver = false;

// Left click
document.onclick = e => {
	if (gameOver || win) {return;}
	const rect = canvas.getBoundingClientRect();
	let clientX = (e.clientX - rect.left) / rect.width * canvas.width;
	let clientY = (e.clientY - rect.top) / rect.height * canvas.height;
	
	for (let x = 0; x < rows; x++) {
		for (let y = 0; y < cols; y++) {
			if (isInHexagon(x, y, clientX, clientY) && grid[x][y].state == 0) {
				// Choose mines (if game hasn't started)
				if (!start) {
					start = true;

					for (let i = 0; i < mineCount; i++) {
						while (true) {
							const x2 = Math.floor(Math.random() * rows);
							const y2 = Math.floor(Math.random() * cols);

							if (!isMine(x2, y2) && !(x == x2 && y == y2)) {
								mines.push(new Vector2(x2, y2));
								const neighbors = getNeighbors(x2, y2);

								for (let j = 0; j < neighbors.length; j++) {
									const cell = neighbors[j];
									grid[cell.x][cell.y].neighbors++;
								}

								break;
							}
						}
					}
				}
				
				// Detect mine
				if (isMine(x, y)) {
					gameOver = true;
					displayText = "You Lose!";
					setTimeout(reset, 3000);
					return;
				}
				
				grid[x][y].state = 2;
				if (!grid[x][y].neighbors) {recursiveNoMines(x, y, 0);}
				
				// Reset game if win
				let count = 0;
				
				for (let i = 0; i < rows; i++) {
					for (let j = 0; j < cols; j++) {
						if (grid[i][j].state == 2) {
							count++;
						}
					}
				}
				
				if (count == rows * cols - mineCount) {
					win = true;
					displayText = "You Win!";
					setTimeout(reset, 3000);
					return;
				}
				
				return;
			}
		}
	}
};

// Right click
canvas.oncontextmenu = e => {
	e.preventDefault();
	e.stopPropagation();
	if (gameOver || win) {return;}
	const rect = canvas.getBoundingClientRect();
	let clientX = (event.clientX - rect.left) / rect.width * canvas.width;
	let clientY = (event.clientY - rect.top) / rect.height * canvas.height;
	
	for (let x = 0; x < rows; x++) {
		for (let y = 0; y < cols; y++) {
			if (isInHexagon(x, y, clientX, clientY)) {
				if (grid[x][y].state == 2) {return;}
				grid[x][y].state = grid[x][y].state ? 0 : 1;
				return;
			}
		}
	}
};

const colors = [
	"#000000",
	"#0000ff",
	"#008000",
	"#ff0000",
	"#000080",
	"#800000",
	"#008080"
]

let deltaTime = 0;
let last = 0;

function update(time) {
	deltaTime = (time - last) * 0.001;
	last = time;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for (let x = 0; x < rows; x++) {
		for (let y = 0; y < cols; y++) {
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = "75px Trebuchet MS";
			ctx.fillStyle = colors[grid[x][y].neighbors];
			
			if (y % 2 == 0) {
				ctx.drawImage(grid[x][y].state == 2 ? revealed : hidden, x * 172, y * 150);
				// Display number
				if (grid[x][y].neighbors && grid[x][y].state == 2 && !isMine(x, y)) {
					ctx.fillText(grid[x][y].neighbors, x * 172 + 86, y * 150 + 100);
				}
				// Display flag
				if (grid[x][y].state == 1) {
					ctx.fillStyle = "black";
					ctx.fillText("X", x * 172 + 86, y * 150 + 100);
				}
				// Display mine if game over
				if (gameOver && isMine(x, y) && grid[x][y].state == 0) {
					ctx.fillStyle = "red";
					ctx.fillText("X", x * 172 + 86, y * 150 + 100);
				}
			} else {
				ctx.drawImage(grid[x][y].state == 2 ? revealed : hidden, x * 172 + 86, y * 150);
				if (grid[x][y].neighbors && grid[x][y].state == 2 && !isMine(x, y)) {
					ctx.fillText(grid[x][y].neighbors, x * 172 + 172, y * 150 + 100);
				}
				if (grid[x][y].state == 1) {
					ctx.fillStyle = "black";
					ctx.fillText("X", x * 172 + 172, y * 150 + 100);
				}
				if (gameOver && isMine(x, y)) {
					ctx.fillStyle = "red";
					ctx.fillText("X", x * 172 + 172, y * 150 + 100);
				}
			}
			
			ctx.fillStyle = "black";
		}
	}
	
	if (!(gameOver || win)) {displayLerp = lerp(displayLerp, 0, deltaTime * 10);}
	else {displayLerp = lerp(displayLerp, 200, deltaTime * 10);}
	
	if (displayLerp > 1)
	{
		ctx.font = displayLerp + "px Trebuchet MS";
		ctx.fillStyle = "white";
		ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
		ctx.fillStyle = "black"
		ctx.lineWidth = 5;
		ctx.strokeText(displayText, canvas.width / 2, canvas.height / 2);
	}

	window.requestAnimationFrame(update);
}

update(0);
