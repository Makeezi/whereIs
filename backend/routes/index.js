var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const db = require('../db/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here'; // Replace with a secure secret

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Register or login device/userid (hashed one-way)
router.post('/registerLogin', function(req, res) {
  const { id } = req.body;
  console.log('Register/Login request for id:', id);
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // One-way hash (SHA-256)
  const hashedId = crypto.createHash('sha256').update(id).digest('hex');

  // Check if device exists
  db.get('SELECT id FROM devices WHERE id = ?', [hashedId], function(err, row) {
    if (err) return res.status(500).json({ error: err.message });

    function issueToken() {
      // Issue JWT token
      const token = jwt.sign({ deviceId: hashedId }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, id: hashedId, token });
    }

    if (row) {
      // Device exists, login
      issueToken();
    } else {
      // Device does not exist, register then login
      db.run(
        'INSERT INTO devices (id) VALUES (?)',
        [hashedId],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          issueToken();
        }
      );
    }
  });
});

module.exports = router;