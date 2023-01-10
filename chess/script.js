const game = document.getElementById("game");
const board = document.getElementById("board");
const pieceDiv = document.getElementById("pieces");

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

let currentMove = "white";
let currentPiece;
let toggleSelect = false;
let mouseDown = false;
let letters = ["a", "b", "c", "d", "e", "f", "g", "h"]

// Draw board
for (let i = 0; i < 8; i++) {
	for (let j = 0; j < 8; j++) {
		const div = document.createElement("div");
		div.id = letters[i] + (8 - j);
		div.className = "square";
		div.style.position = "absolute";
		div.style.width = "12.5%";
		div.style.height = "12.5%";
		div.style.left = i * 12.5 + "%";
		div.style.top = j * 12.5 + "%";
		div.dataset.background = (i + j) % 2 == 0 ? "#ffebcc" : "#ad884c";
		div.dataset.highlight = (i + j) % 2 == 0 ? "#fff566" : "#d6c424";
		div.style.background = div.dataset.background;
		board.appendChild(div);
	}

	const row = document.createElement("p");
	row.id = i;
	row.innerHTML = i + 1;
	row.style.left = "0.5%";
	row.style.top = 88 - i * 12.5 + "%";
	row.style.color = i % 2 == 0 ? "#ffebcc" : "#ad884c";
	board.appendChild(row);

	const col = document.createElement("p");
	col.id = letters[i];
	col.innerHTML = letters[i];
	col.style.top = "97.5%"
	col.style.left = 11 + i * 12.5 + "%";
	col.style.color = i % 2 == 0 ? "#ffebcc" : "#ad884c";
	board.appendChild(col);
}

function getSquare(x, y) {return document.getElementById(letters[x] + (parseInt(y) + 1));}
function createPiece(id, x, y, x2, y2) {
	const img = document.createElement("img");
	img.src = `assets/pieces.svg#svgView(viewBox(${x * 45}, ${y * 45}, 45, 45))`;
	img.id = id;
	img.className = "piece";
	img.draggable = false;
	img.style.width = "12.5%";
	img.style.height = "12.5%";
	img.style.position = "absolute";
	img.style.left = x2 * 12.5 + "%";
	img.style.top = 87.5 - y2 * 12.5 + "%";
	img.style.position = "absolute";
	img.dataset.x = x2;
	img.dataset.y = y2;
	img.dataset.color = y ? "black" : "white";
	img.dataset.moves = 0;
	pieceDiv.appendChild(img);

	img.onmousedown = e => {
		if (currentPiece && currentPiece != img) {
			toggleSelect = false;
			const square = getSquare(currentPiece.dataset.x, currentPiece.dataset.y);
			square.style.background = square.dataset.background;
		}
		getSquare(img.dataset.x, img.dataset.y).style.background = getSquare(img.dataset.x, img.dataset.y).dataset.highlight;
		currentPiece = img;
		mouseDown = true;
	}

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
		createPiece("Knight", 3, 0, 1, 0),
		createPiece("Bishop", 2, 0, 2, 0),
		createPiece("Queen",  1, 0, 3, 0),
		createPiece("King",   0, 0, 4, 0),
		createPiece("Bishop", 2, 0, 5, 0),
		createPiece("Knight", 3, 0, 6, 0),
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
		createPiece("Knight", 3, 1, 1, 7),
		createPiece("Bishop", 2, 1, 2, 7),
		createPiece("Queen",  1, 1, 3, 7),
		createPiece("King",   0, 1, 4, 7),
		createPiece("Bishop", 2, 1, 5, 7),
		createPiece("Knight", 3, 1, 6, 7),
		createPiece("Rook",   4, 1, 7, 7),
	]
};

function isValid(piece, x, y) {
	if (!(x >= 0 && x < 8 && y >= 0 && y < 8)) {return false;} // Make sure the piece is in bounds
	//if (piece.color != currentMove) {return false;}

	// Check if the piece is overlapping another piece that's the same color
	const list = piece.dataset.color == "white" ? pieces.white : pieces.black;

	for (let i = 0; i < list.length; i++) {
		if ((list[i].dataset.x == x && list[i].dataset.y == y) && (list[i].dataset.x == x || list[i].dataset.x == y)) {
			return false;
		}
	}

	return true;
}

document.onmousemove = e => {
	if (currentPiece && mouseDown) {
		const rect = board.getBoundingClientRect();
		currentPiece.style.left = (e.clientX - rect.left) / rect.width * 100 - 6.25 + "%";
		currentPiece.style.top = (e.clientY - rect.top) / rect.height * 100 - 6.25 + "%";
	}
};

document.onmouseup = e => {
	if (currentPiece) {
		const rect = board.getBoundingClientRect();
		const x = Math.floor((e.clientX - rect.left) / rect.width * 8);
		const y = 7 - Math.floor((e.clientY - rect.top) / rect.height * 8);
		const square = getSquare(currentPiece.dataset.x, currentPiece.dataset.y);

		if (x == currentPiece.dataset.x && y == currentPiece.dataset.y) { // If the piece is dragged on the same square, then treat it as a click.
			toggleSelect = !toggleSelect;
			square.style.background = toggleSelect ? square.dataset.highlight : square.dataset.background;
		} else if (isValid(currentPiece, x, y)) { // Player made a move
			toggleSelect = false;
			square.style.background = square.dataset.background;
			currentPiece.dataset.x = x;
			currentPiece.dataset.y = y;
			currentPiece.dataset.moves++;

			// Check for captures
			const list = currentPiece.dataset.color == "black" ? pieces.white : pieces.black;

			for (let i = list.length - 1; i >= 0; i--) {
				if (list[i].dataset.x == x && list[i].dataset.y == y) {
					console.log(list[i])
					list[i].remove();
					list.splice(i, 1);
					console.log(list)
					break;
				}
			}
		} else {
			toggleSelect = true;
			square.style.background = square.dataset.highlight;
		}

		currentPiece.style.left = currentPiece.dataset.x * 12.5 + "%";
		currentPiece.style.top = 87.5 - currentPiece.dataset.y * 12.5 + "%";

		if (!toggleSelect) {
			square.style.background = square.dataset.background;
			currentPiece = null;
		}
		mouseDown = false;
	}
};