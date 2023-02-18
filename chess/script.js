const game = document.getElementById("game");
const board = document.getElementById("board");
const pieceDiv = document.getElementById("pieces");
const movesDiv = document.getElementById("moves");
const gameOverText = document.getElementById("gameOver");
const params = new URLSearchParams(window.location.search);
const flipPieces = params.get("flipPieces") == "true";

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
let isWin = false;
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
		div.dataset.x = i;
		div.dataset.y = 7 - j;
		div.style.background = div.dataset.background;
		board.appendChild(div);
		
		const circle = document.createElement("div");
		circle.id = letters[i] + (8 - j);
		circle.className = "circle";
		circle.style.position = "absolute";
		circle.style.width = "5%";
		circle.style.height = "5%";
		circle.style.left = i * 12.5 + 3.75 + "%";
		circle.style.top = j * 12.5 + 3.75 + "%";
		circle.dataset.background = (i + j) % 2 == 0 ? "#ffebcc" : "#ad884c";
		circle.dataset.highlight = (i + j) % 2 == 0 ? "#fff566" : "#d6c424";
		circle.dataset.x = i;
		circle.dataset.y = 7 - j;
		circle.style.background = "rgba(0, 0, 0, 0.35)";
		circle.style.borderRadius = "50%";
		circle.hidden = true;
		circle.style.zIndex = "1";
		moves.appendChild(circle);
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
function createPiece(className, id, x, y, x2, y2) {
	const img = document.createElement("img");
	img.src = `assets/pieces.svg#svgView(viewBox(${x * 45}, ${y * 45}, 45, 45))`;
	img.draggable = false;
	img.style.width = "12.5%";
	img.style.height = "12.5%";
	img.style.position = "absolute";
	img.style.left = x2 * 12.5 + "%";
	img.style.top = 87.5 - y2 * 12.5 + "%";
	img.style.position = "absolute";
	img.style.zIndex = "0";
	img.style.transition = "0.1s";
	img.dataset.x = x2;
	img.dataset.y = y2;
	img.dataset.color = y ? "black" : "white";
	img.dataset.moves = 0;
	img.id = id + img.dataset.color;
	img.className = className;
	pieceDiv.appendChild(img);

	img.onmousedown = e => {
		if (currentMove != img.dataset.color) {return;}
		if (currentPiece && currentPiece != img) {
			toggleSelect = false;
			const square = getSquare(currentPiece.dataset.x, currentPiece.dataset.y);
			square.style.background = square.dataset.background;
		}
		getSquare(img.dataset.x, img.dataset.y).style.background = getSquare(img.dataset.x, img.dataset.y).dataset.highlight;
		currentPiece = img;
		mouseDown = true;
		const validMoves = getValidMoves(currentPiece);
		currentPiece.style.zIndex = "2";
		
		for (let i = 0; i < document.getElementsByClassName("circle").length; i++) {
			const circle = document.getElementsByClassName("circle")[i];
			const square = getSquare(circle.dataset.x, circle.dataset.y);
			circle.hidden = validMoves.indexOf(square) == -1;
			circle.style.background = isOccupied(circle.dataset.x, circle.dataset.y) ? "rgba(255, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.35)";
			
			if (!circle.hidden && currentPiece.className == "pawn" && Math.abs(square.dataset.x - currentPiece.dataset.x) == 1 && !isOccupied(square.dataset.x, square.dataset.y)) { // ℰ𝓃 𝒫𝒶𝓈𝓈𝒶𝓃𝓉
				circle.style.background = "rgba(255, 0, 0, 0.35)";
			}
		}
	}

	return img;
}

const pieces = {
	white: [
		createPiece("pawn", "Pa", 5, 0, 0, 1),
		createPiece("pawn", "Pb", 5, 0, 1, 1),
		createPiece("pawn", "Pc", 5, 0, 2, 1),
		createPiece("pawn", "Pd", 5, 0, 3, 1),
		createPiece("pawn", "Pe", 5, 0, 4, 1),
		createPiece("pawn", "Pf", 5, 0, 5, 1),
		createPiece("pawn", "Pg", 5, 0, 6, 1),
		createPiece("pawn", "Ph", 5, 0, 7, 1),

		createPiece("rook",   "R", 4, 0, 0, 0),
		createPiece("knight", "N", 3, 0, 1, 0),
		createPiece("bishop", "B", 2, 0, 2, 0),
		createPiece("queen",  "Q", 1, 0, 3, 0),
		createPiece("king",   "K", 0, 0, 4, 0),
		createPiece("bishop", "b", 2, 0, 5, 0),
		createPiece("knight", "n", 3, 0, 6, 0),
		createPiece("rook",   "r", 4, 0, 7, 0),
	],
	black: [
		createPiece("pawn", "Pa", 5, 1, 0, 6),
		createPiece("pawn", "Pb", 5, 1, 1, 6),
		createPiece("pawn", "Pc", 5, 1, 2, 6),
		createPiece("pawn", "Pd", 5, 1, 3, 6),
		createPiece("pawn", "Pe", 5, 1, 4, 6),
		createPiece("pawn", "Pf", 5, 1, 5, 6),
		createPiece("pawn", "Pg", 5, 1, 6, 6),
		createPiece("pawn", "Ph", 5, 1, 7, 6),

		createPiece("rook",   "R", 4, 1, 0, 7),
		createPiece("knight", "N", 3, 1, 1, 7),
		createPiece("bishop", "B", 2, 1, 2, 7),
		createPiece("queen",  "Q", 1, 1, 3, 7),
		createPiece("king",   "K", 0, 1, 4, 7),
		createPiece("bishop", "b", 2, 1, 5, 7),
		createPiece("knight", "n", 3, 1, 6, 7),
		createPiece("rook",   "r", 4, 1, 7, 7),
	]
};

function isOccupied(x, y) {
	const otherKing = document.getElementById("K" + currentMove);
	if (otherKing.dataset.x == x && otherKing.dataset.y == y) {return false;}
	for (let i = pieces.white.length - 1; i >= 0; i--) {
		if (pieces.white[i].dataset.x == x && pieces.white[i].dataset.y == y) {
			return pieces.white[i];
		}
	}
	for (let i = pieces.black.length - 1; i >= 0; i--) {
		if (pieces.black[i].dataset.x == x && pieces.black[i].dataset.y == y) {
			return pieces.black[i];
		}
	}
	return false;
}

function isValid(piece, x, y) {
	const otherKing = document.getElementById("K" + (piece.dataset.color == "white" ? "black" : "white"));
	if (!(x >= 0 && x < 8 && y >= 0 && y < 8)) {return false;} // Make sure the piece is in bounds
	if (otherKing.dataset.x == x && otherKing.dataset.y == y) {return true;}
	const list = piece.dataset.color == "white" ? pieces.white : pieces.black;

	for (let i = 0; i < list.length; i++) {
		if (list[i].dataset.x == x && list[i].dataset.y == y) {
			return false;
		}
	}
	
	return true;
}

function getMoves(piece) {
	const x = parseInt(piece.dataset.x), y = parseInt(piece.dataset.y);
	const dir = piece.dataset.color == "white" ? 1 : -1;
	const moves = [];
	
	if (piece.className == "pawn") {
		if (isValid(piece, x, y + dir) && !isOccupied(x, y + dir)) { // Move forward
			moves.push(getSquare(x, y + dir));
				if (piece.dataset.moves == 0 && isValid(piece, x, y + 2 * dir) && !isOccupied(x, y + 2 * dir)) { // Move forward 2 spaces on the first move
				moves.push(getSquare(x, y + 2 * dir));
			}
		}
		if (isValid(piece, x - 1, y + dir) && isOccupied(x - 1, y + dir)) { // Attack left
			moves.push(getSquare(x - 1, y + dir));
		}
		if (isValid(piece, x + 1, y + dir) && isOccupied(x + 1, y + dir)) { // Attack right
			moves.push(getSquare(x + 1, y + dir));
		}
		if (isValid(piece, x - 1, y + dir) && isOccupied(x - 1, y) && isOccupied(x - 1, y).dataset.moves == 1 && (y == 3 || y == 4)) { // ℰ𝓃 𝒫𝒶𝓈𝓈𝒶𝓃𝓉 left
			moves.push(getSquare(x - 1, y + dir));
		}
		if (isValid(piece, x + 1, y + dir) && isOccupied(x + 1, y) && isOccupied(x + 1, y).dataset.moves == 1 && (y == 3 || y == 4)) { // ℰ𝓃 𝒫𝒶𝓈𝓈𝒶𝓃𝓉 right
			moves.push(getSquare(x + 1, y + dir));
		}
	} else if (piece.className == "knight") {
		if (isValid(piece, x - 1, y + 2)) {moves.push(getSquare(x - 1, y + 2));}
		if (isValid(piece, x + 1, y + 2)) {moves.push(getSquare(x + 1, y + 2));}
		if (isValid(piece, x - 1, y - 2)) {moves.push(getSquare(x - 1, y - 2));}
		if (isValid(piece, x + 1, y - 2)) {moves.push(getSquare(x + 1, y - 2));}
		if (isValid(piece, x - 2, y + 1)) {moves.push(getSquare(x - 2, y + 1));}
		if (isValid(piece, x + 2, y + 1)) {moves.push(getSquare(x + 2, y + 1));}
		if (isValid(piece, x - 2, y - 1)) {moves.push(getSquare(x - 2, y - 1));}
		if (isValid(piece, x + 2, y - 1)) {moves.push(getSquare(x + 2, y - 1));}
	} else if (piece.className == "king") {
		for (let i = -1; i < 2; i++) {
			for (let j = -1; j < 2; j++) {
				if (!(i == 0 && j == 0) && isValid(piece, x + i, y + j)) {moves.push(getSquare(x + i, y + j));}
			}
		}
	} else if (piece.className == "rook") {
		for (let i = 0; i < 2; i++) {
			const k = (i - 0.5) * 2;
			
			for (let j = 1; j < 8; j++) { // Up and Down
				if (isValid(piece, x, y + j * k)) {
					moves.push(getSquare(x, y + j * k));

					if (isOccupied(x, y + j * k)) {
						if (isOccupied(x, y + j * k).dataset.color == piece.dataset.color) {
							moves.pop();
						}
						break;
					}
				} else {
					break;
				}
			}
			
			for (let j = 1; j < 8; j++) { // Left and Right
				if (isValid(piece, x + j * k, y)) {
					moves.push(getSquare(x + j * k, y));

					if (isOccupied(x + j * k, y)) {
						if (isOccupied(x + j * k, y).dataset.color == piece.dataset.color) {
							moves.pop();
						}
						break;
					}
				} else {
					break;
				}
			}
		}
	} else if (piece.className == "bishop") {
		for (let i = 0; i < 2; i++) {
			const k = (i - 0.5) * 2;
			
			for (let j = 1; j < 8; j++) { // Top Right and Bottom Left
				if (isValid(piece, x + j * k, y + j * k)) {
					moves.push(getSquare(x + j * k, y + j * k));

					if (isOccupied(x + j * k, y + j * k)) {
						if (isOccupied(x + j * k, y + j * k).dataset.color == piece.dataset.color) {
							moves.pop();
						}
						break;
					}
				} else {
					break;
				}
			}
			
			for (let j = 1; j < 8; j++) { // Top Left and Bottom Right
				if (isValid(piece, x - j * k, y + j * k)) {
					moves.push(getSquare(x - j * k, y + j * k));

					if (isOccupied(x - j * k, y + j * k)) {
						if (isOccupied(x - j * k, y + j * k).dataset.color == piece.dataset.color) {
							moves.pop();
						}
						break;
					}
				} else {
					break;
				}
			}
		}
	} else if (piece.className == "queen") {
		for (let i = -1; i < 2; i++) {
			for (let j = -1; j < 2; j++) {
				if (i == 0 && j == 0) {continue;}
				
				for (let k = 1; k < 8; k++) { // Up and Down
					if (isValid(piece, x + i * k, y + j * k)) {
						moves.push(getSquare(x + i * k, y + j * k));

						if (isOccupied(x + i * k, y + j * k)) {
							if (isOccupied(x + i * k, y + j * k).dataset.color == piece.dataset.color) {
								moves.pop();
							}
							break;
						}
					} else {
						break;
					}
				}
			}
		}
	}
	
	return moves;
}

function getValidMoves(piece) {
	const moves = getMoves(piece);
	const king = document.getElementById("K" + piece.dataset.color);
	
	for (let i = moves.length - 1; i >= 0; i--) {
		if (check(piece, moves[i].dataset.x, moves[i].dataset.y)) {
			moves.splice(i, 1);
		}
	}
	
	// Castle
	if (piece.className == "king" && piece.dataset.moves == 0 && !check(piece, piece.dataset.x, piece.dataset.y)) {
		const x = parseInt(piece.dataset.x), y = parseInt(piece.dataset.y);
		const lRook = document.getElementById("R" + piece.dataset.color), rRook = document.getElementById("r" + piece.dataset.color);
		if (lRook && lRook.dataset.moves == 0 && !isOccupied(x - 1, y) && !isOccupied(x - 2, y) && !isOccupied(x - 3, y) && !check(piece, x - 1, y) && !check(piece, x - 2, y)) {
			moves.push(getSquare(x - 2, y));
		}
		if (rRook && rRook.dataset.moves == 0 && !isOccupied(x + 1, y) && !isOccupied(x + 2, y) && !check(piece, x + 1, y) && !check(piece, x + 2, y)) {
			moves.push(getSquare(x + 2, y));
		}
	}
	
	return moves;
}

function check(piece, x, y) {
	const king = document.getElementById("K" + piece.dataset.color);
	const list = piece.dataset.color == "white" ? pieces.black : pieces.white;
	const x2 = piece.dataset.x, y2 = piece.dataset.y;
	piece.dataset.x = x;
	piece.dataset.y = y;
	
	for (let i = 0; i < list.length; i++) {
		const moves = getMoves(list[i]);
		
		if (moves.indexOf(getSquare(king.dataset.x, king.dataset.y)) != -1) {
			if (piece.dataset.x == list[i].dataset.x && piece.dataset.y == list[i].dataset.y) {
				continue;
			}
			piece.dataset.x = x2;
			piece.dataset.y = y2;
			return true;
		}
	}
	
	piece.dataset.x = x2;
	piece.dataset.y = y2;
	return false;
}

document.onmousemove = e => {
	if (currentPiece && mouseDown) {
		currentPiece.style.transition = "0s";
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
		const validMoves = getValidMoves(currentPiece);
		
		if (x == currentPiece.dataset.x && y == currentPiece.dataset.y) { // If the piece is dragged on the same square, then treat it as a click.
			toggleSelect = !toggleSelect;
			square.style.background = toggleSelect ? square.dataset.highlight : square.dataset.background;
		} else if (isValid(currentPiece, x, y) && validMoves.indexOf(getSquare(x, y)) != -1) { // Player made a move
			toggleSelect = false;
			square.style.background = square.dataset.background;
			const dir = currentPiece.dataset.color == "white" ? 1 : -1;
			
			// Castle
			if (currentPiece.className == "king") {
				if (x - currentPiece.dataset.x == -2) {
					const rook = document.getElementById("R" + currentPiece.dataset.color);
					if (rook) {
						rook.dataset.x = 3;
						rook.style.left = rook.dataset.x * 12.5 + "%";
						rook.style.top = 87.5 - rook.dataset.y * 12.5 + "%";
					}
				} else if (x - currentPiece.dataset.x == 2) {
					const rook = document.getElementById("r" + currentPiece.dataset.color);
					if (rook) {
						rook.dataset.x = 5;
						rook.style.left = rook.dataset.x * 12.5 + "%";
						rook.style.top = 87.5 - rook.dataset.y * 12.5 + "%";
					}
				}
			} else if (currentPiece.className == "pawn" && Math.abs(x - currentPiece.dataset.x) == 1 && !isOccupied(x, y)) { // ℰ𝓃 𝒫𝒶𝓈𝓈𝒶𝓃𝓉
				isOccupied(x, currentPiece.dataset.y).dataset.y = y;
			} else if (currentPiece.className == "pawn" && y % 7 == 0) { // Promote pawn to queen
				const i = pieces[currentMove].indexOf(currentPiece);
				pieces[currentMove][i].remove();
				pieces[currentMove][i] = createPiece("queen",  "Q", 1, currentMove == "black" ? 1 : 0, x, y);
			}
			
			currentPiece.dataset.x = x;
			currentPiece.dataset.y = y;
			currentPiece.dataset.moves++;
			currentPiece.style.zIndex = "0";
			currentMove = currentMove == "white" ? "black" : "white";
			
			// Check for captures
			const list = currentPiece.dataset.color == "black" ? pieces.white : pieces.black;
			
			for (let i = list.length - 1; i >= 0; i--) {
				if (list[i].dataset.x == x && list[i].dataset.y == y) {
					list[i].remove();
					list.splice(i, 1);
					break;
				}
			}
			
			for (let i = 0; i < document.getElementsByClassName("circle").length; i++) {
				const circle = document.getElementsByClassName("circle")[i];
				circle.hidden = true;
			}
			
			let gameOver = true;
			
			for (let i = 0; i < pieces[currentMove].length; i++) {
				if (getValidMoves(pieces[currentMove][i]).length > 0) {
					gameOver = false;
					break;
				}
			}
			
			if (gameOver) {
				const king = document.getElementById("K" + currentMove);
				
				if (check(king, king.dataset.x, king.dataset.y)) {
					gameOverText.style.color = currentMove == "white" ? "black" : "white";
					gameOverText.innerHTML = "Checkmate!";
				} else {
					gameOverText.style.color = "white";
					gameOverText.innerHTML = "Stalemate!";
				}
				setTimeout(() => window.location.reload(), 3000);
			}
			for (let i = 0; i < pieceDiv.children.length; i++) {
				pieceDiv.children[i].style.transform = "rotate(" + (flipPieces && currentMove == "black" ? 180 : 0) + "deg)";
			}
		} else {
			toggleSelect = true;
			square.style.background = square.dataset.highlight;
		}

		currentPiece.style.transition = "0.1s";
		currentPiece.style.left = currentPiece.dataset.x * 12.5 + "%";
		currentPiece.style.top = 87.5 - currentPiece.dataset.y * 12.5 + "%";

		if (!toggleSelect) {
			square.style.background = square.dataset.background;
			currentPiece = null;
			
			for (let i = 0; i < document.getElementsByClassName("circle").length; i++) {
				const circle = document.getElementsByClassName("circle")[i];
				circle.hidden = true;
			}
		}
		mouseDown = false;
	}
};