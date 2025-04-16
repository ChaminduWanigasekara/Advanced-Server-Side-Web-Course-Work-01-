const db = require('../config/db');

async function handleCountries(req, res) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Missing API key' }));
  }

  db.get('SELECT * FROM api_keys WHERE api_key = ?', [apiKey], async (err, row) => {
    if (err || !row) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Invalid API key' }));
    }

    const now = new Date().toISOString();
    db.run('UPDATE api_keys SET usage_count = usage_count + 1, last_used = ? WHERE api_key = ?', [now, apiKey]);

    try {
      console.log(' Fetching countries with native fetch...');
      const response = await fetch('https://restcountries.com/v3.1/all');
      const data = await response.json();
      console.log(' Got countries:', data.length);

      const countries = data.map(c => ({
        name: c.name?.common || '',
        capital: c.capital?.[0] || '',
        currencies: c.currencies ? Object.keys(c.currencies).join(', ') : '',
        languages: c.languages ? Object.values(c.languages).join(', ') : '',
        flag: c.flags?.svg || c.flags?.png || ''
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(countries));
    } catch (err) {
      console.error(' Fetch error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Failed to fetch countries data' }));
    }
  });
}

module.exports = { handleCountries };
