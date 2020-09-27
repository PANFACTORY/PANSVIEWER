const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const upload = multer({ dest : __dirname + '/uploads/', inMemory : true }); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.text());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index3.html');
});

app.post('/', upload.single('upl'), function(req, res) {
    console.log(req.file.filename);
    res.json(JSON.stringify({ filename : req.file.filename }));
});

app.listen(7000, function() {
    console.log('app listening on port 7000');
});