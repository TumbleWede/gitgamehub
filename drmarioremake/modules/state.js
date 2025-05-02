import { Grid } from "./grid.js";
import { Pill } from "./pill.js";

export const PlaybackState = Object.freeze({
	PLAYING: 0,
	STAGE_CLEAR: 1,
	GAME_OVER: 2,
	START: 3
});

const levelupaudio = new Audio("/game/assets/LevelupSound.mp3");

export class GameState {
	constructor(grid) {
		this.grid = grid;
		this.value = 0;
		this.top = parseInt(localStorage.getItem("TopScore") || 0);
		this.combo = {
			red: 0,
			yellow: 0,
			blue: 0
		}
		this.level = 0;
		this.viruses = {
			red: 0,
			yellow: 0,
			blue: 0
		};
		this.crashout = {
			red: false,
			yellow: false,
			blue: false
		}
		this.crashoutTimer = {
			red: 0,
			yellow: 0,
			blue: 0
		}
		this._playback = PlaybackState.START;
		this.onPlaybackChange = []; // We can append callbacks to this to act as event listeners
	}
	
	
	set playback(state) {
		for (const callback of this.onPlaybackChange)
			callback(this._playback, state);
	    this._playback = state;
	}
	
	get playback() { return this._playback; }
	get comboTotal() { return this.combo.red + this.combo.yellow + this.combo.blue; }
	get virusTotal() { return this.viruses.red + this.viruses.yellow + this.viruses.blue; }

	addPoints() {
		if (this.comboTotal <= 0) return; // Only score points for matching viruses
		this.value += 100 * 2 ** Math.min(this.comboTotal - 1, 5);
		this.viruses.red -= this.combo.red;
		this.viruses.yellow -= this.combo.yellow;
		this.viruses.blue -= this.combo.blue;
		this.top = Math.max(this.value, this.top);
		localStorage.setItem("TopScore", this.top);
		this.combo.red = 0;
		this.combo.yellow = 0;
		this.combo.blue = 0;
		this.crashout.red = false;
		this.crashout.yellow = false;
		this.crashout.blue = false;

		if (this.virusTotal <= 0) {
			++this.level;
    		levelupaudio.play();
			
			this.grid.resetGrid();
			this.playback = PlaybackState.STAGE_CLEAR;
		}
	}
}