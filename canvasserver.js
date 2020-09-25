const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 7000;
const pansconv = require('./modules/pansconverter');
const pansload = require('./modules/pansloader');

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

let vertexes = new Array();
let faces = new Array();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index2.html');
});

app.post('/file', function(req, res) {
    let param = JSON.parse(req.body.param);
    [ vertexes, faces ] = pansload.loadObjectPly(req.body.obj);
    console.log(vertexes.length, faces.length, param);
    res.send(JSON.stringify(pansconv.convertObject(vertexes, faces, param.vertexf, param.vertexa, param.h*param.r)));
});

app.post('/param', function(req, res) {
    let param = JSON.parse(req.body.param);
    console.log(vertexes.length, faces.length, param);
    res.send(JSON.stringify(pansconv.convertObject(vertexes, faces, param.vertexf, param.vertexa, param.h*param.r)));
});

app.listen(PORT, function() {
    console.log('Example app listening on port ' + PORT);
});