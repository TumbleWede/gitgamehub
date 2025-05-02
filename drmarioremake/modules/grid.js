import { Pill } from "./pill.js";
import { GameState } from "./state.js";
import { Tile } from "./tile.js";

const matchingAudio = new Audio("/game/assets/MatchingSound.mp3");

export class Grid {
	static ROWS = 16;
	static COLS = 8;
	
	constructor(randomPill, randomGrid) {
		this.random = randomGrid;
		this.shouldCollectGarbage = false;
		this.isFullyStatic = true;
		this.matchBuffer = false;
		this.value = Array.from({ length: Grid.ROWS }, () => Array(Grid.COLS).fill(null)); // ChatGPT suggestion
		this.stack = Array.from({ length: Grid.ROWS }, () => Array(Grid.COLS).fill(0)); // Tracks this.stack counts to find matches in O(n^2) time
		this.garbage = Array.from({ length: Grid.ROWS }, () => Array(Grid.COLS).fill(null)); // Tracks this.stack counts to find matches in O(n^2) time
		this.pill = new Pill(this, randomPill);
		this.state = new GameState(this);
	}

	shouldBeStatic(tile) {
		return tile.y == 0 || this.value[tile.y - 1][tile.x] != null && this.value[tile.y - 1][tile.x].static;
	}
	
	willMatch(x, y, color) {
		let up = 0, down = 0, left = 0, right = 0;
		for (let i = 1; i < 4; ++i) {
			if (y + i < 20) {
				if (!this.value[y + i][x] || this.value[y + i][x].color != color) break;
				++up;
			}
		}
		if (up >= 3) return true;
	
		for (let i = 1; i < 4 - up; ++i) {
			if (y - i >= 0) {
				if (!this.value[y - i][x] || this.value[y - i][x].color != color) break;
				++down;
				if (up + down >= 3) return true;
			}
		}
	
		for (let i = 1; i < 4; ++i) {
			if (x + i < 20) {
				if (!this.value[y][x + i] || this.value[y][x + i].color != color) break;
				++right;
			}
		}
		if (right >= 3) return true;
	
		for (let i = 1; i < 4 - right; ++i) {
			if (x - i >= 0) {
				if (!this.value[y][x - i] || this.value[y][x - i].color != color) break;
				++left;
				if (right + left >= 3) return true;
			}
		}
	
		return false;
	}

	// Returns whether or not we made any matches
	checkMatches() {
		// Clear lines of 4+
		let matches = false;

		// Check vertical matches
		// Blocks at the top edge can only either be 1 or 0
		for (let j = 0; j < Grid.COLS; ++j)
			this.stack[Grid.ROWS - 1][j] = this.value[Grid.ROWS - 1][j] == null ? 0 : 1;
		for (let i = Grid.ROWS - 2; i >= 0; --i) {
			for (let j = 0; j < Grid.COLS; ++j) {
				// Cell is empty
				if (this.value[i][j] == null) {
					this.stack[i][j] = 0;
					continue;
				}

				// Block is the top of the this.stack
				if (this.value[i + 1][j] == null || this.value[i][j].color != this.value[i + 1][j].color) {
					this.stack[i][j] = 1;
                    continue;
				}

				this.stack[i][j] = this.stack[i + 1][j] + 1;

				// Block is the bottom of a 4+ this.stack
				if (this.stack[i][j] >= 4 && (i == 0 || this.value[i - 1][j] == null || this.value[i - 1][j].color != this.value[i][j].color)) {
					matches = true;

					for (let k = 0; k < this.stack[i][j]; ++k) {
						// Break pairs
						if (this.value[i + k][j].pair) {
							this.value[i + k][j].pair.pair = null;
							this.value[i + k][j].pair = null;
						}

						if (this.value[i + k][j].germ) {
							++this.state.combo[this.value[i + k][j].color];
							this.state.crashout[this.value[i + k][j].color] = true;
							this.state.crashoutTimer[this.value[i + k][j].color] = 1;
						}
						this.garbage[i + k][j] = this.value[i + k][j].color;
						this.value[i + k][j] = null;
					}
				}
			}
		}

		// Make sure the this.value is fully static before doing horizontal clears
		this.isFullyStatic = true;
		for (let i = 0; i < Grid.ROWS; ++i) {
			for (let j = 0; j < Grid.COLS; ++j) {
				if (this.value[i][j] == null) continue;
				if (!this.value[i][j].static) {
					const pair = this.value[i][j].pair;

					if (pair == null) {
						if (this.shouldBeStatic(this.value[i][j])) continue;
						this.isFullyStatic = false;
					} else {
						// Ensure that pairs stay connected
						if (this.shouldBeStatic(this.value[i][j]) || this.shouldBeStatic(pair)) continue;
						this.isFullyStatic = false;
					}
				}
			}
		}
		
		// Check horizontal matches
		// Blocks at the right edge can only either be 1 or 0
		if (this.isFullyStatic) {
			for (let i = 0; i < Grid.ROWS; ++i)
				this.stack[i][Grid.COLS - 1] = this.value[i][Grid.COLS - 1] == null ? 0 : 1;
			for (let j = Grid.COLS - 2; j >= 0; --j) {
				for (let i = 0; i < Grid.ROWS; ++i) {
					// Cell is empty
					if (this.value[i][j] == null) {
						this.stack[i][j] = 0;
						continue;
					}
	
					// Block is the right of the this.stack
					if (this.value[i][j + 1] == null || this.value[i][j].color != this.value[i][j + 1].color || !this.value[i][j].static && this.value[i][j - 1] == null) {
						this.stack[i][j] = 1;
						continue;
					}
	
					this.stack[i][j] = this.stack[i][j + 1] + 1;
	
					// Block is the left of a 4+ this.stack
					if (this.stack[i][j] >= 4 && (j == 0 || this.value[i][j - 1] == null || this.value[i][j - 1].color != this.value[i][j].color)) {
						matches = true;
	
						for (let k = 0; k < this.stack[i][j]; ++k) {
							// Break pairs
							if (this.value[i][j + k].pair) {
								this.value[i][j + k].pair.pair = null;
								this.value[i][j + k].pair = null;
							}
	
							if (this.value[i][j + k].germ) {
								++this.state.combo[this.value[i][j + k].color];
								this.state.crashout[this.value[i][j + k].color] = true;
								this.state.crashoutTimer[this.value[i][j + k].color] = 1;
							}
							this.garbage[i][j + k] = this.value[i][j + k].color;
							this.value[i][j + k] = null;
						}
					}
				}
			}
		}

		if(matches) matchingAudio.play();
		else return false;
		this.shouldCollectGarbage = true;
		this.matchBuffer = true;

		// Initiate falling
		this.isFullyStatic = true;
		for (let i = 0; i < Grid.ROWS; ++i) {
			for (let j = 0; j < Grid.COLS; ++j) {
				if (this.value[i][j] == null) continue;
				if (this.value[i][j].germ) continue;
				this.value[i][j].static = false;
				this.isFullyStatic = false;
			}
		}

		return true;
	}

	update(fall) {
		// Give a moment of silence for the clear animation
		if (this.shouldCollectGarbage) {
			this.shouldCollectGarbage = false;
			this.isFullyStatic = false; // Make sure the game waits for the clear animation
			return;
		}

		// Stop falling animation if all germs are gone
		if (this.state.viruses.red - this.state.combo.red == 0 &&
			this.state.viruses.yellow - this.state.combo.yellow == 0 &&
			this.state.viruses.blue - this.state.combo.blue == 0)
			this.state.addPoints();

		// Make non-static blocks fall
		this.isFullyStatic = true;

		for (let i = 0; i < Grid.ROWS; ++i)
			for (let j = 0; j < Grid.COLS; ++j)
				this.garbage[i][j] = null;

		for (let i = 0; i < Grid.ROWS; ++i) {
			for (let j = 0; j < Grid.COLS; ++j) {
				if (this.value[i][j] == null) continue;
				if (!this.value[i][j].static) {
					const pair = this.value[i][j].pair;

					if (pair == null) {
						if (this.shouldBeStatic(this.value[i][j])) {
							this.value[i][j].static = true;
							continue;
						}

						this.isFullyStatic = false;
						if (!fall) continue;

						this.value[i - 1][j] = this.value[i][j];
						--this.value[i][j].y;
						this.value[i][j] = null;
					} else {
						// Ensure that pairs stay connected
						if (this.shouldBeStatic(this.value[i][j]) || this.shouldBeStatic(pair)) {
							this.value[i][j].static = true;
							this.value[i][j].pair.static = true;
							continue;
						}

						this.isFullyStatic = false;
						if (!fall) continue;

						this.value[i - 1][j] = this.value[i][j];
						--this.value[i][j].y;
						this.value[i][j] = null;
						
						this.value[pair.y - 1][pair.x] = this.value[pair.y][pair.x];
						this.value[pair.y][pair.x] = null;
						--pair.y;
					}
				}
			}
		}
		
		if (this.isFullyStatic && this.matchBuffer) {
			this.matchBuffer = false;
			this.state.addPoints();
			this.pill.throwAnimation = 0.925;
		}
	}

	resetGrid() {
		this.random.clear();
		this.state.viruses.red = 0;
		this.state.viruses.yellow = 0;
		this.state.viruses.blue = 0;

		let maxHeight = 10;
		if (this.state.level >= 15) ++maxHeight;
		if (this.state.level >= 17) ++maxHeight;
		if (this.state.level >= 19) ++maxHeight;

		// Clear the this.value
		for (let i = 0; i < Grid.ROWS; ++i) {
			for (let j = 0; j < Grid.COLS; ++j) {
				this.value[i][j] = null;
			}
		}

		let i = 0;
		let count = 0;
		while (i < 4 + Math.min(this.state.level, 20) * 4) {
			++count;
			const x = Math.floor(this.random.next() * Grid.COLS);
			const y = Math.floor(this.random.next() * maxHeight);
	
			if (this.value[y][x] == null) {
				const color = this.pill.getRandomColor();

				if (this.willMatch(x, y, color)) {
					if (count >= 500) {
						setTimeout(resetGrid(), 10);
						return;
					}
					continue;
				}

				this.value[y][x] = new Tile(x, y, color);
				this.value[y][x].germ = true;
				++i;
				++this.state.viruses[color];
			}
		}
	}
}