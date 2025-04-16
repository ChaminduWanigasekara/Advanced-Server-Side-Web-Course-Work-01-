const { handleRegister, handleLogin } = require('../controllers/authController');
const { handleGenerateApiKey } = require('../controllers/apiKeyController');
const { handleCountries } = require('../controllers/countriesController');

function router(req, res) {
  if (req.url === '/register' && req.method === 'POST') {
    return handleRegister(req, res);
  }

  if (req.url === '/login' && req.method === 'POST') {
    return handleLogin(req, res);
  }

  if (req.url === '/apikey' && req.method === 'POST') {
    return handleGenerateApiKey(req, res);
  }

  if (req.url === '/countries' && req.method === 'GET') {
    return handleCountries(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}

module.exports = { router };
