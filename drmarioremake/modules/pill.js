import { Grid } from "./grid.js";
import { PseudoRandom } from "./rng.js";
import { GameState, PlaybackState } from "./state.js";
import { Tile } from "./tile.js";

const COLORS = ["red", "yellow", "blue"];
const middle = 4;

const gameOverAudio = new Audio("/game/assets/GameOver.mp3");

export class Pill {
	constructor(grid, rng) {
		this.random = rng;
		this.grid = grid;
		this.value = [new Tile(middle - 1, Grid.ROWS - 1, this.getRandomColor()), new Tile(middle, Grid.ROWS - 1, this.getRandomColor())];
		this.value[0].pair = this.value[1];
		this.value[1].pair = this.value[0];
		this.next = [this.getRandomColor(), this.getRandomColor()];
		this.rotation = 0;
		this.throwAnimation = 0.925;
	}

	isEmpty(x, y) {
		return y >= Grid.ROWS || this.grid.value[y][x] == null || this.grid.value[y][x] == this.value[0] || this.grid.value[y][x] == this.value[1];
	}
	
	isValid() {
		return this.isEmpty(this.value[0].x, this.value[0].y) && this.isEmpty(this.value[1].x, this.value[1].y)
			&& this.value[0].x >= 0 && this.value[0].x < Grid.COLS && this.value[0].y >= 0 && this.value[0].y < Grid.ROWS
			&& this.value[1].x >= 0 && this.value[1].x < Grid.COLS && this.value[1].y >= 0 && this.value[1].y < Grid.ROWS;
	}
	
	trySnaking() {
		const initial0 = [this.value[0].x, this.value[0].y];
		const initial1 = [this.value[1].x, this.value[1].y];
	
		this.updatePillPosition(initial0[0] + 1, initial0[1], initial1[0] + 1, initial1[1]);
		if (this.isValid()) return true;
	
		this.updatePillPosition(initial0[0] - 1, initial0[1], initial1[0] - 1, initial1[1]);
		if (this.isValid()) return true;
	
		this.updatePillPosition(initial0[0], initial0[1], initial1[0], initial1[1]);
		return false;
	}

	getRandomColor() {
		return COLORS[Math.floor(this.random.next() * 3)];
	}

	updatePillPosition(x0, y0, x1, y1) {
		this.value[0].x = x0;
		this.value[1].x = x1;
		this.value[0].y = y0;
		this.value[1].y = y1;
	}
	
	// Returns true if the this.value is locked
	movePillDown() {
		if (this.value[0].y > 0 && this.value[1].y > 0 && this.isEmpty(this.value[0].x, this.value[0].y - 1) && this.isEmpty(this.value[1].x, this.value[1].y - 1)) {
			this.updatePillPosition(this.value[0].x, this.value[0].y - 1, this.value[1].x, this.value[1].y - 1);
			return false;
		} else {
			this.resetPill();
			return true;
		}
	}
	
	movePillSide(direction) {
		this.updatePillPosition(this.value[0].x + direction, this.value[0].y, this.value[1].x + direction, this.value[1].y);
		if (!this.isValid()) this.updatePillPosition(this.value[0].x - direction, this.value[0].y, this.value[1].x - direction, this.value[1].y);
	}
	
	rotatePillCW() {
		this.rotation = (this.rotation + 1) % 4;

		switch (this.rotation) {
			case 0:
				this.updatePillPosition(this.value[0].x, this.value[0].y, this.value[0].x + 1, this.value[0].y);
				break;
			case 1:
				this.updatePillPosition(this.value[0].x, this.value[0].y + 1, this.value[0].x, this.value[0].y);
				break;
			case 2:
				this.updatePillPosition(this.value[1].x + 1, this.value[1].y, this.value[1].x, this.value[1].y);
				break;
			case 3:
				this.updatePillPosition(this.value[1].x, this.value[1].y, this.value[1].x, this.value[1].y + 1);
				break;
			default: break;
		}

		if (!this.isValid() && !this.trySnaking()) this.rotatePillCCW();
	}

	rotatePillCCW() {
		this.rotation = (this.rotation + 3) % 4;

		switch (this.rotation) {
			case 0:
				this.updatePillPosition(this.value[1].x, this.value[1].y, this.value[1].x + 1, this.value[1].y);
				break;
			case 1:
				this.updatePillPosition(this.value[1].x, this.value[1].y + 1, this.value[1].x, this.value[1].y);
				break;
			case 2:
				this.updatePillPosition(this.value[0].x + 1, this.value[0].y, this.value[0].x, this.value[0].y);
				break;
			case 3:
				this.updatePillPosition(this.value[0].x, this.value[0].y, this.value[0].x, this.value[0].y + 1);
				break;
			default: break;
		}

		if (!this.isValid() && !this.trySnaking()) this.rotatePillCW();
	}

	resetPill(ignorePlacement) {
		if (this.value[0].value == Tile.null || this.value[1].value == Tile.null) return;
		if (!ignorePlacement) {
			this.grid.value[this.value[0].y][this.value[0].x] = this.value[0];
			this.grid.value[this.value[1].y][this.value[1].x] = this.value[1];
		}
		
		this.value[0] = new Tile(middle - 1, Grid.ROWS - 1, this.next[0]);
		this.value[1] = new Tile(middle, Grid.ROWS - 1, this.next[1]);
		this.value[0].pair = this.value[1];
		this.value[1].pair = this.value[0];
		this.rotation = 0;

		this.next[0] = this.getRandomColor();
		this.next[1] = this.getRandomColor();

		if (!this.grid.checkMatches()) {
			this.throwAnimation = 0.925;
		
			if (!this.isValid()) {
				this.grid.state.playback = PlaybackState.GAME_OVER;
				gameOverAudio.play();
				return;
			}
		}
		

		this.grid.update(false);
	}
}