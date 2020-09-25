const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;
const pansconv = require('./modules/pansconverter');
const pansload = require('./modules/pansloader');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index2.html');
});

let gvertexes = new Array();
let gfaces = new Array();

io.on('connection', function(socket) {    
    socket.on('file', function(msg) {
        [ gvertexes, gfaces ] = pansload.loadObjectPly(msg);
    });
    
    socket.on('param', function(msg) {
        const params = JSON.parse(msg);
        io.emit('param', msg);
        io.emit('obj', JSON.stringify(pansconv.convertObject(gvertexes, gfaces, params.vertexf, params.vertexa, params.h*params.r)));      
    });
});

http.listen(PORT, function() {
    console.log('server listening. Port:' + PORT);
});