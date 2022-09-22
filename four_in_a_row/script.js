const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Load images
const board = new Image(); board.src = "assets/board.png";
const circleRed = new Image(); circleRed.src = "assets/circleRed.png";
const circleYellow = new Image(); circleYellow.src = "assets/circleYellow.png";

// Update canvas size on resize
canvas.width = 1400;
canvas.height = 1400;
updateWindow();
window.onresize = updateWindow;

function lerp(a, b, t) {return a + (b - a) * t;}

function updateWindow() {
	if (window.innerWidth / window.innerHeight < canvas.width / canvas.height) {
		canvas.style.width = "100%";
		canvas.style.height = null;
		max = canvas.style.width;
	} else {
		canvas.style.width = null;
		canvas.style.height = "100%";
		max = canvas.style.height;
	}
}

function drawCircle(x, y, player) {
	if (player > 0) {
		ctx.drawImage(player == 1 ? circleRed : circleYellow, x * 200, 1200 - y * 200);
	}
}

const grid = new Array(7); for (let x = 0; x < 7; x++) {grid[x] = new Array(6);}
let currentPlayer = 1;
let text = "";
let debounce = false;

// Circle animation
let animate = false;
let animPos = {x: 0, y: 0};

// Circle preview
let previewX = 0;
let previewLerpX = 0;

function isColFull(x) {
	for (let y = 0; y < 6; y++) {
		if (!grid[x][y]) {
			return false;
		}
	}
	return true;
}

function isWin(player) {
	for (let x = 0; x < 7; x++) {
		for (let y = 0; y < 6; y++) {
			// 4 up
			if (y < 3 && grid[x][y] == player &&
				grid[x][y + 1] == player &&
				grid[x][y + 2] == player &&
				grid[x][y + 3] == player) {
			return true;
			}
			
			// 4 right
			if (x < 4 && grid[x][y] == player &&
				grid[x + 1][y] == player &&
				grid[x + 2][y] == player &&
				grid[x + 3][y] == player) {
			return true;
			}
			
			// 4 diagonal up right
			if (y < 3 && x < 5 && grid[x][y] == player &&
				grid[x + 1][y + 1] == player &&
				grid[x + 2][y + 2] == player &&
				grid[x + 3][y + 3] == player) {
			return true;
			}
			
			// 4 diagonal bottom right
			if (y < 3 && x < 5 && grid[x][y + 3] == player &&
				grid[x + 1][y + 2] == player &&
				grid[x + 2][y + 1] == player &&
				grid[x + 3][y] == player) {
			return true;
			}
		}
	}
}

function addCircle(x, player) {
	for (let y = 0; y < 6; y++) {
		if (!grid[x][y]) {
			animate = true;
			debounce = true;
			animPos = {x: x, y: 0};
			createjs.Tween.get(animPos).to({x: x, y: 1200 - y * 200}, 1000 - y * 140, createjs.Ease.bounceOut).call(() => {
				grid[x][y] = player;
				animate = false;
				debounce = false;

				// Check for win
				if (isWin(player)) {
					text = (player == 1 ? "Red" : "Yellow") + " Won!";
					debounce = true;
					
					// Reset game
					setTimeout(() => {
						for (let x = 0; x < 7; x++) {
							for (let y = 0; y < 6; y++) {
								grid[x][y] = undefined;
							}
						}
						
						debounce = false;
								text = "";
						currentPlayer = player == 1 ? 2 : 1; // Change current player
					}, 3000);
					return;
				}
				
				// Change current player
				currentPlayer = player == 1 ? 2 : 1;
			});
			return;
		}
	}
}

canvas.onclick = (event) => {
	// Get cell the player clicked on
	const rect = event.target.getBoundingClientRect()
	const clientX = event.clientX - rect.left;
	const x = Math.floor(clientX / rect.width * 7);
	
	if (!isColFull(x) && !debounce) {addCircle(x, currentPlayer);} // Add circle if column is not full
};

canvas.onmousemove = (event) => {
	// Get cell the player clicked on
	const rect = event.target.getBoundingClientRect()
	const clientX = event.clientX - rect.left;
	previewX = Math.floor(clientX / rect.width * 7);
};

let lastTime = 0;
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, "#4475a5");
gradient.addColorStop(1, "#0026a0");

function update(timestamp) {
	// Delta time
	const deltaTime = (timestamp - lastTime) || 0;
	createjs.Ticker.framerate = Math.floor(1000 / deltaTime);
	lastTime = timestamp;
	previewLerpX = lerp(previewLerpX, previewX * 200, deltaTime * 0.02);
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
	ctx.fillStyle = gradient;
	ctx.fillRect(20, 220, canvas.width - 20, canvas.height - 20);
	
	for (let x = 0; x < 7; x++) {
		for (let y = 0; y < 6; y++) {
			drawCircle(x, y, grid[x][y]);
		}
	}

	if (animate) {ctx.drawImage(currentPlayer == 1 ? circleRed : circleYellow, animPos.x * 200, animPos.y);}
	
	if (!debounce) {
		ctx.drawImage(currentPlayer == 1 ? circleRed : circleYellow, previewLerpX, 0);
	}
	
	// Draw text
	ctx.font = "70px monospace";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(text, canvas.width / 2, 100);
	
	ctx.drawImage(board, 0, 0); // Draw board
	window.requestAnimationFrame(update); // Refresh update function on next frame
}

update();