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
    this.boardTrs = [];
    for (var i = 0; i < 8; i++) {
        var row = [];
        var tr = document.createElement("tr");
        this.boardTrs.push(tr);
        for (var j = 0; j < 8; j++) {
            var cell = new ChessMan(new ChessLocation(i, j));
            tr.appendChild(cell.getChessManTd());
            row.push(cell);
        }
        this.board.push(row);
    }
}

ChessBoard.prototype = {
    getBoardTable: function () {
        var top = document.createElement("table");
        for (var i = 0; i < 8; i++) {
            top.appendChild(this.boardTrs[i]);
        }
        return top;
    },

    putChessMan: function (chessMan) {
        var location = chessMan.location;
        this.board[location.row][location.col] = chessMan;
        this.boardTrs[location.row].replaceChild(chessMan.getChessManTd(),
            this.boardTrs[location.row].childNodes[location.col]);
    },

    removeChessMan: function (location) {
        var chessMan = new ChessMan(location);
        this.board[location.row][location.col] = chessMan;
        this.boardTrs[location.row].replaceChild(chessMan.getChessManTd(),
            this.boardTrs[location.row].childNodes[location.col]);
    }
};

function ChessLocation(row, col) {
    this.row = row;
    this.col = col;
}

ChessLocation.prototype = {};

function ChessMan(location) {
    this.color = "";
    this.location = location;
}

ChessMan.prototype = {
    getChessManTd: function () {
        var data = document.createElement("td");
        data.innerHTML = this._chessManUnicode;
        data.style.color = this.color;
        if ((this.location.row + this.location.col) % 2 == 0)
            data.style.backgroundColor = this._whiteBackgroundColor;
        else
            data.style.backgroundColor = this._blackBackgroundColor;
        return data;
    },

    _whiteBackgroundColor: "",
    _blackBackgroundColor: "",
    _chessManUnicode: ""
};

function ChessManPawn(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManPawn.prototype = new ChessMan();

function chessLoadXML(xml) {
    var top = document.createElement("div");
    top.id = "chess";

    var info = new ChessInfo(
        xml.getElementsByTagName("score")[0].getElementsByTagName("white")[0].childNodes[0].nodeValue,
        xml.getElementsByTagName("score")[0].getElementsByTagName("black")[0].childNodes[0].nodeValue,
        xml.getElementsByTagName("chess")[0].getAttribute("turn"));

    ChessMan.prototype._blackBackgroundColor = xml.getElementsByTagName("board")[0].getAttribute("black-cells");
    ChessMan.prototype._whiteBackgroundColor = xml.getElementsByTagName("board")[0].getAttribute("white-cells");

    var board = new ChessBoard();

    top.appendChild(info.getInfoBlock());
    top.appendChild(board.getBoardTable());

    /* update main contents of page */
    document.getElementById("main-container").innerHTML = "";
    document.getElementById("main-container").appendChild(top);

    /* PAWNS */
    ChessManPawn.prototype._chessManUnicode =
        xml.getElementsByTagName("chessmans")[0].getElementsByTagName("pawn")[0].getAttribute("unicode");

    var pawnElements = xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getElementsByTagName("pawn");
    for (var i = 0; i < pawnElements.length; i++) {
        var row = parseInt(pawnElements[i].getAttribute("row"));
        var col = parseInt(pawnElements[i].getAttribute("col"));
        var pawn = new ChessManPawn(new ChessLocation(row, col), "white");
        board.putChessMan(pawn);
    }

}
