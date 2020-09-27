const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const pansload = require('./modules/pansloader');
const pansconv = require('./modules/pansconverter');
const PORT = process.env.PORT || 7000;

const app = express();
const upload = multer({ dest : __dirname + '/uploads/' }); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.text());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index3.html');
});

let vertexes = new Array();
let faces = new Array();

app.post('/', upload.single('model'), function(req, res) {
    let params = JSON.parse(req.body.params);
    let rawdata = fs.readFileSync(__dirname + '/uploads/' + req.file.filename, 'utf-8');

    [ vertexes, faces ] = pansload.loadObjectPly(rawdata);
    
    fs.unlinkSync(__dirname + '/uploads/' + req.file.filename);

    res.send(JSON.stringify(pansconv.convertObject(vertexes, faces, params.vertexf, params.vertexa, params.h*params.r)));
});

app.post('/params', upload.any(), function(req, res) {
    let params = JSON.parse(req.body.params);
    res.send(JSON.stringify(pansconv.convertObject(vertexes, faces, params.vertexf, params.vertexa, params.h*params.r)));
});

app.listen(PORT, function() {
    console.log('app listening on port ' + PORT);
});