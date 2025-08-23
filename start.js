import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;
const distPath = path.join(__dirname, 'dist');

// Função para executar build se necessário
function ensureBuild() {
  if (!fs.existsSync(distPath)) {
    console.log('Build não encontrado. Executando build...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('Build concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao executar build:', error);
      process.exit(1);
    }
  }
}

// Executar build se necessário
ensureBuild();

// Mimetypes para servir arquivos corretamente
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg'
};

// Criar servidor HTTP diretamente
const server = http.createServer((req, res) => {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);

  // Se não encontrar o arquivo, servir index.html (SPA)
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      filePath = path.join(distPath, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error('Erro ao carregar arquivo:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno do servidor');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de produção rodando em http://0.0.0.0:${PORT}`);
  console.log('Pronto para deployment no Replit');
  console.log('Build disponível e pronto para servir');
});