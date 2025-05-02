import { Grid } from "../modules/grid.js";
import { Pill } from "../modules/pill.js";
import { GameState, PlaybackState } from "../modules/state.js";
import { spritesheets, screen, Sprite } from "../modules/sprite.js";
import { ctx, deltaTime, lastTime, setScene } from "../script.js";
import { MainMenuScene } from "../scenes/mainmenu.js";
import { PseudoRandom } from "./rng.js";

// Timers
const MS_PER_GRID_UPDATE = 200;
const MS_PER_FALL = 400;
const MS_PER_FAST_FALL = 60;
const MS_PER_SPRITE_SWAP = 130;
const MS_PER_DANCING_SPRITE_SWAP = 200;
const MS_PER_CRASH_OUT_SPRITE_SWAP = 75;
const MS_PER_CRASH_OUT_ANIMATION = 250;
const MS_PER_PILL_THROW = 400;
const MS_PER_PILL_THROW_SPRITE_SWAP = 100;

const audio = document.getElementById("myAudio");

// Textures
export const pauseSprites = {
	stageClear: spritesheets.backgrounds.new(0, 31, 8, 16),
	gameOver: spritesheets.backgrounds.new(9, 31, 8, 16)
}

const germSprites = {
	red: [spritesheets.tiles.new(1, 10), spritesheets.tiles.new(1, 11)],
	yellow: [spritesheets.tiles.new(1, 13), spritesheets.tiles.new(1, 14)],
	blue: [spritesheets.tiles.new(1, 16), spritesheets.tiles.new(1, 17)]
}

const dancingGermSprites = {
	red: [spritesheets.tiles.new(2, 10, 3, 3), spritesheets.tiles.new(6, 10, 3, 3), spritesheets.tiles.new(10, 10, 3, 3), spritesheets.tiles.new(14, 10, 3, 3), spritesheets.tiles.new(17, 10, 3, 3), spritesheets.tiles.new(21, 10, 3, 3)],
	yellow: [spritesheets.tiles.new(2, 13, 3, 3), spritesheets.tiles.new(6, 13, 3, 3), spritesheets.tiles.new(10, 13, 3, 3), spritesheets.tiles.new(14, 13, 3, 3), spritesheets.tiles.new(17, 13, 3, 3), spritesheets.tiles.new(21, 13, 3, 3)],
	blue: [spritesheets.tiles.new(2, 16, 3, 3), spritesheets.tiles.new(6, 16, 3, 3), spritesheets.tiles.new(10, 16, 3, 3), spritesheets.tiles.new(14, 16, 3, 3), spritesheets.tiles.new(17, 16, 3, 3), spritesheets.tiles.new(21, 16, 3, 3)],
}

const marioSprites = [
	spritesheets.tiles.new(1, 23, 3, 5),
	spritesheets.tiles.new(4, 23, 4, 5),
	spritesheets.tiles.new(8, 23, 4, 5),
	spritesheets.tiles.new(12, 23, 5, 5),
	spritesheets.tiles.new(1, 28, 3, 5),
	spritesheets.tiles.new(4, 28, 3, 5),
	spritesheets.tiles.new(7, 28, 3, 5),
	spritesheets.tiles.new(10, 28, 3, 5)
]

const pillSprites = {
	red: [spritesheets.tiles.new(1, 1), spritesheets.tiles.new(1, 2), spritesheets.tiles.new(1, 3), spritesheets.tiles.new(1, 4), spritesheets.tiles.new(1, 5), spritesheets.tiles.new(1, 6)],
	yellow: [spritesheets.tiles.new(2, 1), spritesheets.tiles.new(2, 2), spritesheets.tiles.new(2, 3), spritesheets.tiles.new(2, 4), spritesheets.tiles.new(2, 5), spritesheets.tiles.new(2, 6)],
	blue: [spritesheets.tiles.new(3, 1), spritesheets.tiles.new(3, 2), spritesheets.tiles.new(3, 3), spritesheets.tiles.new(3, 4), spritesheets.tiles.new(3, 5), spritesheets.tiles.new(3, 6)],
}

const numberSprites = {
	"0": spritesheets.backgrounds.new(21, 31),
	"1": spritesheets.backgrounds.new(22, 31),
	"2": spritesheets.backgrounds.new(23, 31),
	"3": spritesheets.backgrounds.new(24, 31),
	"4": spritesheets.backgrounds.new(25, 31),
	"5": spritesheets.backgrounds.new(26, 31),
	"6": spritesheets.backgrounds.new(27, 31),
	"7": spritesheets.backgrounds.new(28, 31),
	"8": spritesheets.backgrounds.new(29, 31),
	"9": spritesheets.backgrounds.new(30, 31)
}

function getPillSprite(tile) {
	const sprite = pillSprites[tile.color];
	if (tile.pair == null) return sprite[4];
	if (tile.x < tile.pair.x) return sprite[2];
	if (tile.x > tile.pair.x) return sprite[3];
	if (tile.y < tile.pair.y) return sprite[1];
	return sprite[0];
}

// It's more efficient to snap specific sprites only
// so we don't need to calculate this on every single tile
function snap(x, size) {
	return Math.round(x / size) * size;
}

// h = height, t = time/width, x = current time
function getParabolaHeight(t, h, x) {
	return -4 * h * x / (t * t) * (x - t)
}

export class Game {
	constructor(randomPill = new PseudoRandom(), randomGrid = new PseudoRandom()) {
		this.grid = new Grid(randomPill, randomGrid);
		this.nextGridUpdate = 0;
		this.nextFallUpdate = 0;
		this.nextFastFallUpdate = 0;
		this.nextSpriteSwapUpdate = 0;
		this.nextDancingSpriteSwapUpdate = 0;
		this.nextCrashoutSpriteSwapUpdate = 0;
		this.nextPillThrowSpriteSwapUpdate = 0;
		this.fastFall = false;
		this.spriteSwap = 0;
		this.dancingSpriteSwap = 0;
		this.dancingSpriteTheta = 0;
		this.crashoutSpriteSwap = 4;
		this.pillThrowSpriteSwap = 0;
	}
	
	init() {
		this.grid.pill.random.clear();
		this.grid.pill.next = [this.grid.pill.getRandomColor(), this.grid.pill.getRandomColor()];
		this.grid.state.playback = PlaybackState.START;
		this.grid.state.value = 0;
		this.grid.state.level = 0;
		setTimeout(() => this.grid.state.playback = PlaybackState.PLAYING, 1000);
		this.grid.resetGrid();
	}

	drawGrid(offset) {
		for (let i = 0; i < Grid.ROWS; ++i) {
			for (let j = 0; j < Grid.COLS; ++j) {
				if (this.grid.garbage[i][j]) {
					pillSprites[this.grid.garbage[i][j]][5](j + offset, 24 - i);
					continue;
				}
	
				if (this.grid.value[i][j] == null) {
					ctx.fillStyle = "black";
					ctx.fillRect((j + offset) * screen.PIXEL_SIZE, (24 - i) * screen.PIXEL_SIZE, screen.PIXEL_SIZE, screen.PIXEL_SIZE)
					continue;
				} else if (this.grid.value[i][j].germ) {
					germSprites[this.grid.value[i][j].color][this.spriteSwap](j + offset, 24 - i);
				} else {
					getPillSprite(this.grid.value[i][j])(j + offset, 24 - i);
				}
			}
		}
	}

	drawDancingGerms() {
		// Draw dancing germs
		/* Logic of rendering dancing germ sprites:
			if virus exists:
				draw dancing virus:
					if virus is crashing out:
						use alternating crashout sprite
					else:
						use alternating dancing sprite
					set x to the x center of the magnifying glass + the x component of the rotating position snapped to the pixel
					set y to the y center of the magnifying glass + (the y component of the rotating position + the current crashout jump height position) snapped to the pixel
		*/
		const dancingSprite = this.dancingSpriteSwap == 3 ? 1 : this.dancingSpriteSwap;
		if (this.grid.state.viruses.red > 0) dancingGermSprites.red[this.grid.state.crashout.red ? this.crashoutSpriteSwap : dancingSprite](4 + snap(Math.cos(this.dancingSpriteTheta) * 2, screen.INVERSE_PIXEL_SIZE), 18.5 - snap(Math.sin(this.dancingSpriteTheta) * 2.5 + getParabolaHeight(1, 2, this.grid.state.crashoutTimer.red), screen.INVERSE_PIXEL_SIZE));
		if (this.grid.state.viruses.yellow > 0) dancingGermSprites.yellow[this.grid.state.crashout.yellow ? this.crashoutSpriteSwap : dancingSprite](4 + snap(Math.cos(this.dancingSpriteTheta + Math.PI * 2 / 3) * 2, screen.INVERSE_PIXEL_SIZE), 18.5 - snap(Math.sin(this.dancingSpriteTheta + Math.PI * 2 / 3) * 2.5 + getParabolaHeight(1, 2, this.grid.state.crashoutTimer.yellow), screen.INVERSE_PIXEL_SIZE));
		if (this.grid.state.viruses.blue > 0) dancingGermSprites.blue[this.grid.state.crashout.blue ? this.crashoutSpriteSwap : dancingSprite](4 + snap(Math.cos(this.dancingSpriteTheta - Math.PI * 2 / 3) * 2, screen.INVERSE_PIXEL_SIZE), 18.5 - snap(Math.sin(this.dancingSpriteTheta - Math.PI * 2 / 3) * 2.5 + getParabolaHeight(1, 2, this.grid.state.crashoutTimer.blue), screen.INVERSE_PIXEL_SIZE));
	}

	drawMario() {
		if (this.grid.pill.throwAnimation == 0 || this.grid.state.playback != PlaybackState.PLAYING) marioSprites[0](24, 8.5);
		else if (this.grid.pill.throwAnimation > 0.8) marioSprites[1](23, 8.5);
		else marioSprites[2](23, 8.5);
	}

	drawPill(offset, x = 23.75, y = 7.75) {
		if (this.grid.isFullyStatic && !this.grid.state.playback != PlaybackState.PLAYING) { // Don't render pill during cascading animation
			getPillSprite(this.grid.pill.value[0])(this.grid.pill.value[0].x + offset, 24 - this.grid.pill.value[0].y);
			getPillSprite(this.grid.pill.value[1])(this.grid.pill.value[1].x + offset, 24 - this.grid.pill.value[1].y);
		}

		if (this.grid.state.playback == PlaybackState.START || !this.grid.isFullyStatic) {
			pillSprites[this.grid.pill.value[0].color][2](x, y);
			pillSprites[this.grid.pill.value[1].color][3](x + 1, y);
		} else {
			pillSprites[this.grid.pill.next[0]][2](x, y);
			pillSprites[this.grid.pill.next[1]][3](x + 1, y);
		}
	}

	drawAnimatedPill() {
		switch (this.pillThrowSpriteSwap) {
			case 0:
				pillSprites[this.grid.pill.value[0].color][2](15 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 9 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				pillSprites[this.grid.pill.value[1].color][3](16 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 9 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				break;
			case 1:
				pillSprites[this.grid.pill.value[0].color][0](15.5 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 8 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				pillSprites[this.grid.pill.value[1].color][1](15.5 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 9 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				break;
			case 2:
				pillSprites[this.grid.pill.value[1].color][2](15 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 9 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				pillSprites[this.grid.pill.value[0].color][3](16 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 9 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				break;
			case 3:
				pillSprites[this.grid.pill.value[1].color][0](15.5 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 8 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				pillSprites[this.grid.pill.value[0].color][1](15.5 + snap(this.grid.pill.throwAnimation * 9.375, screen.INVERSE_PIXEL_SIZE), 9 - snap(getParabolaHeight(1, 5, this.grid.pill.throwAnimation), screen.INVERSE_PIXEL_SIZE));
				break;
		}
	}

	static drawNumber(x, y, message) {
		for (let i = 0; i < message.length; ++i) {
			if (numberSprites[message[i]] == null) continue;
			numberSprites[message[i]](x + i, y);
		}
	}

	drawNumbers() {
		Game.drawNumber(2, 7, this.grid.state.top.toString().padStart(7, "0"));
		Game.drawNumber(2, 10, this.grid.state.value.toString().padStart(7, "0"));
		Game.drawNumber(27, 18, this.grid.state.level.toString().padStart(2, "0"));
		Game.drawNumber(27, 24, this.grid.state.virusTotal.toString().padStart(2, "0"));
	}

	drawPauseMenu() {
		switch (this.grid.state.playback) {
			case PlaybackState.STAGE_CLEAR:
				pauseSprites.stageClear(12, 9);
				break;
			case PlaybackState.GAME_OVER:
				pauseSprites.gameOver(12, 9);
				audio.pause();
				break;
		}
	}
	
	update(paused) {
		if (this.grid.state.playback != PlaybackState.PLAYING) {
			this.nextGridUpdate += deltaTime;
			this.nextSpriteSwapUpdate += deltaTime;
			this.nextCrashoutSpriteSwapUpdate += deltaTime;
			this.nextDancingSpriteSwapUpdate += deltaTime;
			this.nextPillThrowSpriteSwapUpdate += deltaTime;
			return;
		}

		if (!paused && this.nextGridUpdate <= lastTime) {
			this.nextGridUpdate = lastTime + MS_PER_GRID_UPDATE;
			// Matches here is important to have chained matches in one clear
			if (!this.grid.checkMatches()) this.grid.update(true);
		}

		if (this.nextSpriteSwapUpdate <= lastTime) {
			this.nextSpriteSwapUpdate = lastTime + MS_PER_SPRITE_SWAP;
			this.spriteSwap = 1 - this.spriteSwap;
		}

		if (this.nextCrashoutSpriteSwapUpdate <= lastTime) {
			this.nextCrashoutSpriteSwapUpdate = lastTime + MS_PER_CRASH_OUT_SPRITE_SWAP;
			this.crashoutSpriteSwap = this.crashoutSpriteSwap == 4 ? 5 : 4;
		}

		if (this.nextDancingSpriteSwapUpdate <= lastTime) {
			this.nextDancingSpriteSwapUpdate = lastTime + MS_PER_DANCING_SPRITE_SWAP;
			this.dancingSpriteSwap = (this.dancingSpriteSwap + 1) % 4;
			if (this.grid.isFullyStatic || this.grid.state.comboTotal <= 0) this.dancingSpriteTheta += 0.03;
		}

		if (this.nextPillThrowSpriteSwapUpdate <= lastTime) {
			this.nextPillThrowSpriteSwapUpdate = lastTime + MS_PER_PILL_THROW_SPRITE_SWAP;
			this.pillThrowSpriteSwap = (this.pillThrowSpriteSwap + 1) % 4;
		}

		const crashoutDelta = deltaTime / MS_PER_CRASH_OUT_ANIMATION
		this.grid.state.crashoutTimer.red = Math.max(0, this.grid.state.crashoutTimer.red - crashoutDelta);
		this.grid.state.crashoutTimer.yellow = Math.max(0, this.grid.state.crashoutTimer.yellow - crashoutDelta);
		this.grid.state.crashoutTimer.blue = Math.max(0, this.grid.state.crashoutTimer.blue - crashoutDelta);
		this.grid.pill.throwAnimation = Math.max(0, this.grid.pill.throwAnimation - deltaTime / MS_PER_PILL_THROW);

		// Make pill fall
		if (this.grid.isFullyStatic && this.grid.pill.throwAnimation == 0 && !paused) {
			if (this.fastFall) {
				if (this.nextFastFallUpdate <= lastTime) {
					this.nextFastFallUpdate = lastTime + MS_PER_FAST_FALL;
					if (this.grid.pill.movePillDown()) this.nextGridUpdate = lastTime + MS_PER_GRID_UPDATE * 2;
				}
			} else {
				if (this.nextFallUpdate <= lastTime) {
					this.nextFallUpdate = lastTime + MS_PER_FALL;
					if (this.grid.pill.movePillDown()) this.nextGridUpdate = lastTime + MS_PER_GRID_UPDATE * 2;
				}
			}
		} else {
			this.nextFastFallUpdate = lastTime + MS_PER_FAST_FALL;
			this.nextFallUpdate = lastTime + MS_PER_FALL;
		}
	}

	hasKeydownBuffer() { return !this.grid.isFullyStatic || this.grid.pill.throwAnimation > 0; }

	keydownFall() {
		this.fastFall = true;
		this.nextFastFallUpdate = lastTime;
	}

	keyupFall() {
		this.fastFall = false;
		this.nextFallUpdate = this.nextFastFallUpdate;
	}
}