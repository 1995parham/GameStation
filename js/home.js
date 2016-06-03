window.onload = initiation;

function Game(name, onlines, imgPath, xmlPath, text, active) {
    this.name = name;
    this.onlines = onlines;
    this.imgPath = imgPath;
    this.xmlPath = xmlPath;
    this.text = text;
    this.active = active;

    this.xml = null;
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
        par.innerHTML = this.text;

        top.appendChild(inner);
        top.appendChild(par);

        if (this.active)
            top.onmousedown = this._onBlockClick();

        return top;
    },

    highlightGameBlock: function () {
        var top = document.getElementById(this.name + "-block");
        top.style.background = this._maxOnlinesBackground;
        top.style.borderWidth = this._maxOnlinesBorderWidth;
        top.style.borderColor = this._maxOnlinesBorderColor;
        top.style.borderStyle = this._maxOnlinesBorderStyle;
    },

    getGameListItem: function () {
        var item = document.createElement("li");
        item.innerHTML = this.name;

        item.onmouseover = this._onItemMouseOver();
        item.onmouseout = this._onItemMouseOut();
        item.style.backgroundColor = this._itemColor;

        return item;
    },

    toString: function () {
        return this.name + " Game with " + this.onlines + " online players";
    },

    _onBlockClick: function () {
        var that = this;
        return function () {
            document.getElementById("pwd").innerHTML = that.name;

            if (that.xml == null) {
                var request = new XMLHttpRequest();
                request.open("GET", that.xmlPath, true);
                request.send();

                request.onreadystatechange = function () {
                    if (request.readyState == 4 && request.status == 200) {
                        var xml = request.responseXML;
                        that.xml = xml;
                        window[that.name + "LoadXML"](xml);
                    }
                };
            } else {
                window[that.name + "LoadXML"](that.xml);
            }
        };
    },

    _onItemMouseOver: function () {
        var that = this;
        return function () {
            this.style.backgroundColor = that._itemColorHover;
        };
    },

    _onItemMouseOut: function () {
        var that = this;
        return function () {
            this.style.backgroundColor = that._itemColor;
        };
    },

    _itemColor: null,
    _itemColorHover: null,

    _maxOnlinesBackground: null,
    _maxOnlinesBorderWidth: null,
    _maxOnlinesBorderColor: null,
    _maxOnlinesBorderStyle: null
};


function initiation() {
    var xml;

    document.getElementById("home-icon").onclick = function () {
        document.getElementById("pwd").innerHTML = "home";
        homeLoadXML(xml);
    };

    var request = new XMLHttpRequest();
    request.open("GET", "http://ie.ce-it.ir/hw3/xml/home.xml", true);
    request.send();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            xml = request.responseXML;
            homeLoadXML(xml)
        }
    };
}

function homeLoadXML(xml) {
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

    /* initiate games static fields */
    Game.prototype._itemColorHover =
        xml.getElementsByTagName("gameicon")[0].firstElementChild.getAttribute("hover");
    Game.prototype._itemColor =
        xml.getElementsByTagName("gameicon")[0].firstElementChild.getAttribute("color");
    Game.prototype._maxOnlinesBackground =
        xml.getElementsByTagName("games")[0].getAttribute("max-onlines-background");
    Game.prototype._maxOnlinesBorderWidth =
        xml.getElementsByTagName("games")[0].getAttribute("max-onlines-border-width");
    Game.prototype._maxOnlinesBorderColor =
        xml.getElementsByTagName("games")[0].getAttribute("max-onlines-border-color");
    Game.prototype._maxOnlinesBorderStyle =
        xml.getElementsByTagName("games")[0].getAttribute("max-onlines-border-style");

    var games = [];

    document.getElementById("main-container").innerHTML = "";

    var gamesElements = xml.getElementsByTagName("games")[0].getElementsByTagName("game");
    for (var i = 0; i < gamesElements.length; i++) {
        var active = gamesElements[i].getAttribute("active") == "true";

        var name = gamesElements[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
        var onlines = gamesElements[i].getElementsByTagName("onlines")[0].childNodes[0].nodeValue;
        var xmlPath = "";
        if (active)
            xmlPath = gamesElements[i].getElementsByTagName("url")[0].childNodes[0].nodeValue;
        var imgPath = gamesElements[i].getElementsByTagName("image")[0].childNodes[0].nodeValue;
        var text = gamesElements[i].getElementsByTagName("text")[0].childNodes[0].nodeValue;

        var g = new Game(name, onlines, imgPath, xmlPath, text, active);

        document.getElementById("main-container").appendChild(g.getGameBlock());
        if (g.active)
            document.getElementById("games").appendChild(g.getGameListItem());

        games.push(g);
    }

    var maxValue = -1;
    var maxIndex = -1;
    games.forEach(function (g, i) {
        if (g.onlines > maxValue) {
            maxValue = g.onlines;
            maxIndex = i;
        }
    });
    games[maxIndex].highlightGameBlock();
}
