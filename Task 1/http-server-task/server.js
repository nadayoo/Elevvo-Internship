const http = require('http');
const os = require('os');

const PORT = 3000;

// Helper: every response gets a status code, a JSON Content-Type, and a JSON body
function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  // Parse the path so "/api/users?page=2" still matches "/api/users"
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // GET /
  if (req.method === 'GET' && pathname === '/') {
    return sendJson(res, 200, { message: 'Welcome to the raw HTTP server' });
  }

  // GET /api/users
  if (req.method === 'GET' && pathname === '/api/users') {
    return sendJson(res, 200, [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Linus' },
    ]);
  }

  // Bonus: GET /api/health
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      uptimeSeconds: process.uptime(),
      platform: os.platform(),
      timestamp: new Date().toISOString(),
    });
  }

  // Fallback: no route matched
  sendJson(res, 404, { error: 'Not Found', path: pathname });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});