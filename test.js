var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var req = new XMLHttpRequest();  
req.open('GET', 'http://localhost:1234/test', false);   
console.log("opening")
req.send(null);
console.log("null")  
console.log("test")
   console.log(req.responseText);