const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function handleRegister(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());

  req.on('end', () => {
    const { username, password } = JSON.parse(body);

    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Missing fields' }));
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Hashing failed' }));
      }

      const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
      db.run(sql, [username, hashedPassword], function (err) {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ message: 'Registration failed!!! User name already exists.' }));

        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User registered successfully' }));
      });
    });
  });
}

function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());

  req.on('end', () => {
    const { username, password } = JSON.parse(body);

    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Missing fields' }));
    }

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, user) => {
      if (err || !user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid username or password' }));
      }

      bcrypt.compare(password, user.password_hash, (err, match) => {
        if (err || !match) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ message: 'Invalid username or password' }));
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Login successful', token }));
      });
    });
  });
}

module.exports = { handleRegister, handleLogin };
