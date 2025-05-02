const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

export class Sprite {
	constructor(path) {
		this.image = new Image();
		this.image.src = path;
	}

	draw(x, y, w, h) {
		ctx.drawImage(this.image, x, y, w, h);
	}
}

export class Tilemap {
	constructor(path, pixelSize, tilePixelSize) {
		this.image = new Image();
		this.image.src = path;
		this.pixelSize = pixelSize;
		this.tilePixelSize = tilePixelSize;
	}

	// Returns a function to be called when the script wants to draw a sprite tile
	new(tileX, tileY, sizeX = 1, sizeY = sizeX) {
		return (x, y) => {
			ctx.drawImage(this.image, this.tilePixelSize * tileX, this.tilePixelSize * tileY, this.tilePixelSize * sizeX, this.tilePixelSize * sizeY, this.pixelSize * x, this.pixelSize * y, this.pixelSize * sizeX, this.pixelSize * sizeY);
		};
	}
}

export const screen = {
	WIDTH: 256*2,
	HEIGHT: 224*2,
	PIXEL_SIZE: 16
}

screen.HALF_WIDTH = screen.WIDTH * 0.5;
screen.HALF_HEIGHT = screen.HEIGHT * 0.5;
screen.INVERSE_PIXEL_SIZE = 1 / screen.PIXEL_SIZE;
screen.HALF_PIXEL_SIZE = screen.PIXEL_SIZE * 0.5;

export const spritesheets = {
	tiles: new Tilemap("assets/images/spritesheet_tiles.png", screen.PIXEL_SIZE, 16),
	backgrounds: new Tilemap("assets/images/spritesheet_backgrounds.png", screen.PIXEL_SIZE, 16),
	mainmenu: new Tilemap("assets/images/mainmenu.png", screen.PIXEL_SIZE, 32)
}