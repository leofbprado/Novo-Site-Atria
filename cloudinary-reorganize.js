// Script para reorganizar assets do Cloudinary em pastas estruturadas
import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mapeamento de palavras-chave para pastas
const MAP = [
  // Marcas de veículos
  { keywords: ['brand', 'marca', 'bmw', 'audi', 'mercedes', 'toyota', 'honda', 'volkswagen', 'ford', 'chevrolet', 'fiat', 'jeep', 'nissan', 'hyundai', 'renault', 'peugeot', 'citroen', 'mitsubishi'], 
    folder: 'atria-veiculos/images/brands' },
  
  // Hero e banners
  { keywords: ['hero', 'banner', 'header', 'sell-car', 'venda-seu-carro'], 
    folder: 'atria-veiculos/hero' },
  
  // Veículos
  { keywords: ['vehicle', 'veiculo', 'car', 'carro', 'auto', 'cart'], 
    folder: 'atria-veiculos/veiculos' },
  
  // Depoimentos
  { keywords: ['testimonial', 'depoimento', 'review', 'cliente'], 
    folder: 'atria-veiculos/depoimentos' },
  
  // Blog
  { keywords: ['blog', 'post', 'artigo', 'noticia'], 
    folder: 'atria-veiculos/blog' },
  
  // Ícones e features
  { keywords: ['icon', 'icone', 'feature', 'service'], 
    folder: 'atria-veiculos/icons' },
  
  // Financiamento e ferramentas
  { keywords: ['financing', 'financiamento', 'calculator', 'calculadora', 'loan'], 
    folder: 'atria-veiculos/ferramentas' },
  
  // Sobre/About
  { keywords: ['about', 'sobre', 'team', 'equipe', 'dealer'], 
    folder: 'atria-veiculos/about' },
  
  // Geral/Imagens diversas
  { keywords: ['resource', 'image', 'img'], 
    folder: 'atria-veiculos/images/general' },
];

// Função para determinar a pasta baseada no public_id
function determineFolder(publicId) {
  const lowerCaseId = publicId.toLowerCase();
  
  // Ignora samples do Cloudinary
  if (lowerCaseId.includes('sample')) {
    return null;
  }
  
  // Verifica cada regra de mapeamento
  for (const rule of MAP) {
    for (const keyword of rule.keywords) {
      if (lowerCaseId.includes(keyword)) {
        return rule.folder;
      }
    }
  }
  
  // Se não encontrar match, coloca em misc
  return 'atria-veiculos/images/misc';
}

// Função principal
async function reorganizeAssets() {
  console.log('🚀 Iniciando reorganização dos assets do Cloudinary...\n');
  console.log('📊 Configuração:');
  console.log(`  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl'}`);
  console.log(`  API Key: ${process.env.CLOUDINARY_API_KEY ? '***' : 'NÃO DEFINIDA'}`);
  console.log(`  API Secret: ${process.env.CLOUDINARY_API_SECRET ? '***' : 'NÃO DEFINIDA'}\n`);
  
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Erro: Credenciais do Cloudinary não encontradas!');
    process.exit(1);
  }
  
  try {
    // Busca todos os recursos (máximo 500 por vez)
    console.log('📥 Buscando recursos...');
    let resources = [];
    let nextCursor = null;
    
    do {
      const options = { 
        type: 'upload', 
        max_results: 500,
        ...(nextCursor && { next_cursor: nextCursor })
      };
      
      const response = await cloudinary.api.resources(options);
      resources = resources.concat(response.resources);
      nextCursor = response.next_cursor;
      
      console.log(`  Carregados: ${resources.length} recursos`);
    } while (nextCursor);
    
    console.log(`\n✅ Total de recursos encontrados: ${resources.length}\n`);
    
    // Estatísticas
    const stats = {
      moved: 0,
      skipped: 0,
      errors: 0,
      byFolder: {}
    };
    
    // Processa cada recurso
    console.log('🔄 Processando recursos...\n');
    
    for (const resource of resources) {
      const currentId = resource.public_id;
      
      // Se já está organizado em atria-veiculos/, pula
      if (currentId.startsWith('atria-veiculos/')) {
        console.log(`⏭️  ${currentId} (já organizado)`);
        stats.skipped++;
        continue;
      }
      
      // Determina a nova pasta
      const targetFolder = determineFolder(currentId);
      
      if (!targetFolder) {
        console.log(`⏭️  ${currentId} (ignorado - sample)`);
        stats.skipped++;
        continue;
      }
      
      // Extrai o nome do arquivo
      const fileName = currentId.split('/').pop();
      const newId = `${targetFolder}/${fileName}`;
      
      // Tenta renomear
      try {
        await cloudinary.uploader.rename(currentId, newId, { 
          overwrite: false,
          invalidate: true 
        });
        
        console.log(`✅ ${currentId}`);
        console.log(`   → ${newId}`);
        
        stats.moved++;
        stats.byFolder[targetFolder] = (stats.byFolder[targetFolder] || 0) + 1;
        
      } catch (error) {
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️  ${currentId} → ${newId}`);
          console.log(`   (arquivo já existe no destino)`);
          stats.skipped++;
        } else {
          console.error(`❌ ${currentId}`);
          console.error(`   Erro: ${error.message}`);
          stats.errors++;
        }
      }
      
      // Delay para não sobrecarregar a API
      if (stats.moved % 10 === 0 && stats.moved > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA REORGANIZAÇÃO:');
    console.log('='.repeat(60));
    console.log(`✅ Movidos: ${stats.moved} recursos`);
    console.log(`⏭️  Ignorados: ${stats.skipped} recursos`);
    console.log(`❌ Erros: ${stats.errors} recursos`);
    
    if (Object.keys(stats.byFolder).length > 0) {
      console.log('\n📁 Distribuição por pasta:');
      Object.entries(stats.byFolder)
        .sort((a, b) => b[1] - a[1])
        .forEach(([folder, count]) => {
          console.log(`  ${folder}: ${count} arquivos`);
        });
    }
    
    console.log('\n✨ Reorganização concluída!');
    
    // Gera script de atualização de URLs se necessário
    if (stats.moved > 0) {
      console.log('\n📝 IMPORTANTE:');
      console.log('Os assets foram movidos com sucesso!');
      console.log('Os URLs antigos ainda funcionam (Cloudinary mantém redirecionamento).');
      console.log('Para usar os novos URLs organizados, atualize seu código.');
      console.log('\n💡 Dica: Use sempre f_auto,q_auto nos URLs para otimização automática:');
      console.log('https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/atria-veiculos/...');
    }
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executa
reorganizeAssets();