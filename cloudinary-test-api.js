// Teste simples da API do Cloudinary
import https from 'https';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('🔍 Testando conexão com Cloudinary...');
console.log(`Cloud Name: ${CLOUD_NAME}`);
console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 6) + '...' : 'NÃO DEFINIDA'}`);
console.log(`API Secret: ${API_SECRET ? '***' : 'NÃO DEFINIDA'}`);

if (!API_KEY || !API_SECRET) {
  console.error('\n❌ Erro: Credenciais não encontradas!');
  console.log('\nVerifique se as variáveis de ambiente estão definidas:');
  console.log('- CLOUDINARY_API_KEY');
  console.log('- CLOUDINARY_API_SECRET');
  process.exit(1);
}

// Teste simples - buscar um recurso
const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${CLOUD_NAME}/resources/image/upload?max_results=1`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`
  }
};

const req = https.request(options, (res) => {
  console.log(`\n📊 Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.error) {
        console.log('❌ Erro da API:', result.error);
      } else {
        console.log('✅ Conexão bem-sucedida!');
        console.log(`📁 Recursos encontrados: ${result.resources ? result.resources.length : 0}`);
      }
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro de conexão:', e.message);
});

req.end();