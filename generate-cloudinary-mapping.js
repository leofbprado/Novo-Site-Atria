// Script para gerar mapeamento de reorganização do Cloudinary
import fs from 'fs';

// Lê o inventário
const inventory = JSON.parse(fs.readFileSync('cloudinary-inventory.json', 'utf8'));

console.log(`📊 Processando ${inventory.length} recursos...`);

// Função de classificação baseada nas regras fornecidas
function classifyAsset(publicId) {
  const id = publicId.toLowerCase();
  
  // Ignora samples
  if (id.includes('sample')) {
    return null;
  }
  
  // Regras de classificação (case-insensitive)
  if (/brand|logo/.test(id)) {
    return 'atria-veiculos/images/brands';
  }
  
  if (/hero|banner/.test(id)) {
    return 'atria-veiculos/hero';
  }
  
  if (/vehicle|carro|stock/.test(id)) {
    return 'atria-veiculos/veiculos';
  }
  
  if (/testimonial|depoimento/.test(id)) {
    return 'atria-veiculos/depoimentos';
  }
  
  if (/blog/.test(id)) {
    return 'atria-veiculos/blog';
  }
  
  // Regras adicionais para melhor organização
  if (/icon|feature/.test(id)) {
    return 'atria-veiculos/icons';
  }
  
  if (/financing|calculator|loan/.test(id)) {
    return 'atria-veiculos/ferramentas';
  }
  
  if (/about|dealer|team/.test(id)) {
    return 'atria-veiculos/about';
  }
  
  // Padrão
  return 'atria-veiculos/images/misc';
}

// Processa cada asset e gera o mapeamento
const mapping = [];
const stats = {
  processed: 0,
  skipped: 0,
  byFolder: {}
};

inventory.forEach(resource => {
  const oldPublicId = resource.public_id;
  
  // Pula se já está organizado em atria-veiculos/
  if (oldPublicId.startsWith('atria-veiculos/')) {
    stats.skipped++;
    return;
  }
  
  // Classifica o asset
  const targetFolder = classifyAsset(oldPublicId);
  
  // Pula samples
  if (!targetFolder) {
    stats.skipped++;
    return;
  }
  
  // Extrai o nome do arquivo (última parte do public_id)
  const fileName = oldPublicId.split('/').pop();
  
  // Gera o novo public_id
  const newPublicId = `${targetFolder}/${fileName}`;
  
  // Constrói as URLs antigas e novas
  const cloudName = 'dyngqkiyl';
  const oldUrl = resource.secure_url;
  
  // Nova URL com otimização f_auto,q_auto
  // Remove a extensão do newPublicId para a URL (Cloudinary adiciona automaticamente)
  const newUrlPath = newPublicId.replace(/\.[^/.]+$/, '');
  const newUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${newUrlPath}`;
  
  // Adiciona ao mapeamento
  mapping.push({
    old_public_id: oldPublicId,
    new_public_id: newPublicId,
    old_url: oldUrl,
    new_url: newUrl,
    category: targetFolder,
    format: resource.format || 'png'
  });
  
  // Estatísticas
  stats.processed++;
  if (!stats.byFolder[targetFolder]) {
    stats.byFolder[targetFolder] = 0;
  }
  stats.byFolder[targetFolder]++;
});

// Salva o mapeamento
fs.writeFileSync('cloudinary-url-mapping.json', JSON.stringify(mapping, null, 2));

// Exibe resumo
console.log('\n✅ Mapeamento gerado com sucesso!');
console.log(`📁 Arquivo salvo: cloudinary-url-mapping.json`);
console.log(`\n📊 Estatísticas:`);
console.log(`  - Processados: ${stats.processed} recursos`);
console.log(`  - Ignorados: ${stats.skipped} recursos`);
console.log(`\n📂 Distribuição por pasta:`);

Object.entries(stats.byFolder)
  .sort((a, b) => b[1] - a[1])
  .forEach(([folder, count]) => {
    console.log(`  ${folder}: ${count} arquivos`);
  });

console.log('\n💡 Próximos passos:');
console.log('1. Revise o mapeamento em cloudinary-url-mapping.json');
console.log('2. Use o mapeamento para atualizar URLs no código');
console.log('3. Execute a reorganização no Cloudinary quando possível');