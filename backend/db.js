// Makes the DB connection once and returns the same connection instance for all modules requiring this one
var Datastore = require('nedb');
var db = new Datastore({ filename: './db/eol-hypetrain.db', autoload: true });

// Automatically compact the DB every 5 minutes
db.persistence.setAutocompactionInterval(300000);

module.exports = exports = db;