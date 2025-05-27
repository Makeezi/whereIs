const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./items.db');

// Create tables if not exist
db.serialize(() => {
  // Device table with just id
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY
    )
  `);

  // Items table, each item references a device by device_id
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      latitude REAL NULL,
      longitude REAL NULL,
      device_id TEXT,
      iv TEXT,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    )
  `);
});

module.exports = db;