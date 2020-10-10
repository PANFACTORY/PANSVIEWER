const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const pansload = require('./server/fileloader');
const pansconv = require('./server/render');
const PORT = process.env.PORT || 7000;

const app = express();
app.use("/client", express.static('./client/'));

const upload = multer({ storage : multer.memoryStorage() }); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.text());

app.get('/', function(req, res) {
    res.sendFile(`${__dirname}/client/html/index.html`);
});

let objects = new Array();

app.post('/loadmodel', upload.single('model'), function(req, res) {
    objects.push(pansload.loadObjectFromPly(req.file.buffer.toString()));
    res.send(JSON.stringify({ res : "OK" }));
});

app.post('/params', upload.any(), function(req, res) {
    let params = JSON.parse(req.body.params);
    res.send(JSON.stringify(pansconv.convertObject(objects, params.vertexf, params.vertexa, params.h, params.ey)));
});

app.listen(PORT, function() {
    console.log('app listening on port ' + PORT);
});