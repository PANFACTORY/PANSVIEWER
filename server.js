var http = require('http');
var fs = require('fs')
var url = require('url');

http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    console.log(`Request for ${pathname} recieved`);

    if (pathname == '/') {
        pathname = '/index';
    }

    fs.readFile('docs/' + pathname.substr(1), (err, data) => {
        if (err) {
            console.log(err);

            res.writeHead(404, {'Content-Type' : 'text/plain'});
            res.write('404 - file not found');
        } else {
            res.writeHead(200, {'Content-Type' : 'text/html'});
            res.write(data.toString());
        }
        res.end();
    });
}).listen(3000);

console.log('server running on port 3000');