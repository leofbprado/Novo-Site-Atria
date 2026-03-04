// Teste simples para verificar se o cloudinary está disponível
import https from 'https';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('🔍 Testando reorganização do Cloudinary...');
console.log(`Cloud Name: ${CLOUD_NAME}`);
console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 6) + '...' : 'NÃO DEFINIDA'}`);
console.log(`API Secret: ${API_SECRET ? '***' : 'NÃO DEFINIDA'}`);

if (!API_KEY || !API_SECRET) {
  console.error('\n❌ Erro: Credenciais não encontradas!');
  process.exit(1);
}

// Teste de renomeação usando API REST diretamente
const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

// Primeiro, vamos listar alguns recursos para testar
const listOptions = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${CLOUD_NAME}/resources/image/upload?max_results=5`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`
  }
};

console.log('\n📥 Buscando 5 recursos para teste...');

const listReq = https.request(listOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.error) {
        console.log('❌ Erro:', result.error);
        return;
      }
      
      console.log(`✅ Encontrados ${result.resources.length} recursos:\n`);
      
      result.resources.forEach(r => {
        console.log(`  - ${r.public_id}`);
        console.log(`    Formato: ${r.format}, Tamanho: ${(r.bytes/1024).toFixed(2)}KB`);
        
        // Verifica se precisa ser reorganizado
        if (!r.public_id.startsWith('atria-veiculos/') && !r.public_id.includes('sample')) {
          console.log(`    ⚠️ Candidato para reorganização`);
        } else {
          console.log(`    ✓ Já organizado ou é sample`);
        }
      });
      
      // Teste de rename via API POST
      console.log('\n📝 Testando API de rename...');
      
      // Encontra um recurso para testar
      const testResource = result.resources.find(r => 
        !r.public_id.startsWith('atria-veiculos/') && 
        !r.public_id.includes('sample')
      );
      
      if (testResource) {
        console.log(`\n🔄 Tentando reorganizar: ${testResource.public_id}`);
        
        // Determina nova pasta baseada no nome
        let newFolder = 'atria-veiculos/images/misc';
        const id = testResource.public_id.toLowerCase();
        
        if (id.includes('brand') || id.includes('marca')) {
          newFolder = 'atria-veiculos/images/brands';
        } else if (id.includes('hero') || id.includes('banner')) {
          newFolder = 'atria-veiculos/hero';
        } else if (id.includes('vehicle') || id.includes('car')) {
          newFolder = 'atria-veiculos/veiculos';
        }
        
        const fileName = testResource.public_id.split('/').pop();
        const newPublicId = `${newFolder}/${fileName}`;
        
        console.log(`  De: ${testResource.public_id}`);
        console.log(`  Para: ${newPublicId}`);
        
        // Prepara dados para rename
        const formData = `from_public_id=${encodeURIComponent(testResource.public_id)}&to_public_id=${encodeURIComponent(newPublicId)}&overwrite=false&invalidate=true`;
        
        const renameOptions = {
          hostname: 'api.cloudinary.com',
          port: 443,
          path: `/v1_1/${CLOUD_NAME}/resources/image/rename`,
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(formData)
          }
        };
        
        const renameReq = https.request(renameOptions, (renameRes) => {
          let renameData = '';
          renameRes.on('data', chunk => renameData += chunk);
          renameRes.on('end', () => {
            console.log(`\n📊 Resposta do rename (Status ${renameRes.statusCode}):`);
            try {
              const renameResult = JSON.parse(renameData);
              if (renameResult.error) {
                console.log('❌ Erro:', renameResult.error);
              } else {
                console.log('✅ Sucesso!', renameResult.public_id);
              }
            } catch (e) {
              console.log('Resposta:', renameData);
            }
          });
        });
        
        renameReq.on('error', (e) => {
          console.error('❌ Erro na requisição:', e.message);
        });
        
        renameReq.write(formData);
        renameReq.end();
        
      } else {
        console.log('ℹ️ Todos os recursos já estão organizados ou são samples.');
      }
      
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', e.message);
    }
  });
});

listReq.on('error', (e) => {
  console.error('❌ Erro de conexão:', e.message);
});

listReq.end();