const game = document.getElementById("game");
const board = document.getElementById("board");
const ctx = board.getContext("2d");
board.width = 1600;
board.height = 1600;

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

let currentMove = 0; // 0 = White; 1 = Black
let letters = ["a", "b", "c", "d", "e", "f", "g", "h"]

for (let i = 0; i < 8; i++) {
	for (let j = 0; j < 8; j++) {
		ctx.fillStyle = (i + j) % 2 == 1 ? "#ffebcc" : "#ad884c";
		ctx.fillRect(i * 200, 1400 - j * 200, 200, 200);
	}

	ctx.textAlign = "right";
	ctx.textBaseline = "top";
	ctx.font = "40px Verdana";
	ctx.fillText(i + 1, 40, 1420 - i * 200);

	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText(letters[i], i * 200 + 160, 1580);
}

function createPiece(id, x, y, x2, y2) {
	const img = document.createElement("img");
	img.src = `assets/pieces.svg#svgView(viewBox(${x * 45}, ${y * 45}, 45, 45))`;
	img.style.width = "10%";
	img.style.height = "10%";
	img.style.position = "absolute";
	img.style.left = (x2 + 1) * 10 + "%";
	img.style.top = 90 - (y2 + 1) * 10 + "%";
	img.style.position = "absolute";
	img.id = id;
	img.dataset.x = x2;
	img.dataset.y = y2;
	game.appendChild(img);
	return img;
}

const pieces = {
	white: [
		createPiece("Pawn", 5, 0, 0, 1),
		createPiece("Pawn", 5, 0, 1, 1),
		createPiece("Pawn", 5, 0, 2, 1),
		createPiece("Pawn", 5, 0, 3, 1),
		createPiece("Pawn", 5, 0, 4, 1),
		createPiece("Pawn", 5, 0, 5, 1),
		createPiece("Pawn", 5, 0, 6, 1),
		createPiece("Pawn", 5, 0, 7, 1),

		createPiece("Rook",   4, 0, 0, 0),
		createPiece("Bishop", 2, 0, 1, 0),
		createPiece("Knight", 3, 0, 2, 0),
		createPiece("Queen",  1, 0, 3, 0),
		createPiece("King",   0, 0, 4, 0),
		createPiece("Knight", 3, 0, 5, 0),
		createPiece("Bishop", 2, 0, 6, 0),
		createPiece("Rook",   4, 0, 7, 0),
	],
	black: [
		createPiece("Pawn", 5, 1, 0, 6),
		createPiece("Pawn", 5, 1, 1, 6),
		createPiece("Pawn", 5, 1, 2, 6),
		createPiece("Pawn", 5, 1, 3, 6),
		createPiece("Pawn", 5, 1, 4, 6),
		createPiece("Pawn", 5, 1, 5, 6),
		createPiece("Pawn", 5, 1, 6, 6),
		createPiece("Pawn", 5, 1, 7, 6),

		createPiece("Rook",   4, 1, 0, 7),
		createPiece("Bishop", 2, 1, 1, 7),
		createPiece("Knight", 3, 1, 2, 7),
		createPiece("Queen",  1, 1, 3, 7),
		createPiece("King",   0, 1, 4, 7),
		createPiece("Knight", 3, 1, 5, 7),
		createPiece("Bishop", 2, 1, 6, 7),
		createPiece("Rook",   4, 1, 7, 7),
	]
};