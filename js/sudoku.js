function Sudoku() {
    this.cells = [];
}

Sudoku.prototype = {
    addCell: function (cell) {
        this.cells.push(cell);

        cell.element.onmouseover = this._onCellMouseOver(cell);
        cell.element.onmouseout = this._onCellMouseOut(cell);
    },

    _onCellMouseOver: function (cell) {
        var that = this;
        var value = cell.value;
        return function () {
            for (var i = 0; i < that.cells.length; i++) {
                if (value != "" && that.cells[i].value == value) {
                    that.cells[i].highlight();
                }
            }
        };
    },

    _onCellMouseOut: function (cell) {
        var that = this;
        var value = cell.value;

        return function () {
            for (var i = 0; i < that.cells.length; i++) {
                if (value != "" && that.cells[i].value == value) {
                    that.cells[i].noHighlight();
                }
            }
        };
    }
};

function SudokuCell(value, element) {
    this.value = value;
    this.element = element;
}

SudokuCell.prototype = {
    highlight: function () {
        this.element.style.color = this._highlightColor;
        this.element.style.backgroundColor = this._highlightColorBackground;
    },

    noHighlight: function () {
        this.element.style.color = "";
        this.element.style.backgroundColor = "";

    },

    _highlightColor: null,

    _highlightColorBackground: null

};

function sudokuLoadXML(xml) {

    var request = new XMLHttpRequest();
    request.open("GET", "etc/sudoku.xsl", false);
    request.send();
    var xsl = request.responseXML;

    /* update main contents of page */
    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    var result = xsltProcessor.transformToFragment(xml, document);
    document.getElementById("main-container").innerHTML = "";
    document.getElementById("main-container").appendChild(result);

    /* create sudoku manager */
    var sudoku = new Sudoku();

    /* setup cell static fields */
    SudokuCell.prototype._highlightColor = xml.getElementsByTagName("sudoku")[0].getAttribute("selectedNumberColor");
    SudokuCell.prototype._highlightColorBackground =
        xml.getElementsByTagName("sudoku")[0].getAttribute("selectedNumberBackColor");


    /* store and setup cells */
    var cellsElements = document.getElementsByClassName("cell");
    for (var i = 0; i < cellsElements.length; i++) {
        var value = "";
        if (cellsElements[i].hasChildNodes()) {
            value = cellsElements[i].childNodes[0].nodeValue;
        }
        sudoku.addCell(new SudokuCell(value, cellsElements[i]));
    }

}