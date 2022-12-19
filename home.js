const home = document.createElement("img");
home.src = "/assets/home.png";
home.removeAttribute("style");
home.style = "width: 60px; position: absolute; display: block; margin: 8px; cursor: pointer; image-rendering: auto;";
home.onclick = () => {window.location.replace("/")}
document.body.appendChild(home);