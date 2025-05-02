// https://www.spriters-resource.com/nes/drmario/sheet/12248/
// https://www.upscale.media/tools/pixel-art-upscaler

import { screen } from "./modules/sprite.js";
import { MainMenuScene } from "./scenes/mainmenu.js";

const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");

// Update canvas size
canvas.setAttribute("width", screen.WIDTH.toString());
canvas.setAttribute("height", screen.HEIGHT.toString());
updateWindow();
window.onresize = updateWindow;

function updateWindow() {
	if (window.innerWidth / window.innerHeight < canvas.width / canvas.height) {
		canvas.style.width = "100%";
		canvas.style.removeProperty("height");
	} else {
		canvas.style.removeProperty("width");
		canvas.style.height = "100%";
	}
}

async function loadFont() {
	const font = new FontFace("PressStart2P", "url(assets/PressStart2P-Regular.ttf)");
	await font.load();
	document.fonts.add(font);
	ctx.font = screen.PIXEL_SIZE + "px PressStart2P";
	ctx.textBaseline = "top";
}

await loadFont();

export let lastTime = 0;
export let deltaTime = 0; // Interval between frame in millisecondsf
let currentScene = MainMenuScene;
export function setScene(scene) {
	currentScene = scene;
	currentScene.init();
}

document.addEventListener("keydown", e => currentScene.keydown(e));
document.addEventListener("keyup", e => currentScene.keyup(e));

function update(time) {
	deltaTime = time - lastTime;
	lastTime = time;
	currentScene.update();

	// Draw FPS text
	ctx.fillStyle = "white";
	ctx.fillText("FPS:" + Math.floor(1 / (deltaTime * 0.001)).toString(), 0, 0);
	
	requestAnimationFrame(update); // Refresh update function on next frame
}

update(0);