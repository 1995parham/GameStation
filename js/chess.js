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

function ChessEngine(info, board, inventory) {
    this.board = board;
    this.info = info;
    this.inventory = inventory;

    board.onChessManEvent("ondragstart", this._onChessManDrag());
    board.onChessManEvent("ondrop", this._onChessManDrop());
    board.onChessManEvent("ondragover", this._onChessManDragOver());
}

ChessEngine.prototype = {
    _onChessManDrag: function () {
        var that = this;
        return function (row, col) {
            return function (event) {
                var chessMan = that.board.getChessMan(new ChessLocation(row, col));
                var moves = chessMan.getMoves(this.board);
                if (that.info.turn != chessMan.color)
                    return false;
                moves.every(function (obj) {
                    var row = obj.row;
                    var col = obj.col;

                    if (obj.status) {
                        that.board.getChessMan(new ChessLocation(row, col)).highlightTarget();
                    } else {
                        that.board.getChessMan(new ChessLocation(row, col)).highlightMove();
                    }
                });
                event.dataTransfer.setData("ChessLocation", JSON.stringify(new ChessLocation(row, col)));
                event.dataTransfer.setData("Moves", JSON.stringify(moves));
                chessMan.highlightSelect();
            };
        };
    },

    _onChessManDrop: function () {
        var that = this;
        return function (row, col) {
            return function (event) {
                event.preventDefault();

                var location = JSON.parse(event.dataTransfer.getData("ChessLocation"));
                var moves = JSON.parse(event.dataTransfer.getData("Moves"));

                var chessMan = that.board.getChessMan(location);
                chessMan.resetStyle();

                if (moves.every(function (obj) {
                        that.board.getChessMan(new ChessLocation(obj.row, obj.col)).resetStyle();
                        return (obj.row != row || obj.col != col);
                    }))
                    return false;


                chessMan.location = new ChessLocation(row, col);
                that.board.removeChessMan(new ChessLocation(location.row, location.col));
                that.board.putChessMan(chessMan);

                that.info.setTurn(chessMan.color == "white" ? "black" : "white");
            };
        };
    },

    _onChessManDragOver: function () {
        return function () {
            return function (event) {
                event.preventDefault();
            };
        };

    }
};

function ChessInventory() {
    this.whiteInventory = [];

    this.whiteInventoryDiv = document.createElement("div");
    this.whiteInventoryDiv.id = "white-chessman-panel";

    this.blackInventory = [];

    this.blackInventoryDiv = document.createElement("div");
    this.blackInventoryDiv.id = "black-chessman-panel";
}

ChessInventory.prototype = {
    getInventoryWhiteBlock: function () {
        return this.whiteInventoryDiv;
    },

    getInventoryBlackBlock: function () {
        return this.blackInventoryDiv;
    },

    putChessMan: function (chessMan) {
        if (chessMan.color == "white") {
            this.whiteInventory.push(chessMan);
            this.whiteInventoryDiv.appendChild(chessMan.getChessManSpan());
        } else {
            this.blackInventory.push(chessMan);
            this.blackInventoryDiv.appendChild(chessMan.getChessManSpan());
        }
    }
};

function ChessBoard(whiteField, blackField) {
    this.whiteField = whiteField;
    this.blackField = blackField;

    this.handler = {};

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
        for (var ev in this.handler)
            this.boardTrs[location.row].childNodes[location.col][ev] = this.handler[ev](location.row, location.col);
    },

    removeChessMan: function (location) {
        var chessMan = new ChessMan(location);
        this.board[location.row][location.col] = chessMan;
        this.boardTrs[location.row].replaceChild(chessMan.getChessManTd(),
            this.boardTrs[location.row].childNodes[location.col]);
    },

    getChessMan: function (location) {
        return this.board[location.row][location.col];
    },

    /*
     this function set return value of fn(row, col) as a event
     handler for all chess cells :)
     */
    onChessManEvent: function (event, fn) {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                this.boardTrs[i].childNodes[j][event] = fn(i, j);
            }
        }
        this.handler[event] = fn;
    }
};

function ChessLocation(row, col) {
    this.row = row;
    this.col = col;
}

ChessLocation.prototype = {};

function ChessMan(location) {
    this.color = "";
    this.td = null;
    this.span = null;
    this.location = location;
}

ChessMan.prototype = {

    getChessManSpan: function () {
        var data = document.createElement("span");
        data.innerHTML = this._chessManUnicode;
        data.style.color = this.color;
        this.span = data;
        return this.span;
    },

    getChessManTd: function () {
        var data = document.createElement("td");
        data.setAttribute("draggable", "true");
        data.innerHTML = this._chessManUnicode;
        data.style.color = this.color;
        if ((this.location.row + this.location.col) % 2 == 0)
            data.style.backgroundColor = this._whiteBackgroundColor;
        else
            data.style.backgroundColor = this._blackBackgroundColor;
        this.td = data;
        return this.td;
    },

    highlightSelect: function () {
        if (this.td != null)
            this.td.style.color = "orange";
    },

    highlightTarget: function () {
        if (this.td != null)
            this.td.style.color = "red";
    },

    highlightMove: function () {
        if (this.td != null)
            this.td.innerHTML = "&#128936;";
    },

    resetStyle: function () {
        if (this.td != null) {
            this.td.style.color = this.color;
            this.td.innerHTML = this._chessManUnicode;
            if ((this.location.row + this.location.col) % 2 == 0)
                this.td.style.backgroundColor = this._whiteBackgroundColor;
            else
                this.td.style.backgroundColor = this._blackBackgroundColor;
        }
    },

    /*
     returns available moves of current ChessMan
     as array of ChessLocation
     this function use current board as 2D array of
     for detecting valid moves :)
     */
    getMoves: function (board) {
        return [];
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

ChessManPawn.prototype.getMoves = function (board) {
    return [
        {
            row: this.location.row + 1,
            col: this.location.col,
            status: false
        }
    ]
};

function ChessManRook(locaton, color) {
    ChessMan.call(this, locaton);
    this.color = color;
}

ChessManRook.prototype = new ChessMan();

ChessManRook.prototype.getMoves = function (board) {
};

function ChessManKnight(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManKnight.prototype = new ChessMan();

function ChessManQueen(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManQueen.prototype = new ChessMan();

function ChessManKing(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManKing.prototype = new ChessMan();

function ChessManBishop(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManBishop.prototype = new ChessMan();

function chessLoadXML(xml) {
    var top = document.createElement("div");
    top.id = "chess";

    var info = new ChessInfo(
        xml.getElementsByTagName("score")[0].getElementsByTagName("white")[0].childNodes[0].nodeValue,
        xml.getElementsByTagName("score")[0].getElementsByTagName("black")[0].childNodes[0].nodeValue,
        xml.getElementsByTagName("chess")[0].getAttribute("turn"));

    ChessMan.prototype._blackBackgroundColor = xml.getElementsByTagName("board")[0].getAttribute("black-cells");
    ChessMan.prototype._whiteBackgroundColor = xml.getElementsByTagName("board")[0].getAttribute("white-cells");

    var board = new ChessBoard(
        xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getAttribute("field"),
        xml.getElementsByTagName("board")[0].getElementsByTagName("black")[0].getAttribute("field")
    );

    var inventory = new ChessInventory();

    top.appendChild(info.getInfoBlock());
    top.appendChild(inventory.getInventoryWhiteBlock());
    top.appendChild(board.getBoardTable());
    top.appendChild(inventory.getInventoryBlackBlock());

    /* update main contents of page */
    document.getElementById("main-container").innerHTML = "";
    document.getElementById("main-container").appendChild(top);

    var row, col, i;

    /* Pawn */
    ChessManPawn.prototype._chessManUnicode =
        xml.getElementsByTagName("chessmans")[0].getElementsByTagName("pawn")[0].getAttribute("unicode");

    var pawnsElements, pawn;
    pawnsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getElementsByTagName("pawn");
    for (i = 0; i < pawnsElements.length; i++) {
        row = parseInt(pawnsElements[i].getAttribute("row"));
        col = parseInt(pawnsElements[i].getAttribute("col"));
        pawn = new ChessManPawn(new ChessLocation(row, col), "white");
        board.putChessMan(pawn);
    }
    for (i = 0; i < 8 - pawnsElements.length; i++) {
        pawn = new ChessManPawn(new ChessLocation(0, 0), "white");
        inventory.putChessMan(pawn);
    }
    pawnsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("black")[0].getElementsByTagName("pawn");
    for (i = 0; i < pawnsElements.length; i++) {
        row = parseInt(pawnsElements[i].getAttribute("row"));
        col = parseInt(pawnsElements[i].getAttribute("col"));
        pawn = new ChessManPawn(new ChessLocation(row, col), "black");
        board.putChessMan(pawn);
    }
    for (i = 0; i < 8 - pawnsElements.length; i++) {
        pawn = new ChessManPawn(new ChessLocation(0, 0), "black");
        inventory.putChessMan(pawn);
    }

    /* Rook */
    ChessManRook.prototype._chessManUnicode =
        xml.getElementsByTagName("chessmans")[0].getElementsByTagName("rook")[0].getAttribute("unicode");

    var rooksElements, rook;
    rooksElements = xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getElementsByTagName("rook");
    for (i = 0; i < rooksElements.length; i++) {
        row = parseInt(rooksElements[i].getAttribute("row"));
        col = parseInt(rooksElements[i].getAttribute("col"));
        rook = new ChessManRook(new ChessLocation(row, col), "white");
        board.putChessMan(rook);
    }
    rooksElements = xml.getElementsByTagName("board")[0].getElementsByTagName("black")[0].getElementsByTagName("rook");
    for (i = 0; i < rooksElements.length; i++) {
        row = parseInt(rooksElements[i].getAttribute("row"));
        col = parseInt(rooksElements[i].getAttribute("col"));
        rook = new ChessManRook(new ChessLocation(row, col), "black");
        board.putChessMan(rook);
    }

    /* Knight */
    ChessManKnight.prototype._chessManUnicode =
        xml.getElementsByTagName("chessmans")[0].getElementsByTagName("knight")[0].getAttribute("unicode");

    var knightsElements, knight;
    knightsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getElementsByTagName("knight");
    for (i = 0; i < knightsElements.length; i++) {
        row = parseInt(knightsElements[i].getAttribute("row"));
        col = parseInt(knightsElements[i].getAttribute("col"));
        knight = new ChessManKnight(new ChessLocation(row, col), "white");
        board.putChessMan(knight);
    }
    knightsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("black")[0].getElementsByTagName("knight");
    for (i = 0; i < knightsElements.length; i++) {
        row = parseInt(knightsElements[i].getAttribute("row"));
        col = parseInt(knightsElements[i].getAttribute("col"));
        knight = new ChessManKnight(new ChessLocation(row, col), "black");
        board.putChessMan(knight);
    }

    /* Queen */
    ChessManQueen.prototype._chessManUnicode =
        xml.getElementsByTagName("chessmans")[0].getElementsByTagName("queen")[0].getAttribute("unicode");

    var queensElements, queen;
    queensElements = xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getElementsByTagName("queen");
    for (i = 0; i < queensElements.length; i++) {
        row = parseInt(queensElements[i].getAttribute("row"));
        col = parseInt(queensElements[i].getAttribute("col"));
        queen = new ChessManQueen(new ChessLocation(row, col), "white");
        board.putChessMan(queen);
    }
    queensElements = xml.getElementsByTagName("board")[0].getElementsByTagName("black")[0].getElementsByTagName("queen");
    for (i = 0; i < queensElements.length; i++) {
        row = parseInt(queensElements[i].getAttribute("row"));
        col = parseInt(queensElements[i].getAttribute("col"));
        queen = new ChessManQueen(new ChessLocation(row, col), "black");
        board.putChessMan(queen);
    }

    /* King */
    ChessManKing.prototype._chessManUnicode =
        xml.getElementsByTagName("chessmans")[0].getElementsByTagName("king")[0].getAttribute("unicode");

    var kingsElements, king;
    kingsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getElementsByTagName("king");
    for (i = 0; i < queensElements.length; i++) {
        row = parseInt(kingsElements[i].getAttribute("row"));
        col = parseInt(kingsElements[i].getAttribute("col"));
        king = new ChessManKing(new ChessLocation(row, col), "white");
        board.putChessMan(king);
    }
    kingsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("black")[0].getElementsByTagName("king");
    for (i = 0; i < kingsElements.length; i++) {
        row = parseInt(kingsElements[i].getAttribute("row"));
        col = parseInt(kingsElements[i].getAttribute("col"));
        king = new ChessManKing(new ChessLocation(row, col), "black");
        board.putChessMan(king);
    }

    /* Bishop */
    ChessManBishop.prototype._chessManUnicode =
        xml.getElementsByTagName("chessmans")[0].getElementsByTagName("bishop")[0].getAttribute("unicode");

    var bishopsElements, bishop;
    bishopsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("white")[0].getElementsByTagName("bishop");
    for (i = 0; i < bishopsElements.length; i++) {
        row = parseInt(bishopsElements[i].getAttribute("row"));
        col = parseInt(bishopsElements[i].getAttribute("col"));
        bishop = new ChessManBishop(new ChessLocation(row, col), "white");
        board.putChessMan(bishop);
    }
    bishopsElements = xml.getElementsByTagName("board")[0].getElementsByTagName("black")[0].getElementsByTagName("bishop");
    for (i = 0; i < bishopsElements.length; i++) {
        row = parseInt(bishopsElements[i].getAttribute("row"));
        col = parseInt(bishopsElements[i].getAttribute("col"));
        bishop = new ChessManBishop(new ChessLocation(row, col), "black");
        board.putChessMan(bishop);
    }

    /* Game Engine :? */
    new ChessEngine(info, board, inventory);
}
