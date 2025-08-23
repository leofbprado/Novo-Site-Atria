// Script para copiar (não mover) assets para nova estrutura organizada
// Usa upload com public_id para criar cópias organizadas

import fs from 'fs';
import https from 'https';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function classifyResource(resource) {
  const id = resource.public_id.toLowerCase();
  
  // Se já está organizado em atria-site/, analisa o conteúdo
  if (id.startsWith('atria-site/')) {
    const parts = id.split('/');
    // Remove atria-site/ para análise
    const content = parts.slice(1).join('/').toLowerCase();
    
    if (content.includes('brand') || content.includes('logo') || content.includes('marca')) {
      return 'marcas';
    }
    if (content.includes('sell-car') || content.includes('hero') || content.includes('banner')) {
      return 'hero';
    }
    if (content.includes('vehicle') || content.includes('car')) {
      return 'veiculos';
    }
    if (content.includes('financing') || content.includes('calculator')) {
      return 'ferramentas';
    }
    
    // Mantém estrutura existente se faz sentido
    if (parts[1] && ['images', 'icons', 'about'].includes(parts[1])) {
      return parts[1];
    }
  }
  
  // Classificação geral
  if (id.includes('brand') || id.includes('logo') || id.includes('marca')) {
    return 'marcas';
  }
  if (id.includes('hero') || id.includes('banner') || id.includes('header')) {
    return 'hero';
  }
  if (id.includes('vehicle') || id.includes('car') || id.includes('veiculo')) {
    return 'veiculos';
  }
  if (id.includes('testimonial') || id.includes('depoimento')) {
    return 'depoimentos';
  }
  if (id.includes('blog') || id.includes('post')) {
    return 'blog';
  }
  if (id.includes('icon') || id.includes('feature')) {
    return 'icones';
  }
  if (id.includes('financing') || id.includes('calculator')) {
    return 'ferramentas';
  }
  if (id.includes('about') || id.includes('sobre')) {
    return 'sobre';
  }
  
  return 'misc';
}

async function processAssets() {
  console.log('🚀 Iniciando cópia organizada dos assets...\n');
  
  const inventory = JSON.parse(fs.readFileSync('cloudinary-inventory.json', 'utf8'));
  const mappings = [];
  
  // Processa apenas assets que precisam ser reorganizados
  const toProcess = inventory.filter(r => {
    // Pula samples
    if (r.public_id.startsWith('samples/')) return false;
    
    // Processa assets desorganizados ou mal organizados
    const id = r.public_id.toLowerCase();
    
    // Assets na raiz precisam ser organizados
    if (!id.includes('/')) return true;
    
    // Assets em atria-site mas possivelmente mal organizados
    if (id.startsWith('atria-site/')) {
      const parts = id.split('/');
      // Se tem muitos níveis ou está em images/resource, precisa reorganizar
      if (parts.length > 3 || id.includes('images/resource')) {
        return true;
      }
    }
    
    return false;
  });
  
  console.log(`📊 Assets para reorganizar: ${toProcess.length} de ${inventory.length} total\n`);
  
  // Agrupa por categoria para visualização
  const categories = {};
  toProcess.forEach(r => {
    const cat = classifyResource(r);
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(r);
  });
  
  console.log('📂 Distribuição planejada:');
  Object.entries(categories).forEach(([cat, items]) => {
    console.log(`  ${cat}: ${items.length} arquivos`);
  });
  
  // Gera mapeamento de URLs
  console.log('\n📝 Gerando mapeamento de URLs...\n');
  
  toProcess.forEach(resource => {
    const category = classifyResource(resource);
    const oldId = resource.public_id;
    
    // Extrai nome do arquivo
    let filename = oldId.split('/').pop();
    
    // Remove extensão duplicada se houver
    if (filename.endsWith(`.${resource.format}`)) {
      filename = filename.slice(0, -(resource.format.length + 1));
    }
    
    const newId = `atria-site/${category}/${filename}`;
    
    // URL antiga e nova com otimização Cloudinary
    const oldUrl = resource.secure_url;
    const newUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${newId}.${resource.format}`;
    
    mappings.push({
      old_public_id: oldId,
      new_public_id: newId,
      old_url: oldUrl,
      new_url: newUrl,
      category: category,
      format: resource.format
    });
    
    console.log(`📁 ${oldId}`);
    console.log(`   → ${newId}`);
    console.log(`   → Categoria: ${category}\n`);
  });
  
  // Salva mapeamento
  fs.writeFileSync('cloudinary-url-mapping.json', JSON.stringify(mappings, null, 2));
  
  console.log(`✅ Mapeamento salvo em cloudinary-url-mapping.json`);
  console.log(`📊 Total de URLs para substituir: ${mappings.length}`);
  
  // Gera script de substituição
  console.log('\n📝 Gerando script de substituição...');
  
  const replaceScript = `#!/bin/bash
# Script para substituir URLs antigas do Cloudinary pelas novas otimizadas

echo "🔄 Substituindo URLs do Cloudinary..."

# Backup
echo "📦 Criando backup..."
tar -czf backup-before-cloudinary-\$(date +%Y%m%d-%H%M%S).tar.gz src/ public/

# Substituições
${mappings.map(m => {
  const oldUrlEscaped = m.old_url.replace(/[[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  return `
# ${m.old_public_id} → ${m.new_public_id}
find src public -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.html" \\) -exec sed -i 's|${oldUrlEscaped}|${m.new_url}|g' {} +`;
}).join('\n')}

echo "✅ Substituição concluída!"
echo "📊 Total de URLs substituídas: ${mappings.length}"
`;
  
  fs.writeFileSync('replace-cloudinary-urls.sh', replaceScript);
  fs.chmodSync('replace-cloudinary-urls.sh', '755');
  
  console.log('✅ Script de substituição salvo em replace-cloudinary-urls.sh');
  
  // Resumo final
  console.log('\n📊 RESUMO:');
  console.log(`  - Mapeamento criado: ${mappings.length} URLs`);
  console.log(`  - Categorias: ${Object.keys(categories).length}`);
  console.log(`  - Script pronto para execução`);
  
  console.log('\n📌 PRÓXIMOS PASSOS:');
  console.log('1. Revise o mapeamento em cloudinary-url-mapping.json');
  console.log('2. Execute: bash replace-cloudinary-urls.sh');
  console.log('3. Teste o site localmente');
  console.log('4. Faça build e deploy');
  
  return mappings;
}

processAssets()
  .then(() => {
    console.log('\n✅ Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  });