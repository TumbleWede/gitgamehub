const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function loadImage(url) {
	const img = new Image();
	img.src = url;
	return img;
}

const hidden = loadImage("assets/hidden.png");
const revealed = loadImage("assets/revealed.png");

const grid = [];
const rows = 10, cols = 8;
canvas.width = rows * 172 + 86;
canvas.height = cols * 150 + 50;

// Update canvas size
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

for (let x = 0; x < rows; x++) {
	grid[x] = [];

	for (let y = 0; y < cols; y++) {
		grid[x][y] = 0;
	}
}

document.onmousemove = event => {
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor(event.clientX - rect.left);
	const y = Math.floor(event.clientY - rect.top);
	console.log(x, y)
}

function update(time) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	for (let x = 0; x < rows; x++) {
		for (let y = 0; y < cols; y++) {
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = "25px Trebuchet MS";
			if (y % 2 == 0) {
				ctx.drawImage(hidden, x * 172, y * 150);
				ctx.fillText(x + ", " + y, x * 172 + 86, y * 150 + 100);
			} else {
				ctx.drawImage(hidden, x * 172 + 86, y * 150);
				ctx.fillText(x + ", " + y, x * 172 + 172, y * 150 + 100);
			}
		}
	}

	window.requestAnimationFrame(update);
}

update(0);