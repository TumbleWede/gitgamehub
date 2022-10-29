const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const params = new URLSearchParams(window.location.search);
let size = Math.min(Math.max(parseInt(params.get("size")), 3), 10) || localStorage.sp_s || 3;
let grid = localStorage.sp_s == size && JSON.parse(localStorage.sp_g) || newGrid();
let solvedGrid = newGrid();
let animatedCells = [];
let last = 0;
let deltaTime = 0;
let debounce = localStorage.sp_s == size && true || false;
let loading = localStorage.sp_s != size && true || false;
let j = 0
if (localStorage.sp_s != size) {scrambleGrid(size - 1, size - 1);}

canvas.width = 1000;
canvas.height = 1000;

// Update canvas size
updateWindow();
window.onresize = updateWindow;

function updateWindow() {
	if (window.innerWidth / window.innerHeight < 1) {
		canvas.style.width = "100%";
		canvas.style.height = null;
		document.body.style.backgroundSize = window.innerWidth / size * 2 + "px";
	} else {
		canvas.style.width = null;
		canvas.style.height = "100%";
		document.body.style.backgroundSize = window.innerHeight / size * 2 + "px";
	}
}

function newGrid() {
	const grid = [];
	let number = 1;

	for (let y = 0; y < size; y++) {
		grid[y] = [];

		for (let x = 0; x < size; x++) {
			grid[y][x] = number
			number++;
		}
	}

	grid[size - 1][size - 1] = undefined;
	return grid;
}

function lerp(a, b, t) {return a + (b - a) * t;}
function inBounds(x, y) {return x >= 0 && x < size && y >= 0 && y < size;}

function slide(x, y, x2, y2, i) {
	for (let j = i; j > 0; j--) {
		[grid[y + y2 * j][x + x2 * j], grid[y + y2 * (j - 1)][x + x2 * (j - 1)]] = [grid[y + y2 * (j - 1)][x + x2 * (j - 1)], grid[y + y2 * j][x + x2 * j]];

		if (!loading) {
			animatedCells.push({x: x + x2 * j, y: y + y2 * j, x2, y2, t: 1});
			setTimeout(() => {animatedCells.splice(0, 1);}, 250);
		}
	}
}

function scrambleGrid(x, y) {
	for (let i = 0; i < 1000; i++) {
		const random = Math.random();
		
		if (random >= 0.75 && inBounds(x, y + 1)) { // Up
			slide(x, y + 1, 0, -1, 1);
			y++;
		} else if (random >= 0.5 && inBounds(x - 1, y)) { // Left
			slide(x - 1, y, 1, 0, 1);
			x--;
		} else if (random >= 0.25 && inBounds(x, y - 1)) { // Down
			slide(x, y - 1, 0, 1, 1);
			y--;
		} else if (inBounds(x + 1, y)) { // Right
			slide(x + 1, y, -1, 0, 1);
			x++;
		}
	}

	setTimeout(() => {
		if (j < size) {
			j += 0.05;
			scrambleGrid(x, y);
		} else {
			debounce = true;
			loading = false;
			localStorage.sp_g = JSON.stringify(grid);
			localStorage.sp_s = size;
		}
	});
}

function solved() {
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (grid[y][x] != solvedGrid[y][x]) {
				return false;
			}
		}
	}

	return true;
}

canvas.onclick = (event) => {
	const rect = event.target.getBoundingClientRect()
	const x = Math.max(Math.floor((event.clientX - rect.left) / rect.width * size), 0);
	const y = Math.max(Math.floor((event.clientY - rect.top) / rect.height * size), 0);
	
	if (grid[y][x] && debounce) {
		for (let i = 1; i < size; i++) {
			if (inBounds(x, y + i) && !grid[y + i][x]) { // Up
				slide(x, y, 0, 1, i);
				break;
			} else if (inBounds(x - i, y) && !grid[y][x - i]) { // Left
				slide(x, y, -1, 0, i);
				break;
			} else if (inBounds(x, y - i) && !grid[y - i][x]) { // Down
				slide(x, y, 0, -1, i);
				break;
			} else if (inBounds(x + i, y) && !grid[y][x + i]) { // Right
				slide(x, y, 1, 0, i);
				break;
			}
		}

		if (solved()) {
			debounce = false;
			setTimeout(() => {
				size = math.min(size + 1, 10);
				grid = newGrid();
				solvedGrid = newGrid();
				debounce = false;
				loading = true;
				j = 0
				updateWindow();
				scrambleGrid(size - 1, size - 1);
			}, 1000);
		}

		localStorage.sp_g = JSON.stringify(grid);
		localStorage.sp_s = size;
	}
}

function update(time) {
	deltaTime = (time - last) / 1000;
	last = time;
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (!grid[y][x]) {continue;} // Dont put text on the empty square
			const width = canvas.width / size;
			const height = canvas.height / size;
			const x2 = (grid[y][x] - 1) % size;
			const y2 = Math.floor((grid[y][x] - 1) / size);
			ctx.font = Math.floor(600 / size) + "px Trebuchet MS";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			let animCell

			for (let i = 0; i < animatedCells.length; i++) {
				if (animatedCells[i].x == x && animatedCells[i].y == y) {
					animCell = animatedCells[i];
				}
			}

			if (animCell) {
				animCell.t = lerp(animCell.t, 0, deltaTime * 20);
				ctx.fillStyle = `rgb(
					0,
					${Math.floor(255 - 255 / size * y2)},
					${Math.floor(255 - 255 / size * x2)}
				)`
				ctx.fillRect(width * (x - animCell.x2 * animCell.t) + 10 / size, height * (y - animCell.y2 * animCell.t) + 10 / size, width - 20 / size, height - 20 / size);
				ctx.fillStyle = "white";
				ctx.fillText(grid[y][x], width * (x - animCell.x2 * animCell.t) + width * 0.5, height * (y - animCell.y2 * animCell.t) + height * 0.5);
			} else {
				ctx.fillStyle = `rgb(
					0,
					${Math.floor(255 - 255 / size * y2)},
					${Math.floor(255 - 255 / size * x2)}
				)`
				ctx.fillRect(width * x + 10 / size, height * y + 10 / size, width - 20 / size, height - 20 / size);
				ctx.fillStyle = "white";
				ctx.fillText(grid[y][x], width * x + width * 0.5, height * y + height * 0.5);
			}

			if (loading) {
				ctx.font = "100px Trebuchet MS";
				ctx.fillText(`Shuffling... (${Math.floor(j / size * 100)}%)`, canvas.width / 2, canvas.height / 2);
				ctx.fillStyle = "black";
				ctx.lineWidth = 2;
				ctx.strokeText(`Shuffling... (${Math.floor(j / size * 100)}%)`, canvas.width / 2, canvas.height / 2);
			}
		}
	}
	
	window.requestAnimationFrame(update);
}

update(0);