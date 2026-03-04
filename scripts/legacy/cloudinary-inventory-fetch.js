// Etapa A - Inventário Cloudinary usando fetch API
// Gera lista completa de todos os recursos no Cloudinary sem dependências externas

import fs from 'fs';
import https from 'https';

// Configuração usando variáveis de ambiente
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('❌ Erro: CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET precisam estar definidos');
  process.exit(1);
}

// Função para fazer requisição HTTP
function makeRequest(url, auth) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(auth).toString('base64')
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getCloudinaryInventory() {
  console.log('🔍 Iniciando inventário do Cloudinary...');
  console.log(`📊 Cloud Name: ${CLOUD_NAME}`);
  
  try {
    let allResources = [];
    let nextCursor = null;
    let page = 1;
    const auth = `${API_KEY}:${API_SECRET}`;

    // Loop para pegar todos os recursos (paginação)
    do {
      console.log(`📄 Buscando página ${page}...`);
      
      let url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?max_results=500`;
      if (nextCursor) {
        url += `&next_cursor=${encodeURIComponent(nextCursor)}`;
      }
      
      const result = await makeRequest(url, auth);
      
      if (result.error) {
        throw new Error(`API Error: ${result.error.message}`);
      }

      // Adiciona recursos ao array
      allResources = allResources.concat(result.resources || []);
      
      console.log(`✅ Página ${page}: ${(result.resources || []).length} recursos encontrados`);
      
      // Configura próximo cursor para paginação
      nextCursor = result.next_cursor;
      page++;
      
    } while (nextCursor && page < 10); // Limite de segurança de 10 páginas

    console.log(`\n📊 Total de recursos encontrados: ${allResources.length}`);

    // Mapeia apenas os campos importantes
    const inventory = allResources.map(resource => ({
      public_id: resource.public_id,
      format: resource.format,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      secure_url: resource.secure_url,
      created_at: resource.created_at,
      folder: resource.folder || 'root',
      url: resource.url
    }));

    // Salva o inventário em JSON
    const outputFile = 'cloudinary-inventory.json';
    fs.writeFileSync(outputFile, JSON.stringify(inventory, null, 2));
    
    console.log(`\n✅ Inventário salvo em ${outputFile}`);
    
    // Estatísticas
    const totalSize = inventory.reduce((sum, item) => sum + (item.bytes || 0), 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    console.log('\n📈 Estatísticas:');
    console.log(`- Total de arquivos: ${inventory.length}`);
    console.log(`- Tamanho total: ${totalSizeMB} MB`);
    
    // Agrupa por formato
    const formats = {};
    inventory.forEach(item => {
      const format = item.format || 'unknown';
      formats[format] = (formats[format] || 0) + 1;
    });
    
    console.log('\n📁 Distribuição por formato:');
    Object.entries(formats).forEach(([format, count]) => {
      console.log(`  - ${format}: ${count} arquivos`);
    });

    // Agrupa por pasta atual
    const folders = {};
    inventory.forEach(item => {
      const folder = item.public_id.includes('/') 
        ? item.public_id.split('/')[0] 
        : 'root';
      folders[folder] = (folders[folder] || 0) + 1;
    });
    
    console.log('\n📂 Distribuição por pasta:');
    Object.entries(folders).sort((a, b) => b[1] - a[1]).forEach(([folder, count]) => {
      console.log(`  - ${folder}: ${count} arquivos`);
    });

    // Identifica padrões para classificação
    console.log('\n🔍 Análise para reorganização:');
    
    const categories = {
      'marcas': [],
      'hero': [],
      'veiculos': [],
      'depoimentos': [],
      'blog': [],
      'misc': []
    };

    inventory.forEach(item => {
      const id = item.public_id.toLowerCase();
      const url = item.secure_url || '';
      
      if (id.includes('brand') || id.includes('logo') || id.includes('marca')) {
        categories.marcas.push(item.public_id);
      } else if (id.includes('hero') || id.includes('banner')) {
        categories.hero.push(item.public_id);
      } else if (id.includes('vehicle') || id.includes('car') || id.includes('stock') || url.includes('/veiculos/')) {
        categories.veiculos.push(item.public_id);
      } else if (id.includes('testimonial') || id.includes('depoimento')) {
        categories.depoimentos.push(item.public_id);
      } else if (id.includes('blog')) {
        categories.blog.push(item.public_id);
      } else {
        categories.misc.push(item.public_id);
      }
    });

    console.log('\n📊 Classificação proposta:');
    Object.entries(categories).forEach(([cat, items]) => {
      console.log(`  - atria-site/${cat}/: ${items.length} arquivos`);
      if (items.length > 0 && items.length <= 5) {
        items.forEach(id => console.log(`    • ${id}`));
      }
    });

    return inventory;
    
  } catch (error) {
    console.error('❌ Erro ao buscar inventário:', error);
    throw error;
  }
}

// Executa o script
getCloudinaryInventory()
  .then(() => {
    console.log('\n✅ Inventário concluído com sucesso!');
    console.log('📌 Próximo passo: Executar Etapa B - Classificação e reorganização');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  });