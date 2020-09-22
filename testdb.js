const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('example.sqlite');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS user (name TEXT, age INTEGER)');

    const stmt = db.prepare('INSERT INTO user VALUES (?, ?)');
    stmt.run(['Foo', 25]);
    stmt.run(['Bar', 39]);
    stmt.run(['Baz', 31]);

    stmt.finalize();
});

db.close();