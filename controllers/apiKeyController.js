const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { generateApiKey } = require('../utils/apiKeyGenerator');
require('dotenv').config();

function handleGenerateApiKey(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Missing or invalid token' }));
  }

  const token = authHeader.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Invalid or expired token' }));
  }

  const newKey = generateApiKey();

  const sql = 'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)';
  db.run(sql, [userId, newKey], function (err) {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Failed to generate API key' }));
    }

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'API key generated successfully',
      apiKey: newKey
    }));
  });
}

module.exports = { handleGenerateApiKey };
