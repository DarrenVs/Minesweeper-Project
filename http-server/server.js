//--		Index	   --\\

var express = require('express');
var app = express();
var server = require('http').createServer(app);

// Send index.html
app.use(express.static('./'));
app.get('/', function (req, res) {
	
	res.sendFile('index.html');
})
//Turn on the server
server.listen(80);