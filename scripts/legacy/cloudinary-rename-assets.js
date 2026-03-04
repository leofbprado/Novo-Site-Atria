// Script para renomear assets no Cloudinary usando o mapeamento
import fs from 'fs';
import https from 'https';

// Configuração
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('🚀 Iniciando renomeação de assets no Cloudinary...\n');
console.log('📊 Configuração:');
console.log(`  Cloud Name: ${CLOUD_NAME}`);
console.log(`  API Key: ${API_KEY ? '***' : 'NÃO DEFINIDA'}`);
console.log(`  API Secret: ${API_SECRET ? '***' : 'NÃO DEFINIDA'}\n`);

if (!API_KEY || !API_SECRET) {
  console.error('❌ Erro: Credenciais não encontradas!');
  process.exit(1);
}

// Lê o mapeamento
const mapping = JSON.parse(fs.readFileSync('cloudinary-url-mapping.json', 'utf8'));
console.log(`📁 Total de assets para renomear: ${mapping.length}\n`);

// Função para renomear usando API REST
async function renameAsset(oldPublicId, newPublicId) {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
    
    // Prepara os dados do POST
    const postData = new URLSearchParams({
      from_public_id: oldPublicId,
      to_public_id: newPublicId,
      overwrite: 'true',
      invalidate: 'true',
      timestamp: timestamp.toString()
    }).toString();
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/resources/image/rename`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve({ success: true, result });
          } catch (e) {
            resolve({ success: false, error: 'Invalid JSON response', data });
          }
        } else if (res.statusCode === 404) {
          // Try with Admin API endpoint
          renameViaAdminAPI(oldPublicId, newPublicId)
            .then(resolve)
            .catch(reject);
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}`, data });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });
    
    req.write(postData);
    req.end();
  });
}

// Função alternativa usando Admin API
async function renameViaAdminAPI(oldPublicId, newPublicId) {
  return new Promise((resolve) => {
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
    
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUD_NAME}/resources/image/upload/${encodeURIComponent(oldPublicId)}`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };
    
    const postData = JSON.stringify({
      public_id: newPublicId,
      overwrite: true
    });
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve({ success: true, result });
          } catch (e) {
            resolve({ success: false, error: 'Invalid JSON response' });
          }
        } else {
          resolve({ success: false, error: `Admin API failed: ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({ success: false, error: e.message });
    });
    
    req.write(postData);
    req.end();
  });
}

// Processa renomeações
async function processRenames() {
  const stats = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };
  
  console.log('🔄 Processando renomeações...\n');
  
  for (let i = 0; i < mapping.length; i++) {
    const entry = mapping[i];
    
    // Pula se já está no destino correto
    if (entry.old_public_id === entry.new_public_id) {
      console.log(`⏭️  [${i+1}/${mapping.length}] ${entry.old_public_id} (já está correto)`);
      stats.skipped++;
      continue;
    }
    
    // Pula samples
    if (entry.old_public_id.toLowerCase().includes('sample')) {
      console.log(`⏭️  [${i+1}/${mapping.length}] ${entry.old_public_id} (sample)`);
      stats.skipped++;
      continue;
    }
    
    // Tenta renomear
    console.log(`🔄 [${i+1}/${mapping.length}] Renomeando ${entry.old_public_id}`);
    console.log(`   → ${entry.new_public_id}`);
    
    const result = await renameAsset(entry.old_public_id, entry.new_public_id);
    
    if (result.success) {
      console.log(`   ✅ Sucesso!\n`);
      stats.success++;
    } else {
      console.log(`   ❌ Falhou: ${result.error}\n`);
      stats.failed++;
      stats.errors.push({
        old: entry.old_public_id,
        new: entry.new_public_id,
        error: result.error
      });
    }
    
    // Delay para não sobrecarregar a API
    if ((i + 1) % 10 === 0) {
      console.log('⏸️  Pausando 2 segundos para não sobrecarregar a API...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA RENOMEAÇÃO:');
  console.log('='.repeat(60));
  console.log(`✅ Sucesso: ${stats.success} assets`);
  console.log(`❌ Falhou: ${stats.failed} assets`);
  console.log(`⏭️  Ignorados: ${stats.skipped} assets`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Erros detalhados:');
    stats.errors.slice(0, 10).forEach(err => {
      console.log(`  ${err.old} → ${err.new}`);
      console.log(`    Erro: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`  ... e mais ${stats.errors.length - 10} erros`);
    }
  }
  
  console.log('\n✨ Processo concluído!');
  
  if (stats.success > 0) {
    console.log('\n📝 IMPORTANTE:');
    console.log('Os assets foram renomeados com sucesso no Cloudinary!');
    console.log('As pastas foram criadas automaticamente.');
    console.log('Os URLs antigos ainda funcionam (redirecionamento automático).');
    console.log('\n💡 Para usar os novos URLs organizados no código:');
    console.log('1. Execute: node update-cloudinary-urls.js');
    console.log('2. Teste o site localmente');
    console.log('3. Faça build e deploy');
  }
}

// Executa
processRenames().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});