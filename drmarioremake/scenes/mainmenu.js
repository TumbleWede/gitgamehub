import { spritesheets, screen } from "../modules/sprite.js";
import { ctx, deltaTime, lastTime, setScene } from "../script.js";
import { MultiplayerScene } from "./multiplayer.js";
import { SingleplayerScene } from "./singleplayer.js";

const backgroundSprite = spritesheets.mainmenu.new(0, 0, 32, 28);
const titleSprite = [
	spritesheets.mainmenu.new(0, 33, 24, 5),
	spritesheets.mainmenu.new(0, 38, 24, 5)
];
const heartSprite = spritesheets.mainmenu.new(0, 28, 2, 1);
const marioSprite = [
	spritesheets.mainmenu.new(2, 28, 4, 5),
	spritesheets.mainmenu.new(6, 28, 4, 5)
];
const germSprite = [
	spritesheets.mainmenu.new(10, 29, 3, 3),
	spritesheets.mainmenu.new(13, 29, 3, 3),
	spritesheets.mainmenu.new(16, 29, 3, 3)
];

const MS_PER_TITLE_SPRITE_SWAP = 270;
const MS_PER_SPRITE_SWAP = 200;

const audio = document.getElementById("myAudio");

let nextTitleSpriteSwapUpdate = 0;
let nextSpriteSwapUpdate = 0;

let titleSpriteSwap = 0;
let spriteSwap = 0;
let germSpriteSwap = 0;

let gamemode = 0;

export class MainMenuScene {
	static render() {
		// Clear canvas
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		backgroundSprite(0, 0);
		titleSprite[titleSpriteSwap](4.625, 6.5);
		heartSprite(8, 20 + gamemode);
		marioSprite[spriteSwap](5, 20);
		germSprite[germSpriteSwap == 3 ? 1 : germSpriteSwap](24, 21);
	}
	
	static update() {
		if (nextTitleSpriteSwapUpdate <= lastTime) {
			nextTitleSpriteSwapUpdate = lastTime + MS_PER_TITLE_SPRITE_SWAP;
			titleSpriteSwap = 1 - titleSpriteSwap;
		}

		if (nextSpriteSwapUpdate <= lastTime) {
			nextSpriteSwapUpdate = lastTime + MS_PER_SPRITE_SWAP;
			spriteSwap = 1 - spriteSwap;
			germSpriteSwap = (germSpriteSwap + 1) % 4;
		}

		MainMenuScene.render(ctx);
	}

	static keydown = e => {
		switch (e.code) {
			case "ArrowUp":
			case "ArrowDown":
			case "KeyW":
			case "KeyS":
				gamemode = 2 - gamemode;
				return;
			case "Enter":
				audio.play();
				setScene(gamemode == 0 ? SingleplayerScene : MultiplayerScene);
				return;
			default: return;
		}
	}
	
	static keyup = e => {}
	static init() {}
}