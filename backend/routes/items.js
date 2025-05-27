var express = require('express');
var router = express.Router();
const db = require('../db/db');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key_here'; // Use the same secret as in your routes

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Helper functions for encryption/decryption
function getKey(deviceId) {
  return crypto.createHash('sha256').update(deviceId).digest(); // 32 bytes
}

function encrypt(text, key, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Get all items for this device, decrypting fields
router.get('/', authenticateToken, function(req, res) {
  const deviceId = req.user.deviceId;
  const key = getKey(deviceId);

  db.all('SELECT * FROM items WHERE device_id = ?', [deviceId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Decrypt name and description for each row
    const decryptedRows = rows.map(row => {
      const iv = Buffer.from(row.iv, 'hex');
      return {
        ...row,
        name: decrypt(row.name, key, iv),
        description: decrypt(row.description, key, iv)
      };
    });
    res.json(decryptedRows);
  });
});

// Add a new item, encrypting fields
router.post('/', authenticateToken, function(req, res) {
  const { name, description, latitude, longitude } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }
  const deviceId = req.user.deviceId;
  const key = getKey(deviceId);
  const iv = crypto.randomBytes(16);

  const encryptedName = encrypt(name, key, iv);
  const encryptedDescription = encrypt(description, key, iv);

  db.run(
    'INSERT INTO items (name, description, latitude, longitude, device_id, iv) VALUES (?, ?, ?, ?, ?, ?)',
    [encryptedName, encryptedDescription, latitude, longitude, deviceId, iv.toString('hex')],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        name: encryptedName,
        description: encryptedDescription,
        latitude,
        longitude,
        device_id: deviceId,
        iv: iv.toString('hex')
      });
    }
  );
});

module.exports = router;