function sudokuLoadXML(xml) {

    var request = new XMLHttpRequest();
    request.open("GET", "etc/sudoku.xsl", false);
    request.send();
    var xsl = request.responseXML;

    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    var result = xsltProcessor.transformToFragment(xml, document);
    document.getElementById("main-container").innerHTML = "";
    document.getElementById("main-container").appendChild(result);
}