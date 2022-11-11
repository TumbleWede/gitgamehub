const home = document.createElement("img");
home.src = "https://gitgamehub.netlify.app/assets/home.png";
home.removeAttribute("style");
home.style = "width: 60px; display: block; margin: 8px; cursor: pointer; image-rendering: auto;";
home.onclick = () => {window.location.replace("https://gitgamehub.netlify.app")}
document.body.appendChild(home);