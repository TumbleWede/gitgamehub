import { PlaybackState } from "../modules/state.js";
import { screen, spritesheets } from "../modules/sprite.js";
import { ctx, deltaTime, lastTime, setScene } from "../script.js";
import { MainMenuScene } from "./mainmenu.js";
import { Game } from "../modules/game.js";

const game = new Game();

const backgroundSprites = {
	easy: spritesheets.backgrounds.new(0, 1, 32, 28),
	medium: spritesheets.backgrounds.new(33, 1, 32, 28),
	hard: spritesheets.backgrounds.new(66, 1, 32, 28)
}

export class SingleplayerScene {
	static init() {
		game.init();
	}
	
	static update() {
		game.update();
		// Clear canvas
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		backgroundSprites.medium(0, 0);
		ctx.fillRect(screen.PIXEL_SIZE * 12, screen.PIXEL_SIZE * 9, screen.PIXEL_SIZE * 8, screen.PIXEL_SIZE * 16);
	
		// Draw grid tiles
		if (game.grid.state.playback == PlaybackState.START || game.grid.state.playback == PlaybackState.PLAYING)
			game.drawGrid(12);
		
		game.drawDancingGerms();
		game.drawMario();

		if (game.grid.pill.throwAnimation == 0 || game.grid.state.playback != PlaybackState.PLAYING) game.drawPill(12);
		else game.drawAnimatedPill();
		game.drawNumbers();
		if (game.grid.state.playback == PlaybackState.PLAYING) return;
		game.drawPauseMenu();
	}

	static keydown = e => {
		if (game.grid.state.playback != PlaybackState.PLAYING) {
			if (e.code != "Enter") return;
			if (game.grid.state.playback == PlaybackState.STAGE_CLEAR)
				game.grid.state.playback = PlaybackState.PLAYING;
			else if (game.grid.state.playback == PlaybackState.GAME_OVER)
				setScene(MainMenuScene);
			return;
		}
	
		if (game.hasKeydownBuffer()) return;
		
		switch (e.code) {
			case "ArrowLeft":
			case "KeyA":
				game.grid.pill.movePillSide(-1);
				break;
			case "ArrowRight":
			case "KeyD":
				game.grid.pill.movePillSide(1);
				break;
			case "ArrowUp":
			case "KeyE":
			case "KeyX":
				if (e.repeat) break;
				game.grid.pill.rotatePillCW();
				break;
			case "KeyQ":
			case "KeyZ":
				if (e.repeat) break;
				game.grid.pill.rotatePillCCW();
				break;
			case "ArrowDown":
			case "KeyS":
				if (e.repeat) break;
				game.keydownFall();
				break;
			default: break;
		}
	}
	
	static keyup = e => {
		switch (e.code) {
			case "ArrowDown":
			case "KeyS":
				game.keyupFall();
				break;
			default: break;
		}
	}
}