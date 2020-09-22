const express = require('express');
const bodyParser = require('body-parser');
const sqlite = require('sqlite3').verbose();

const app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index.html');
});

app.post('/', function(req, res) {
    const db = new sqlite.Database('example.sqlite');
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS user (name TEXT, age INTEGER)');
        const stmt = db.prepare('INSERT INTO user VALUES (?, ?)');
        stmt.run([req.body.name, req.body.age]);
        stmt.finalize();
    });
    db.close();

    res.sendFile(__dirname + '/docs/index.html');
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000');
});