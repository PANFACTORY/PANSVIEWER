const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest : __dirname + '/uploads/' }); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.text());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index3.html');
});

app.post('/', upload.single('upl'), function(req, res) {
    console.log(fs.readFileSync(__dirname + '/uploads/' + req.file.filename, 'utf-8'));
    fs.unlinkSync(__dirname + '/uploads/' + req.file.filename);
    res.json(JSON.stringify({ filename : req.file.filename }));
});

app.listen(7000, function() {
    console.log('app listening on port 7000');
});