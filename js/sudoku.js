function sudokuLoadXML(xml) {
    xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet("etc/sudoku.xsl");
    var result = xsltProcessor.transformToFragment(xml, document);
    document.getElementById("main-container").innerHTML = result;
}