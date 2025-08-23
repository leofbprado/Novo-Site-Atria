// Etapa A - Inventário Cloudinary
// Gera lista completa de todos os recursos no Cloudinary

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuração do Cloudinary usando variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getCloudinaryInventory() {
  console.log('🔍 Iniciando inventário do Cloudinary...');
  
  try {
    let allResources = [];
    let nextCursor = null;
    let page = 1;

    // Loop para pegar todos os recursos (paginação)
    do {
      console.log(`📄 Buscando página ${page}...`);
      
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor
      });

      // Adiciona recursos ao array
      allResources = allResources.concat(result.resources);
      
      console.log(`✅ Página ${page}: ${result.resources.length} recursos encontrados`);
      
      // Configura próximo cursor para paginação
      nextCursor = result.next_cursor;
      page++;
      
    } while (nextCursor);

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
      folder: resource.folder || 'root'
    }));

    // Salva o inventário em JSON
    const outputFile = 'cloudinary-inventory.json';
    fs.writeFileSync(outputFile, JSON.stringify(inventory, null, 2));
    
    console.log(`\n✅ Inventário salvo em ${outputFile}`);
    
    // Estatísticas
    const totalSize = inventory.reduce((sum, item) => sum + item.bytes, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    
    console.log('\n📈 Estatísticas:');
    console.log(`- Total de arquivos: ${inventory.length}`);
    console.log(`- Tamanho total: ${totalSizeMB} MB`);
    
    // Agrupa por formato
    const formats = {};
    inventory.forEach(item => {
      formats[item.format] = (formats[item.format] || 0) + 1;
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
    Object.entries(folders).forEach(([folder, count]) => {
      console.log(`  - ${folder}: ${count} arquivos`);
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
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  });

export { getCloudinaryInventory };