function ChessInfo(white, black, turn) {
    this.white = white;
    this.black = black;
    this.turn = turn;

    this.blackSpan = document.createElement("span");
    this.blackSpan.id = "black-score";
    this.blackSpan.innerHTML = black;
    this.whiteSpan = document.createElement("span");
    this.whiteSpan.id = "white-score";
    this.whiteSpan.innerHTML = white;
    this.turnDiv = document.createElement("div");
    this.turnDiv.id = "turn";
    this.turnDiv.className = turn;
    this.turnDiv.innerHTML = turn;
}

ChessInfo.prototype = {
    getInfoBlock: function () {
        var top = document.createElement("div");
        top.id = "chess-info";

        var whiteDiv = document.createElement("div");
        whiteDiv.className = "score";
        whiteDiv.appendChild(document.createTextNode("White score: "));
        whiteDiv.appendChild(this.whiteSpan);

        var blackDiv = document.createElement("div");
        blackDiv.className = "score";
        blackDiv.appendChild(document.createTextNode("Black score: "));
        blackDiv.appendChild(this.blackSpan);

        top.appendChild(whiteDiv);
        top.appendChild(this.turnDiv);
        top.appendChild(blackDiv);

        return top;
    },

    setWhiteScore: function (white) {
        this.white = white;
        this.whiteSpan.innerHTML = white;
    },

    setBlackScore: function (black) {
        this.black = black;
        this.blackSpan.innerHTML = black;
    },

    setTurn: function (turn) {
        this.turn = turn;
        this.turnDiv.innerHTML = turn;
        this.turnDiv.className = turn;
    }
};

function ChessBoard() {
    this.board = [];
    for (var i = 0; i < 8; i++) {
        var row = [];
        for (var j = 0; j < 8; j++) {
            var cell = document.createElement("td");
            row.push(cell);
        }
        this.board.push(row);
    }
}

ChessBoard.prototype = {
    getBoardTable: function () {
        var top = document.createElement("table");
        for (var i = 0; i < 8; i++) {
            var row = document.createElement("tr");
            for (var j = 0; j < 8; j++) {
                row.appendChild(this.board[i][j]);
            }
            top.appendChild(row);
        }
        return top;
    }
};

function ChessMan(img) {
    this.img = img;
}

ChessMan.prototype = {
    getChessManImage: function () {
        var image = document.createElement("img");
        image.setAttribute("src", this.img);
        image.setAttribute("alt", "");
    }
};

function chessLoadXML(xml) {
    var top = document.createElement("div");
    top.id = "chess";

    var info = new ChessInfo("0", "0", "black");
    var board = new ChessBoard();

    top.appendChild(info.getInfoBlock());
    top.appendChild(board.getBoardTable());

    /* update main contents of page */
    document.getElementById("main-container").innerHTML = "";
    document.getElementById("main-container").appendChild(top);

}
