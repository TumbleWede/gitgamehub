const game = document.getElementById("game");
const board = document.getElementById("board");
const ctx = board.getContext("2d");
board.width = 800;
board.height = 800;

updateWindow();
window.onresize = updateWindow;

function updateWindow() {
	if (window.innerWidth / window.innerHeight < game.width / game.height) {
		game.style.maxWidth = "100%";
		game.style.maxHeight = null;
	} else {
		game.style.maxWidth = null;
		game.style.maxHeight = "100%";
	}
}

const grid = [];

for (let i = 0; i < 8; i++) {
	grid[i] = [];

	for (let j = 0; j < 8; j++) {
		grid[i][j] = null
		ctx.fillStyle = (i + j) % 2 == 0 ? "#ffebcc" : "#ad884c";
		ctx.fillRect(i * 100, j * 100, 100, 100);
	}
}

function createPiece(id, x, y, width, height) {
	const img = document.createElement("img");
	img.id = id;
	img.src = `assets/pieces.svg#svgView(viewBox(${x}, ${y}, ${width}, ${height}))`;
	img.style.width = "12.5%";
	img.style.height = "12.5%";
	img.style.position = "absolute";
	game.appendChild(img);
}