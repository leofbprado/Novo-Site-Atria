import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Verifica se a pasta dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Pasta dist não encontrada! Execute "npm run build" primeiro.');
  process.exit(1);
}

// Serve arquivos estáticos da pasta dist
app.use(express.static(distPath));

// Rota catch-all para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de produção rodando em http://0.0.0.0:${PORT}`);
  console.log('📦 Servindo build de produção da pasta /dist');
  console.log('🔍 Este ambiente simula exatamente a produção');
  console.log('⚠️  React Error #130 aparecerá se existir em produção');
});