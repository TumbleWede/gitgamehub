const home = document.createElement("img");
home.src = "https://tumblewede.github.io/assets/favicon.png";
home.removeAttribute("style");
home.style = "width: 60px; display: block; margin: 8px";
home.onclick = () => {window.location.replace("https://tumblewede.github.io")}
document.body.appendChild(home);