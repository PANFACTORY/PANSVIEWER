var http = require('http');
var server = http.createServer();

server.on('request', function(req, res) {
    if (req.url == '/now') {
        res.writeHead(200, {'Content-Type' : 'application/json'});
        res.write(JSON.stringify({ now : new Date() }));
    } else {
        res.end('Invalid request');
    }
});

server.listen(3000);