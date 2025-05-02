export class Tile {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.sprite = null;
		this.static = true;
		this.germ = false;
		this.pair = null;
	}

	static null = new Tile(0, 0, "");
}