import http from 'http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({});
const PORT = 80;
const TARGET = 'http://localhost:5000';

const server = http.createServer((req, res) => {
  proxy.web(req, res, { target: TARGET }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502);
    res.end('Bad Gateway');
  });
});

// Para WebSocket (hot reload do Vite)
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: TARGET });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy simples rodando na porta ${PORT}`);
  console.log(`➡️  Redirecionando para ${TARGET}`);
  console.log(`🌐 Preview: https://${process.env.REPLIT_DEV_DOMAIN || 'localhost'}`);
});