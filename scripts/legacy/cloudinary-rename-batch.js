// Script otimizado para renomear assets em lote no Cloudinary
import fs from 'fs';
import https from 'https';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('🚀 Renomeação em Lote - Cloudinary\n');

// Lê o mapeamento
const mapping = JSON.parse(fs.readFileSync('cloudinary-url-mapping.json', 'utf8'));
const BATCH_SIZE = 30; // Processa 30 por vez
const START_FROM = 0; // Começa do início

console.log(`📊 Total de assets: ${mapping.length}`);
console.log(`📦 Processando lote: ${START_FROM} até ${START_FROM + BATCH_SIZE}\n`);

// Função simplificada de rename
async function renameAsset(oldId, newId) {
  return new Promise((resolve) => {
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
    const timestamp = Date.now();
    
    // Usa endpoint direto da API Upload
    const boundary = `----WebKitFormBoundary${timestamp}`;
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="public_id"\r\n\r\n${newId}\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="from_public_id"\r\n\r\n${oldId}\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="invalidate"\r\n\r\ntrue\r\n`;
    body += `--${boundary}--\r\n`;
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/image/rename`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          success: res.statusCode === 200, 
          status: res.statusCode,
          data: data.substring(0, 100) 
        });
      });
    });
    
    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });
    
    req.write(body);
    req.end();
  });
}

// Processa lote
async function processBatch() {
  const batch = mapping.slice(START_FROM, START_FROM + BATCH_SIZE);
  const stats = { success: 0, failed: 0, skipped: 0 };
  
  for (let i = 0; i < batch.length; i++) {
    const entry = batch[i];
    const globalIndex = START_FROM + i + 1;
    
    // Pula samples
    if (entry.old_public_id.toLowerCase().includes('sample')) {
      console.log(`⏭️  [${globalIndex}/${mapping.length}] ${entry.old_public_id} (sample)`);
      stats.skipped++;
      continue;
    }
    
    // Pula se já está correto
    if (entry.old_public_id === entry.new_public_id) {
      console.log(`⏭️  [${globalIndex}/${mapping.length}] ${entry.old_public_id} (já correto)`);
      stats.skipped++;
      continue;
    }
    
    // Renomeia
    process.stdout.write(`🔄 [${globalIndex}/${mapping.length}] ${entry.old_public_id.substring(0, 50)}... `);
    
    const result = await renameAsset(entry.old_public_id, entry.new_public_id);
    
    if (result.success) {
      console.log('✅');
      stats.success++;
    } else {
      console.log(`❌ (${result.status || result.error})`);
      stats.failed++;
    }
    
    // Pequeno delay entre requisições
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Resumo do lote
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resumo do Lote (${START_FROM + 1}-${START_FROM + batch.length}):`);
  console.log(`✅ Sucesso: ${stats.success}`);
  console.log(`❌ Falhou: ${stats.failed}`);
  console.log(`⏭️  Ignorados: ${stats.skipped}`);
  
  if (START_FROM + BATCH_SIZE < mapping.length) {
    console.log(`\n📌 Ainda restam ${mapping.length - START_FROM - BATCH_SIZE} assets`);
    console.log('Para continuar, execute novamente ajustando START_FROM');
  } else {
    console.log('\n✨ Todos os assets foram processados!');
  }
  
  // Salva progresso
  const progress = {
    total: mapping.length,
    processed: START_FROM + batch.length,
    success: stats.success,
    failed: stats.failed,
    skipped: stats.skipped,
    lastProcessed: new Date().toISOString()
  };
  
  fs.writeFileSync('cloudinary-rename-progress.json', JSON.stringify(progress, null, 2));
  console.log('\n📁 Progresso salvo em cloudinary-rename-progress.json');
}

// Executa
processBatch().catch(console.error);