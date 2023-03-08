const game = document.getElementById("game");
const container = document.getElementById("container");
const gameOverText = document.getElementById("gameOver");

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
let gameOver = false;

for (let i = 0; i < 4; i++) {
	grid[i] = [];
	
	for (let j = 0; j < 4; j++) {
		grid[i][j] = 0;
		const cell = document.createElement("div");
		cell.id = "" + j + i;
		cell.className = "cell";
		cell.style.top = i * 25 + "%";
		cell.style.left = j * 25 + "%";
		container.appendChild(cell);
	}
}

function getColor(n) {
	switch(n) {
		case 2: return "#e0e0e0";
		case 4: return "#d0b0b0";
		case 8: return "#ff8080";
		case 16: return "#ff4040";
		case 32: return "#ff6000";
		case 64: return "#ffaa00";
		case 128: return "#ffdd00";
		case 256: return "#aaff40";
		case 512: return "#00ff40";
		case 1024: return "#00ffaa";
		case 2048: return "#00ffff";
		case 4096: return "#00aaff";
		case 8192: return "#2000ff";
		default: return "#2000aa";
	}
}

function randomTile() {
	const bag = [];
	
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (!grid[i][j]) {
				bag.push([j, i]);
			}
		}
	}
	if (bag.length > 0) {return bag[Math.floor(Math.random() * bag.length)];}
	return [-1, -1];
}

function createTile() {
	const [x, y] = randomTile();
	
	if (x == -1) {
		gameOver = true;
		return;
	}
	
	const tile = document.createElement("div");
	tile.id = "tile" + x + y;
	tile.className = "tile";
	tile.dataset.x = x;
	tile.dataset.y = y;
	tile.dataset.val = Math.random() >= 0.9 ? 4 : 2;
	tile.innerHTML = tile.dataset.val;
	tile.style.top = y * 25 + "%";
	tile.style.left = x * 25 + "%";
	tile.style.background = getColor(parseInt(tile.dataset.val));
	tile.style.fontSize = "min(" + 35 / tile.innerHTML.length + "vmin, 12vmin)";
	tile.style.zIndex = 3;
	container.appendChild(tile);
	grid[y][x] = parseInt(tile.dataset.val);
	return tile;
}

createTile();
createTile();

function isValid(x, y) {return x >= 0 && x < 4 && y >= 0 && y < 4;}
function getTile(x, y) {return document.getElementById("tile" + x + y);}

function slideTiles(x, y) {
	let max = 0;
	
	for (let i = 0; i < 4; i++) {
		const i2 = y > 0 ? 3 - i : i;
		
		for (let j = 0; j < 4; j++) {
			const j2 = x > 0 ? 3 - j : j;
			if (grid[i2][j2] == 0) {continue;}
			let j3 = j2, i3 = i2;
			
			for (let k = 1; k < 4; k++) {
				if (isValid(j3 + x, i3 + y) && grid[i3 + y][j3 + x] == 0) {
					max = 1;
					j3 += x;
					i3 += y;
				} else {break;}
			}
			
			const tile = getTile(j2, i2);
			tile.id = "tile" + j3 + i3;
			tile.style.top = i3 * 25 + "%";
			tile.style.left = j3 * 25 + "%";
			[grid[i3][j3], grid[i2][j2]] = [grid[i2][j2], grid[i3][j3]];
		}
	}
	
	return max;
}

function mergeTiles(x, y) {
	let max = 0;
	const garbage = [];
	
	for (let i = 0; i < 4; i++) {
		const i2 = y > 0 ? 3 - i : i;
		
		for (let j = 0; j < 4; j++) {
			const j2 = x > 0 ? 3 - j : j;
			
			if (grid[i2][j2] == 0) {continue;}
			if (isValid(j2 + x, i2 + y) && grid[i2][j2] == grid[i2 + y][j2 + x]) {
				const tile = getTile(j2, i2);
				const tile2 = getTile(j2 + x, i2 + y);
				tile.id = "tilegc";
				tile.style.top = tile2.style.top;
				tile.style.left = tile2.style.left;
				tile.style.zIndex = 2;
				garbage.push(tile);
				tile2.dataset.val = grid[i2][j2] * 2;
				tile2.innerHTML = tile2.dataset.val;
				tile2.style.fontSize = "min(" + 35 / tile2.innerHTML.length + "vmin, 12vmin)";
				tile2.style.background = getColor(parseInt(tile2.dataset.val));
				[grid[i2 + y][j2 + x], grid[i2][j2]] = [grid[i2][j2] * 2, 0];
				max = 1;
			}
		}
	}
	
	return [max, garbage];
}

function canSlide(x, y) {
	for (let i = 0; i < 4; i++) {
		const i2 = y > 0 ? 3 - i : i;
		
		for (let j = 0; j < 4; j++) {
			const j2 = x > 0 ? 3 - j : j;
			if (grid[i2][j2] == 0) {continue;}
			let j3 = j2, i3 = i2;
			
			for (let k = 1; k < 4; k++) {
				if (isValid(j3 + x, i3 + y) && grid[i3 + y][j3 + x] == 0) {
					return true;
				} else {break;}
			}
		}
	}
	
	return false;
}

function canMerge(x, y) {
	for (let i = 0; i < 4; i++) {
		const i2 = y > 0 ? 3 - i : i;
		
		for (let j = 0; j < 4; j++) {
			const j2 = x > 0 ? 3 - j : j;
			
			if (grid[i2][j2] == 0) {continue;}
			if (isValid(j2 + x, i2 + y) && grid[i2][j2] == grid[i2 + y][j2 + x]) {
				return true;
			}
		}
	}
	
	return false;
}

function shiftTiles(x, y) {
	let max = 0;								// [2, 2, 0, 2] - Start
	max = Math.max(max, slideTiles(x, y));		// [2, 2, 2, 0] - First slide
	const [max2, garbage] = mergeTiles(x, y);	// [4, 0, 2, 0] - Merge
	max = Math.max(max, slideTiles(x, y));		// [4, 2, 0, 0] - Second slide
	max = Math.max(max, max2);
	return [max == 1, garbage];
}

document.onkeydown = e => {
	if (gameOver) {return;}
	let change = false;
	let garbage = [];
	
	if (e.code == "KeyW" || e.code == "ArrowUp") {
		[change, garbage] = shiftTiles(0, -1);
	} else if (e.code == "KeyA" || e.code == "ArrowLeft") {
		[change, garbage] = shiftTiles(-1, 0);
	} else if (e.code == "KeyS" || e.code == "ArrowDown") {
		[change, garbage] = shiftTiles(0, 1);
	} else if (e.code == "KeyD" || e.code == "ArrowRight") {
		[change, garbage] = shiftTiles(1, 0);
	}
	
	if (change) {createTile();}
	if (!(
		canSlide(1, 0) ||
		canSlide(-1, 0) ||
		canSlide(0, 1) ||
		canSlide(0, -1) ||
		canMerge(1, 0) ||
		canMerge(-1, 0) ||
		canMerge(0, 1) ||
		canMerge(0, -1)
	)) {gameOver = true;}
	
	setTimeout(() => {
		for (let i = 0; i < garbage.length; i++) {
			garbage[i].remove();
		}
	}, 100);
	
	if (gameOver) {
		gameOverText.style.scale = 1;
		
		setTimeout(() => {
			const tiles = document.getElementsByClassName("tile");
			gameOverText.style.scale = 0;
			
			for (let i = 0; i < tiles.length; i++) {
				tiles[i].style.scale = 0;
				tiles[i].id = "tilegc";
			}
			
			setTimeout(() => {
				for (let i = 0; i < tiles.length; i++) {
					tiles[i].remove();
				}
				
				for (let i = 0; i < 4; i++) {
					for (let j = 0; j < 4; j++) {
						grid[i][j] = 0;
					}
				}

				createTile();
				createTile();
				gameOver = false;
			}, 100);
		}, 2000);
	}
}