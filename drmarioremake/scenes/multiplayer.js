import { PlaybackState } from "../modules/state.js";
import { screen, spritesheets } from "../modules/sprite.js";
import { ctx, deltaTime, lastTime, setScene } from "../script.js";
import { MainMenuScene } from "./mainmenu.js";
import { Game, pauseSprites } from "../modules/game.js";
import { ProxyRandom } from "../modules/rng.js";

const game1 = new Game();
const game2 = new Game(new ProxyRandom(game1.grid.pill.random), new ProxyRandom(game1.grid.random));

const backgroundSprites = {
	easy: spritesheets.backgrounds.new(0, 49, 32, 28),
	medium: spritesheets.backgrounds.new(33, 49, 32, 28),
	hard: spritesheets.backgrounds.new(66, 49, 32, 28)
}

const crownSprites = [
	spritesheets.backgrounds.new(26, 42, 2, 2),
	spritesheets.backgrounds.new(28, 42, 2, 2)
]

const germRefSprites = [
	spritesheets.tiles.new(24, 12, 5, 7),
	spritesheets.tiles.new(29, 12, 5, 7)
]

const enterSprite = spritesheets.backgrounds.new(1.5, 45.5, 5, 1);

const MS_PER_SPRITE_SWAP = 125;

let paused = false;
let scoreDebounce = true;
let newGameDebounce = true;
let score1 = 0, score2 = 0;
let nextSpriteSwapUpdate = 0;
let spriteSwap = 0;

export class MultiplayerScene {
	static init() {
		game1.init();
		game2.init();
		game1.grid.state.addPoints();
		game2.grid.state.addPoints();
		game1.grid.pill.resetPill(true);
		game2.grid.pill.resetPill(true);
		paused = false;
		score1 = 0;
		score2 = 0;
	}
	
	static update() {
		paused = game1.grid.state.playback != PlaybackState.PLAYING || game2.grid.state.playback != PlaybackState.PLAYING;
		
		if (nextSpriteSwapUpdate <= lastTime) {
			nextSpriteSwapUpdate = lastTime + MS_PER_SPRITE_SWAP;
			spriteSwap = 1 - spriteSwap;
		}

		// Determine who got a point
		if (paused) {
			if (scoreDebounce) {
				if (game1.grid.state.playback == PlaybackState.GAME_OVER || game2.grid.state.playback == PlaybackState.STAGE_CLEAR) {
					++score2;
					scoreDebounce = false;
				}
				else if (game2.grid.state.playback == PlaybackState.GAME_OVER || game1.grid.state.playback == PlaybackState.STAGE_CLEAR) {
					++score1;
					scoreDebounce = false;
				}
			}
		} else {
			scoreDebounce = true;
			newGameDebounce = false;
		}
		
		game1.update(paused);
		game2.update(paused);

		// Clear canvas
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		backgroundSprites.medium(0, 0);
		ctx.fillRect(screen.PIXEL_SIZE * 4, screen.PIXEL_SIZE * 9, screen.PIXEL_SIZE * 8, screen.PIXEL_SIZE * 16);
		ctx.fillRect(screen.PIXEL_SIZE * 20, screen.PIXEL_SIZE * 9, screen.PIXEL_SIZE * 8, screen.PIXEL_SIZE * 16);
		
		// Draw grid
		if (score1 >= 3 || score2 >= 3) {
			pauseSprites.gameOver(4, 9);
			pauseSprites.gameOver(20, 9);
		} else {
			// Draw grid tiles
			if (game1.grid.state.playback == PlaybackState.STAGE_CLEAR) pauseSprites.stageClear(4, 9);
			else game1.drawGrid(4);

			// Draw game over
			if (game1.grid.state.playback == PlaybackState.GAME_OVER) {
				ctx.fillRect(4 * screen.PIXEL_SIZE, 17 * screen.PIXEL_SIZE, 8 * screen.PIXEL_SIZE, 8 * screen.PIXEL_SIZE);
				germRefSprites[spriteSwap](5.5, 18);
			}
	
			// Draw stage clear
			if (game2.grid.state.playback == PlaybackState.STAGE_CLEAR) pauseSprites.stageClear(20, 9);
			else game2.drawGrid(20);
			if (game2.grid.state.playback == PlaybackState.GAME_OVER) {
				ctx.fillRect(20 * screen.PIXEL_SIZE, 17 * screen.PIXEL_SIZE, 8 * screen.PIXEL_SIZE, 8 * screen.PIXEL_SIZE);
				germRefSprites[spriteSwap](21.5, 18);
			}

			// Draw pills
			game1.drawPill(4, 7, 5.5);
			game2.drawPill(20, 23, 5.5);
		}

		// Draw crown tiles
		for (let i = 0; i < score1; ++i) crownSprites[spriteSwap](14, 15 - i * 2);
		for (let i = 0; i < score2; ++i) crownSprites[spriteSwap](16, 15 - i * 2);

		// Draw virus stats
		Game.drawNumber(13.75, 23, game1.grid.state.virusTotal.toString().padStart(2, "0"));
		Game.drawNumber(16.375, 23, game2.grid.state.virusTotal.toString().padStart(2, "0"));
		if (game1.grid.state.playback != PlaybackState.START && paused && spriteSwap == 0) enterSprite(13.5, 25.5);
	}

	static keydown = e => {
		if (newGameDebounce) return;
		let ignore1 = false, ignore2 = false;
		if (game1.grid.state.playback != PlaybackState.PLAYING) {
			if (e.code == "Enter" && paused) {
				if (score1 == 3 || score2 == 3) {
					setScene(MainMenuScene);
					return;
				}

				newGameDebounce = true;
				game1.init();
				game2.init();
				game1.grid.state.addPoints();
				game2.grid.state.addPoints();
				game1.grid.pill.resetPill(true);
				game2.grid.pill.resetPill(true);
				return;
			}
			ignore1 = true;
		}

		if (game2.grid.state.playback != PlaybackState.PLAYING) {
			if (e.code == "Enter" && paused) {
				if (score1 == 3 || score2 == 3) {
					setScene(MainMenuScene);
					return;
				}

				newGameDebounce = true;
				game1.init();
				game2.init();
				game1.grid.state.addPoints();
				game2.grid.state.addPoints();
				game1.grid.pill.resetPill(true);
				game2.grid.pill.resetPill(true);
				return;
			}
			ignore2 = true;
		}
	
		if (paused) return;
		if (game1.hasKeydownBuffer()) ignore1 = true;
		if (game2.hasKeydownBuffer()) ignore2 = true;
		
		switch (e.code) {
			case "ArrowLeft":
				if (ignore2) break;
				game2.grid.pill.movePillSide(-1);
				break;
			case "KeyA":
				if (ignore1) break;
				game1.grid.pill.movePillSide(-1);
				break;
			case "ArrowRight":
				if (ignore2) break;
				game2.grid.pill.movePillSide(1);
				break;
			case "KeyD":
				if (ignore1) break;
				game1.grid.pill.movePillSide(1);
				break;
			case "ArrowUp":
				if (e.repeat || ignore2) break;
				game2.grid.pill.rotatePillCW();
				break;
			case "KeyW":
				if (e.repeat || ignore1) break;
				game1.grid.pill.rotatePillCW();
				break;
			case "ArrowDown":
				if (e.repeat || ignore2) break;
				game2.keydownFall();
				break;
			case "KeyS":
				if (e.repeat || ignore1) break;
				game1.keydownFall();
				break;
			default: break;
		}
	}
	
	static keyup = e => {
		switch (e.code) {
			case "ArrowDown":
				game2.keyupFall();
				break;
			case "KeyS":
				game1.keyupFall();
				break;
			default: break;
		}
	}
}