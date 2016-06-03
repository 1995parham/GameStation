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
            that.cells.forEach(function (cell) {
                if (value != "" && cell.value == value) {
                    cell.highlight();
                }
            });
        };
    },

    _onCellMouseOut: function (cell) {
        var that = this;
        var value = cell.value;

        return function () {
            that.cells.forEach(function (cell) {
                if (value != "" && cell.value == value) {
                    cell.noHighlight();
                }
            });
        };
    },

    submit: function () {
        var xml = (new DOMParser()).parseFromString('<?xml version="1.0" encoding="utf-8"?><solution></solution>', "text/xml");

        var cells = xml.createElement("cells");
        for (var i = 0; i < this.cells.length; i++) {
            var cell = xml.createElement("cell");
            cell.setAttribute("posval", Math.floor(i / 9) * 100 + (i % 9) * 10 + parseInt(this.cells[i].value));
            cell.appendChild(xml.createTextNode(this.cells[i].value));
            cells.appendChild(cell);
        }

        var student = xml.createElement("student");
        student.setAttribute("id", "9231058");
        student.appendChild(xml.createTextNode("Parham Alvani"));

        xml.getElementsByTagName("solution")[0].appendChild(cells);
        xml.getElementsByTagName("solution")[0].appendChild(student);

        var request = new XMLHttpRequest();
        request.open("POST", "http://ie.ce-it.ir/hw3/sudoku_validator.php", true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.send("solution_xml=" + (new XMLSerializer()).serializeToString(xml));
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                window.alert(request.responseText);
            }
        };

    }
};

function SudokuCell(value, element) {
    this.value = value;
    this.element = element;

    this.element.onkeyup = this._onKeyUp();
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

    _onKeyUp: function () {
        var that = this;

        return function () {
            if (that._regExp.test(that.element.innerHTML)) {
                that.value = that.element.innerHTML;
            } else {
                that.element.innerHTML = "";
            }
        };
    },

    _regExp: /^[1-9]$/,

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

    /* setup sudoku bottoms */
    document.getElementById("submit-sudoku").onclick = function () {
        sudoku.submit()
    };

}