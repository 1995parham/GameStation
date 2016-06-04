function ChessInfo(white, black, turn) {
    this.white = parseInt(white);
    this.black = parseInt(black);
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
    constructor: ChessInfo,

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
        this.white += white;
        this.whiteSpan.innerHTML = this.white;
    },

    setBlackScore: function (black) {
        this.black += black;
        this.blackSpan.innerHTML = this.black;
    },

    setTurn: function (turn) {
        this.turn = turn;
        this.turnDiv.innerHTML = turn;
        this.turnDiv.className = turn;
    },

    gameEnded: function () {
        this.turn = "";
        this.turnDiv.innerHTML = "game over";
        this.turnDiv.className = "";
        this.turnDiv.style.backgroundColor = "#FF6600";
        this.turnDiv.style.color = "white";
    }
};

function ChessNotification() {
    this.message = null;
}

ChessNotification.prototype = {
    constructor: ChessNotification,

    getNotificationBlock: function () {
        var top = document.createElement("div");
        this.message = document.createElement("emp");
        top.appendChild(this.message);
        return top;
    },

    setNotificationMessage: function (message) {
        this.message.innerHTML = message;
    }
};

function ChessEngine(info, board, inventory, notification) {
    this.board = board;
    this.info = info;
    this.inventory = inventory;
    this.notification = notification;

    board.onChessManEvent("ondragstart", this._onChessManDrag());
    board.onChessManEvent("ondrop", this._onChessManDrop());
    board.onChessManEvent("ondragover", this._onChessManDragOver());
    var tmp = this._onChessManClick();
    board.onChessManEvent("onclick", tmp);
    inventory.onChessManEvent("onclick", tmp);
}

ChessEngine.prototype = {
    constructor: ChessEngine,

    chessManDie: function (chessMan) {
        if (chessMan._chessManUnicode == "")
            return;
        this.inventory.putChessMan(chessMan);
        var score = 0;
        if (chessMan instanceof ChessManPawn)
            score = 1;
        else if (chessMan instanceof ChessManKnight || chessMan instanceof ChessManBishop)
            score = 3;
        else if (chessMan instanceof ChessManRook)
            score = 5;
        else if (chessMan instanceof ChessManQueen)
            score = 9;
        if (chessMan.color == "black")
            this.info.setWhiteScore(score);
        else
            this.info.setBlackScore(score);
    },

    isCheck: function (color) {
        var board = this.board;
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                var chessMan = board.getChessMan(new ChessLocation(i, j));
                if (chessMan.color == (color == "white") ? "black" : "white") {
                    if (!chessMan.getMoves(this.board).every(function (obj) {
                            if (obj.status) {
                                var chessMan = board.getChessMan(new ChessLocation(obj.row, obj.col));
                                return !(chessMan.color == color && chessMan instanceof ChessManKing);
                            }
                            return true;
                        })) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    isCheckMate: function (color) {
        var chessManSrc;
        var that = this;
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                chessManSrc = that.board.getChessMan(new ChessLocation(i, j));
                if (chessManSrc.color != color)
                    continue;
                var location = chessManSrc.location;
                if (!chessManSrc.getMoves(that.board).every(function (move) {
                        var result = false;
                        var chessManDst = that.board.getChessMan(new ChessLocation(move.row, move.col));
                        chessManSrc.location = new ChessLocation(move.row, move.col);
                        that.board.removeChessMan(new ChessLocation(location.row, location.col));
                        that.board.putChessMan(chessManSrc);
                        if (that.isCheck(chessManSrc.color))
                            result = true;
                        chessManSrc.location = new ChessLocation(location.row, location.col);
                        that.board.putChessMan(chessManSrc);
                        that.board.putChessMan(chessManDst);
                        return result;
                    }))
                    return false;
            }
        }
        return true;
    },

    _onChessManClick: function () {
        var that = this;
        var lastLocation = null;
        var castlingRook = null;
        var promotionPawn = null;

        return function (row, col) {
            return function () {
                if (col == undefined) {
                    if (promotionPawn == null)
                        return;

                    var newChessMan = that.inventory.swapChessMan(row, promotionPawn);
                    newChessMan.location = new ChessLocation(promotionPawn.location.row, promotionPawn.location.col);
                    that.board.putChessMan(newChessMan);

                    promotionPawn = null;

                    that.notification.setNotificationMessage("");

                    that.info.setTurn(newChessMan.color == "white" ? "black" : "white");

                    return true;
                }

                if (castlingRook != null) {
                    var king = that.board.getChessMan(new ChessLocation(row, col));
                    if (!(king instanceof ChessManKing))
                        return false;
                    if (king.counter == 0) {
                        if (king.color == "black") {
                            if (that.board.blackField == "bottom") {
                                if (king.location.row != 0) {
                                    castlingRook = null;
                                    that.notification.setNotificationMessage("Castling was failed");
                                    return false;
                                }
                            } else {
                                if (king.location.row != 7) {
                                    castlingRook = null;
                                    that.notification.setNotificationMessage("Castling was failed");
                                    return false;
                                }
                            }
                        }
                        if (king.color == "white") {
                            if (that.board.whiteField == "bottom") {
                                if (king.location.row != 0) {
                                    castlingRook = null;
                                    that.notification.setNotificationMessage("Castling was failed");
                                    return false;
                                }
                            } else {
                                if (king.location.row != 7) {
                                    castlingRook = null;
                                    that.notification.setNotificationMessage("Castling was failed");
                                    return false;
                                }
                            }
                        }
                    } else {
                        castlingRook = null;
                        that.notification.setNotificationMessage("Castling was failed");
                        return false
                    }

                    var low, high;
                    low = (castlingRook.location.col < king.location.col) ? castlingRook.location.col : king.location.col;
                    high = (castlingRook.location.col > king.location.col) ? castlingRook.location.col : king.location.col;

                    for (var i = low + 1; i < high; i++) {
                        if (that.board.getChessMan(new ChessLocation(castlingRook.location.row, i))._chessManUnicode != "") {
                            castlingRook = null;
                            that.notification.setNotificationMessage("Castling was failed");
                            return false;
                        }
                    }

                    that.board.removeChessMan(king.location);
                    king.location.col = low + 2;
                    that.board.putChessMan(king);

                    that.board.removeChessMan(castlingRook.location);
                    castlingRook.col = high - 2;
                    that.board.putChessMan(castlingRook);

                    castlingRook = null;

                    that.info.setTurn(king.color == "white" ? "black" : "white");
                }

                if (lastLocation != null) {
                    that.board.getChessMan(lastLocation).resetStyle();

                    lastLocation = null;
                    castlingRook = null;

                    that.notification.setNotificationMessage("");

                    return false;
                }

                var chessMan = that.board.getChessMan(new ChessLocation(row, col));

                if (that.info.turn != chessMan.color)
                    return false;

                if (chessMan instanceof ChessManPawn && (chessMan.location.row == 7 || chessMan.location.row == 0)) {
                    that.notification.setNotificationMessage("Select one of your died chess mans for promotion");
                    lastLocation = new ChessLocation(row, col);
                    promotionPawn = chessMan;
                    chessMan.highlightSelect();
                } else if (chessMan instanceof ChessManRook && chessMan.counter == 0) {
                    if (chessMan.color == "black") {
                        if (that.board.blackField == "bottom") {
                            if (chessMan.location.row != 0)
                                return false;
                        } else {
                            if (chessMan.location.row != 7)
                                return false;
                        }
                    }
                    if (chessMan.color == "white") {
                        if (that.board.whiteField == "bottom") {
                            if (chessMan.location.row != 0)
                                return false;
                        } else {
                            if (chessMan.location.row != 7)
                                return false;
                        }
                    }
                    that.notification.setNotificationMessage("Select your king to castling or click anywhere");
                    castlingRook = chessMan;
                    lastLocation = new ChessLocation(row, col);
                    chessMan.highlightSelect();
                } else {
                    return false;
                }
            };
        };
    },

    _onChessManDrag: function () {
        var that = this;
        return function (row, col) {
            return function (event) {
                var chessMan = that.board.getChessMan(new ChessLocation(row, col));
                if (that.info.turn != chessMan.color)
                    return false;
                var moves = chessMan.getMoves(that.board);
                moves.forEach(function (obj) {
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

                var chessManSrc = that.board.getChessMan(location);
                chessManSrc.resetStyle();

                moves.forEach(function (obj) {
                    that.board.getChessMan(new ChessLocation(obj.row, obj.col)).resetStyle();
                });

                if (moves.every(function (obj) {
                        return (obj.row != row || obj.col != col);
                    }))
                    return false;

                var chessManDst = that.board.getChessMan(new ChessLocation(row, col));

                chessManSrc.location = new ChessLocation(row, col);
                that.board.removeChessMan(new ChessLocation(location.row, location.col));
                that.board.putChessMan(chessManSrc);

                if (that.isCheck(chessManSrc.color)) {
                    chessManSrc.location = new ChessLocation(location.row, location.col);
                    that.board.putChessMan(chessManSrc);
                    that.board.putChessMan(chessManDst);
                    that.notification.setNotificationMessage("Hey dude you are in check :(");
                    return false;
                }

                var end = false;

                if (that.isCheck((chessManSrc.color == "black") ? "white" : "black")) {
                    that.notification.setNotificationMessage(
                        ((chessManSrc.color == "black") ? "white" : "black") + " is in check :(");
                    if (that.isCheckMate((chessManSrc.color == "black") ? "white" : "black")) {
                        that.notification.setNotificationMessage(chessManSrc.color + " win the game");
                        end = true;
                    }
                } else {
                    that.notification.setNotificationMessage("");
                }

                that.chessManDie(chessManDst);
                chessManSrc.counter++;

                if (!end)
                    that.info.setTurn(chessManSrc.color == "white" ? "black" : "white");
                else
                    that.info.gameEnded();
                that.board.rotate(chessManSrc.color);

                that.board.getChessMan(new ChessLocation(location.row, location.col)).highlightSrcDst();
                that.board.getChessMan(new ChessLocation(row, col)).highlightSrcDst();
                window.setTimeout(function () {
                    that.board.getChessMan(new ChessLocation(location.row, location.col)).resetStyle();
                    that.board.getChessMan(new ChessLocation(row, col)).resetStyle();
                }, 500);
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
    this.whiteInventoryDiv.style.wordWrap = "break-word";

    this.blackInventory = [];

    this.blackInventoryDiv = document.createElement("div");
    this.blackInventoryDiv.id = "black-chessman-panel";
    this.blackInventoryDiv.style.wordWrap = "break-word";

    this.handler = {};
}

ChessInventory.prototype = {
    constructor: ChessInventory,

    getInventoryWhiteBlock: function () {
        return this.whiteInventoryDiv;
    },

    getInventoryBlackBlock: function () {
        return this.blackInventoryDiv;
    },

    onChessManEvent: function (event, fn) {
        var i;
        for (i = 0; i < this.whiteInventoryDiv.childNodes.length; i++)
            this.whiteInventoryDiv.childNodes[i][event] = fn(i);
        for (i = 0; i < this.blackInventoryDiv.childNodes.length; i++)
            this.blackInventoryDiv.childNodes[i][event] = fn(i);
        this.handler[event] = fn;
    },

    swapChessMan: function (index, chessManNew) {
        var chessManOld;
        var ev;
        if (chessManNew.color == "white") {
            chessManOld = this.whiteInventory[index];
            this.whiteInventory[index] = chessManNew;
            this.whiteInventoryDiv.replaceChild(chessManNew.getChessManSpan(), this.whiteInventoryDiv.childNodes[index]);
            for (ev in this.handler)
                this.whiteInventoryDiv.childNodes[index][ev] = this.handler[ev](index);
        } else {
            chessManOld = this.blackInventory[index];
            this.blackInventory[index] = chessManNew;
            this.blackInventoryDiv.replaceChild(chessManNew.getChessManSpan(), this.blackInventoryDiv.childNodes[index]);
            for (ev in this.handler)
                this.blackInventoryDiv.childNodes[index][ev] = this.handler[ev](index);
        }
        return chessManOld;
    },

    putChessMan: function (chessMan) {
        var ev, index;
        if (chessMan.color == "white") {
            index = this.whiteInventoryDiv.childNodes.length;
            this.whiteInventory.push(chessMan);
            this.whiteInventoryDiv.appendChild(chessMan.getChessManSpan());
            for (ev in this.handler)
                this.whiteInventoryDiv.lastChild[ev] = this.handler[ev](index);
        } else {
            index = this.blackInventoryDiv.childNodes.length;
            this.blackInventory.push(chessMan);
            this.blackInventoryDiv.appendChild(chessMan.getChessManSpan());
            for (ev in this.handler)
                this.blackInventoryDiv.lastChild[ev] = this.handler[ev](index);
        }
    }
};

function ChessBoard(whiteField, blackField) {
    this.whiteField = whiteField;
    this.blackField = blackField;

    this.handler = {};

    this.board = [];
    this.boardTable = null;
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
    constructor: ChessBoard,

    getBoardTable: function () {
        this.boardTable = document.createElement("table");
        for (var i = 0; i < 8; i++) {
            this.boardTable.appendChild(this.boardTrs[i]);
        }
        return this.boardTable;
    },

    rotate: function (direction) {
        this.boardTable.innerHTML = "";
        var i;
        if (direction == "white") {
            for (i = 0; i < 8; i++) {
                this.boardTable.appendChild(this.boardTrs[i]);
            }
        } else {
            for (i = 7; i >= 0; i--) {
                this.boardTable.appendChild(this.boardTrs[i]);
            }
        }
        return this.boardTable;
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
        for (var ev in this.handler)
            this.boardTrs[location.row].childNodes[location.col][ev] = this.handler[ev](location.row, location.col);
    },

    getChessMan: function (location) {
        if (location.row >= 0 && location.row < 8)
            if (location.col >= 0 && location.col < 8)
                return this.board[location.row][location.col];
        return null;
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

ChessLocation.prototype = {
    constructor: ChessLocation
};

function ChessMan(location) {
    this.color = "";
    this.td = null;
    this.span = null;
    this.location = location;
    this.counter = 0;
}

ChessMan.prototype = {
    constructor: ChessMan,

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
            this.td.style.color = "#FC8710";
    },

    highlightTarget: function () {
        if (this.td != null)
            this.td.style.color = "red";
    },

    highlightMove: function () {
        if (this.td != null)
            this.td.innerHTML = "&#128936;";
    },

    highlightSrcDst: function () {
        if (this.td != null)
            this.td.style.backgroundColor = "#6A6A6A";
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

ChessManPawn.prototype.constructor = ChessManPawn;

ChessManPawn.prototype.getMoves = function (board) {
    var moves = [];
    var row, col, chessMan;
    if (this.color == "black") {
        if (board.blackField == "bottom") {
            row = this.location.row + 1;
            col = this.location.col;
        } else {
            row = this.location.row - 1;
            col = this.location.col;
        }
        chessMan = board.getChessMan(new ChessLocation(row, col));
        if (chessMan != null && chessMan._chessManUnicode == "") {
            moves.push({
                row: row,
                col: col,
                status: false
            });
        }
        chessMan = board.getChessMan(new ChessLocation(row, col - 1));
        if (chessMan != null && chessMan.color == "white") {
            moves.push({
                row: row,
                col: col - 1,
                status: true
            });
        }
        chessMan = board.getChessMan(new ChessLocation(row, col + 1));
        if (chessMan != null && chessMan.color == "white") {
            moves.push({
                row: row,
                col: col + 1,
                status: true
            });
        }
    } else {
        if (board.whiteField == "bottom") {
            row = this.location.row + 1;
            col = this.location.col;
        } else {
            row = this.location.row - 1;
            col = this.location.col;
        }
        chessMan = board.getChessMan(new ChessLocation(row, col));
        if (chessMan != null && chessMan._chessManUnicode == "") {
            moves.push({
                row: row,
                col: col,
                status: false
            });
        }
        chessMan = board.getChessMan(new ChessLocation(row, col - 1));
        if (chessMan != null && chessMan.color == "black") {
            moves.push({
                row: row,
                col: col - 1,
                status: true
            });
        }
        chessMan = board.getChessMan(new ChessLocation(row, col + 1));
        if (chessMan != null && chessMan.color == "black") {
            moves.push({
                row: row,
                col: col + 1,
                status: true
            });
        }
    }
    return moves;
};

function ChessManRook(locaton, color) {
    ChessMan.call(this, locaton);
    this.color = color;
}

ChessManRook.prototype = new ChessMan();

ChessManRook.prototype.constructor = ChessManRook;

ChessManRook.prototype.getMoves = function (board) {
    var row = this.location.row;
    var col = this.location.col;
    var i, chessMan;
    var moves = [];

    for (i = row + 1; i < 8; i++) {
        chessMan = board.getChessMan(new ChessLocation(i, col));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: col,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: col,
                status: true
            });
            break;
        }
    }

    for (i = row - 1; i >= 0; i--) {
        chessMan = board.getChessMan(new ChessLocation(i, col));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: col,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: col,
                status: true
            });
            break;
        }
    }

    for (i = col + 1; i < 8; i++) {
        chessMan = board.getChessMan(new ChessLocation(row, i));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: row,
                col: i,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: row,
                col: i,
                status: true
            });
            break;
        }
    }

    for (i = col - 1; i >= 0; i--) {
        chessMan = board.getChessMan(new ChessLocation(row, i));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: row,
                col: i,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: row,
                col: i,
                status: true
            });
            break;
        }
    }
    return moves;
};

function ChessManKnight(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManKnight.prototype = new ChessMan();

ChessManKnight.prototype.constructor = ChessManKnight;

ChessManKnight.prototype.getMoves = function (board) {
    var moves = [];
    var row = this.location.row;
    var col = this.location.col;
    var chessMan;

    chessMan = board.getChessMan(new ChessLocation(row + 2, col + 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row + 2,
            col: col + 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row + 2,
            col: col + 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row + 2, col - 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row + 2,
            col: col - 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row + 2,
            col: col - 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row - 2, col + 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row - 2,
            col: col + 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row - 2,
            col: col + 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row - 2, col - 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row - 2,
            col: col - 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row - 2,
            col: col - 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row + 1, col + 2));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row + 1,
            col: col + 2,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row + 1,
            col: col + 2,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row + 1, col - 2));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row + 1,
            col: col - 2,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row + 1,
            col: col - 2,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row - 1, col + 2));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row - 1,
            col: col + 2,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row - 1,
            col: col + 2,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row - 1, col - 2));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row - 1,
            col: col - 2,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row - 1,
            col: col - 2,
            status: true
        });
    }

    return moves;

};

function ChessManQueen(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManQueen.prototype = new ChessMan();

ChessManQueen.prototype.constructor = ChessManQueen;

ChessManQueen.prototype.getMoves = function (board) {
    var moves = [];
    var row = this.location.row;
    var col = this.location.col;
    var i, j, chessMan;

    for (i = row + 1; i < 8; i++) {
        chessMan = board.getChessMan(new ChessLocation(i, col));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: col,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: col,
                status: true
            });
            break;
        }
    }

    for (i = row - 1; i >= 0; i--) {
        chessMan = board.getChessMan(new ChessLocation(i, col));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: col,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: col,
                status: true
            });
            break;
        }
    }

    for (i = col + 1; i < 8; i++) {
        chessMan = board.getChessMan(new ChessLocation(row, i));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: row,
                col: i,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: row,
                col: i,
                status: true
            });
            break;
        }
    }

    for (i = col - 1; i >= 0; i--) {
        chessMan = board.getChessMan(new ChessLocation(row, i));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: row,
                col: i,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: row,
                col: i,
                status: true
            });
            break;
        }
    }

    for (i = row + 1, j = col + 1; i < 8, j < 8; i++, j++) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }

    for (i = row - 1, j = col + 1; i >= 0, j < 8; i--, j++) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }

    for (i = row + 1, j = col - 1; i < 8, j >= 0; i++, j--) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }

    for (i = row - 1, j = col - 1; i >= 0, j >= 0; i--, j--) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }

    return moves;
};

function ChessManKing(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManKing.prototype = new ChessMan();

ChessManKing.prototype.constructor = ChessManKing;

ChessManKing.prototype.getMoves = function (board) {
    var moves = [];
    var row = this.location.row;
    var col = this.location.col;
    var chessMan;

    chessMan = board.getChessMan(new ChessLocation(row, col + 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row,
            col: col + 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row,
            col: col + 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row, col - 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row,
            col: col - 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row,
            col: col - 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row - 1, col + 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row - 1,
            col: col + 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row - 1,
            col: col + 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row - 1, col - 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row - 1,
            col: col - 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row - 1,
            col: col - 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row + 1, col + 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row + 1,
            col: col + 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row + 1,
            col: col + 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row + 1, col - 1));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row + 1,
            col: col - 1,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row + 1,
            col: col - 1,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row - 1, col));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row - 1,
            col: col,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row - 1,
            col: col,
            status: true
        });
    }

    chessMan = board.getChessMan(new ChessLocation(row + 1, col));
    if (chessMan == null) {
    } else if (chessMan._chessManUnicode == "") {
        moves.push({
            row: row + 1,
            col: col,
            status: false
        });
    } else if (chessMan.color == this.color) {
    } else if (chessMan.color != this.color) {
        moves.push({
            row: row + 1,
            col: col,
            status: true
        });
    }

    return moves;
};

function ChessManBishop(location, color) {
    ChessMan.call(this, location);
    this.color = color;
}

ChessManBishop.prototype = new ChessMan();

ChessManBishop.prototype.constructor = ChessManBishop;

ChessManBishop.prototype.getMoves = function (board) {
    var row = this.location.row;
    var col = this.location.col;
    var i, j, chessMan;
    var moves = [];

    for (i = row + 1, j = col + 1; i < 8, j < 8; i++, j++) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }

    for (i = row - 1, j = col + 1; i >= 0, j < 8; i--, j++) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }

    for (i = row + 1, j = col - 1; i < 8, j >= 0; i++, j--) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }

    for (i = row - 1, j = col - 1; i >= 0, j >= 0; i--, j--) {
        chessMan = board.getChessMan(new ChessLocation(i, j));
        if (chessMan == null) {
            break;
        } else if (chessMan._chessManUnicode == "") {
            moves.push({
                row: i,
                col: j,
                status: false
            });
        } else if (chessMan.color == this.color) {
            break;
        } else if (chessMan.color != this.color) {
            moves.push({
                row: i,
                col: j,
                status: true
            });
            break;
        }
    }
    return moves;
};

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

    var notification = new ChessNotification();

    top.appendChild(info.getInfoBlock());
    top.appendChild(inventory.getInventoryWhiteBlock());
    top.appendChild(board.getBoardTable());
    top.appendChild(inventory.getInventoryBlackBlock());
    top.appendChild(notification.getNotificationBlock());

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
    new ChessEngine(info, board, inventory, notification);
}
