const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Proxy to Vite server
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:5000'
    }
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    console.log(`Proxy response: ${proxyRes.statusCode}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (e) => {
    console.error(`Proxy error: ${e.message}`);
    res.writeHead(502);
    res.end('Bad Gateway');
  });
  
  req.pipe(proxyReq);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test proxy server running on port ${PORT}`);
  console.log(`Proxying requests to Vite on port 5000`);
});