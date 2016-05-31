window.onload = onHomeLoad;

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
        }
    };
}
