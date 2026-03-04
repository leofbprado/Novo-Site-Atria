import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 80;

// Proxy tudo para o Vite na porta 5000
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy rodando na porta ${PORT} -> redirecionando para 5000`);
});
