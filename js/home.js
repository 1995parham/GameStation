window.onload = onHomeLoad;


function Game(name, onlines, imgPath) {
    this.name = name;
    this.onlines = onlines;
    this.imgPath = imgPath;
}

Game.prototype = {
    constructor: Game,

    getGameBlock: function () {
        var top = document.createElement("div");
        top.className = "game-block";
        top.id = this.name + "-block";
        top.setAttribute("data-onlines", this.onlines);

        var inner = document.createElement("div");
        inner.className = "game-image-container";

        var image = document.createElement("img");
        image.setAttribute("src", this.imgPath);
        image.setAttribute("alt", "");

        inner.appendChild(image);

        var par = document.createElement("p");
        par.innerHTML = "Play " + this.name + "!";

        top.appendChild(inner);
        top.appendChild(par);
    }

};


function onHomeLoad() {
    var request = new XMLHttpRequest();
    request.open("GET", "http://ie.ce-it.ir/hw3/xml/home.xml", true);
    request.send();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var xml = request.responseXML;

            document.getElementsByTagName("header")[0].style.backgroundColor =
                xml.getElementsByTagName("background")[0].childNodes[0].nodeValue;

            document.getElementById("pwd").style.color =
                xml.getElementsByTagName("pwd")[0].childNodes[0].nodeValue;

            document.getElementById("games").children[0].style.backgroundColor =
                xml.getElementsByTagName("gameicon")[0].getAttribute("color");
            document.getElementById("games").children[0].onmouseover = function () {
                this.style.backgroundColor =
                    xml.getElementsByTagName("gameicon")[0].getAttribute("hover");
            };
            document.getElementById("games").children[0].onmouseout = function () {
                this.style.backgroundColor =
                    xml.getElementsByTagName("gameicon")[0].getAttribute("color");
            };

            var mouseOverOnlineGame = function () {
                this.style.backgroundColor =
                    xml.getElementsByTagName("gameicon")[0].firstElementChild.getAttribute("hover");
            };

            var mouseOutOnlineGame = function () {
                this.style.backgroundColor =
                    xml.getElementsByTagName("gameicon")[0].firstElementChild.getAttribute("color");
            };


            var maxOnlinesBackground = xml.getElementsByTagName("games")[0].getAttribute("max-onlines-background");
            var maxOnlinesBorderWitdth = xml.getElementsByTagName("games")[0].getAttribute("max-onlines-border-width")


        }
    };
}
