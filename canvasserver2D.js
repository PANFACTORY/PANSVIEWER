const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index3.html');
});

app.post('/', function(req, res) {
    console.log(req.body);
    res.json(req.body);
});

app.listen(7000, function() {
    console.log('app listening on port 7000');
});