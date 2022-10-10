const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Load images
const board = new Image(); board.src = "assets/board.png";
const black = new Image(); black.src = "assets/black.png";
const white = new Image(); white.src = "assets/white.png";

// Update canvas size
canvas.width = 1600;
canvas.height = 1600;
updateWindow();
window.onresize = updateWindow;

function updateWindow() {
	if (window.innerWidth / window.innerHeight < canvas.width / canvas.height) {
		canvas.style.width = "100%";
		canvas.style.height = null;
	} else {
		canvas.style.width = null;
		canvas.style.height = "100%";
	}
}

function lerp(a, b, t) {return a + (b - a) * t;}

let lastTime = 0;
let currentPlayer = 1;
let debounce = false;
let text = "";
let textPlayer = 0;
let animatedDisks = [];
let ghostSize = 200;
let ghostLerp = 200;
let textLerp = 0;
let textSize = 0;
const grid = new Array(8); for (let x = 0; x < 8; x++) {grid[x] = new Array(8);}
grid[3][3] = 1;
grid[4][3] = 2;
grid[3][4] = 2;
grid[4][4] = 1;

function canReverse(x, y, adjacent) {
	for (let j = 1; j < 8; j++) {
		const x2 = x + adjacent.x * j;
		const y2 = y + adjacent.y * j;

		if (grid[x2] && grid[x2][y2]) {
			if (grid[x2][y2] == currentPlayer) {
				return true;
			}
		} else {
			return false;
		}
	}
}

function getAdjacentCells(x, y) {
	const adjacent = [];

	for (x2 = -1; x2 < 2; x2++) {
		for (y2 = -1; y2 < 2; y2++) {
			if (!(x2 == 0 && y2 == 0) && grid[x + x2] && grid[x + x2][y + y2]) {
				if (grid[x + x2][y + y2] && grid[x + x2][y + y2] != currentPlayer && canReverse(x, y, {x: x2, y: y2})) {
					adjacent.push({x: x2, y: y2});
				}
			}
		}
	}

	return adjacent;
}

function canPlace(x, y) {
	const adjacentCells = getAdjacentCells(x, y);

	if (adjacentCells.length > 0 && !grid[x][y]) {
		return true;
	}

	return false;
}

function placeCell(x, y) {
	const adjacentCells = getAdjacentCells(x, y);
	
	for (let i = 0; i < adjacentCells.length; i++) {
		for (let j = 1; j < 8; j++) {
			const x2 = x + adjacentCells[i].x * j;
			const y2 = y + adjacentCells[i].y * j;

			if (grid[x2] && grid[x2][y2]) {
				if (grid[x2][y2] == currentPlayer) {
					break;
				} else if (grid[x2][y2]) {
					grid[x2][y2] = currentPlayer;
				}
			}
		}
	}

	grid[x][y] = currentPlayer;
}

function canSkip() {
	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			if (canPlace(x, y)) {
				return false;
			}
		}
	}

	return true;
}

function getWinner() {
	let black = 0;
	let white = 0;

	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			if (grid[x][y] == 1) {
				black++;
			} else if (grid[x][y] == 2) {
				white++;
			}
		}
	}

	if (black > white) { // Black won
		return 1;
	} else if (white > black) { // White won
		return 2;
	} else { // Tie
		return 0;
	}
}

function reset() {
	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			if (grid[x][y]) {
				animatedDisks.push({x: x, y: y, size: 200, targetSize: 0, id: grid[x][y]});
			}
		}
	}

	for (let x = 0; x < 8; x++) {grid[x] = new Array(8);}
	textSize = 0;

	setTimeout(() => {
		animatedDisks = [];
		currentPlayer = currentPlayer == 1 ? 2 : 1;
		animatedDisks.push({x: 3, y: 3, size: 0, targetSize: 200, id: currentPlayer});
		animatedDisks.push({x: 4, y: 3, size: 0, targetSize: 200, id: currentPlayer == 1 ? 2 : 1});
		animatedDisks.push({x: 3, y: 4, size: 0, targetSize: 200, id: currentPlayer == 1 ? 2 : 1});
		animatedDisks.push({x: 4, y: 4, size: 0, targetSize: 200, id: currentPlayer});

		setTimeout(() => {
			animatedDisks = [];
			debounce = false;
			ghostSize = 200;
			ghostLerp = 0;
			grid[3][3] = currentPlayer;
			grid[4][3] = currentPlayer == 1 ? 2 : 1;
			grid[3][4] = currentPlayer == 1 ? 2 : 1;
			grid[4][4] = currentPlayer;
		}, 500);
	}, 500);
}

canvas.onclick = (event) => {
	if (debounce) {return;}
	// Get cell the player clicked on
	const rect = event.target.getBoundingClientRect()
	const x = Math.max(Math.floor((event.clientX - rect.left) / rect.width * 8), 0);
	const y = Math.max(Math.floor((event.clientY - rect.top) / rect.height * 8), 0);

	if (canPlace(x, y)) {
		const adjacentCells = getAdjacentCells(x, y);
		animatedDisks.push({x: x, y: y, size: 0, targetSize: 200, id: currentPlayer});
		debounce = true;
		ghostSize = 0;
		
		for (let i = 0; i < adjacentCells.length; i++) {
			for (let j = 1; j < 8; j++) {
				const x2 = x + adjacentCells[i].x * j;
				const y2 = y + adjacentCells[i].y * j;

				if (grid[x2] && grid[x2][y2]) {
					if (grid[x2][y2] == currentPlayer) {
						break;
					} else {
						animatedDisks.push({x: x2, y: y2, size: 0, targetSize: 200, id: currentPlayer});
					}
				}
			}
		}

		setTimeout(() => {
			animatedDisks = [];
			placeCell(x, y);
			currentPlayer = currentPlayer == 1 ? 2 : 1;
			debounce = false;
			ghostSize = 200;

			if (canSkip() & !debounce) {
				currentPlayer = currentPlayer == 1 ? 2 : 1;
				debounce = true;
				textSize = 160;

				if (canSkip()) { // Game over - can't place anymore pieces
					const winner = getWinner();

					if (winner > 0) {
						text = (winner == 1 ? "Black" : "White") + " Won!";
						textPlayer = winner;
					} else {
						text = "Tie!";
						textPlayer = 2;
					}
					
					setTimeout(reset, 3000);
				} else {
					text = (currentPlayer == 1 ? "White" : "Black") + " Cannot Play";
					textPlayer = currentPlayer == 1 ? 2 : 1;
					setTimeout(() => {
						debounce = false;
						textSize = 0;
					}, 1500);
				}
			}
		}, 800);
	}
};

function update(time) {
	const deltaTime = time - lastTime; // In milliseconds
	lastTime = time;
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
	ctx.drawImage(board, 0, 0)
	ghostLerp = lerp(ghostLerp, ghostSize, deltaTime / 100);
	textLerp = lerp(textLerp, textSize, deltaTime / 100);

	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			if (grid[x][y]) {
				ctx.drawImage(grid[x][y] == 1 ? black : white, x * 200, y * 200);
			} else {
				if (canPlace(x, y)) {
					ctx.globalAlpha = 0.25;
					ctx.drawImage(
						currentPlayer == 1 ? black : white, // Image
						x * 200 + (100 - ghostLerp / 2), // X
						y * 200 + (100 - ghostLerp / 2), // Y
						ghostLerp, // Width
						ghostLerp // Height
					);
					ctx.globalAlpha = 1;
				}
			}
		}
	}

	for (let i = 0; i < animatedDisks.length; i++) {
		animatedDisks[i].size = lerp(animatedDisks[i].size, animatedDisks[i].targetSize, deltaTime / 100);

		ctx.drawImage(
			animatedDisks[i].id == 1 ? black : white,
			animatedDisks[i].x * 200 + (100 - animatedDisks[i].size / 2),
			animatedDisks[i].y * 200 + (100 - animatedDisks[i].size / 2),
			animatedDisks[i].size,
			animatedDisks[i].size
		);
	}

	if (text != "") {
		// Draw text
		ctx.font = textLerp + "px Trebuchet MS";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = textPlayer == 1 ? "black" : "white";
		ctx.fillText(text, canvas.width / 2, canvas.height / 2);
		ctx.lineWidth = textLerp / 40;
		ctx.strokeStyle = textPlayer == 1 ? "white" : "black";
		ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
	}

	window.requestAnimationFrame(update); // Refresh update function on next frame
}

update(0);