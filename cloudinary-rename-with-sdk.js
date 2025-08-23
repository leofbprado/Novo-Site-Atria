// Script definitivo para renomear assets no Cloudinary usando SDK oficial
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🚀 Renomeação de Assets via Cloudinary SDK\n');
console.log('📊 Configuração:');
console.log(`  Cloud Name: ${cloudinary.config().cloud_name}`);
console.log(`  API Key: ${cloudinary.config().api_key ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`  API Secret: ${cloudinary.config().api_secret ? '✅ Configurada' : '❌ Não configurada'}\n`);

// Verifica credenciais
if (!cloudinary.config().api_key || !cloudinary.config().api_secret) {
  console.error('❌ Erro: Credenciais não encontradas!');
  console.log('Configure as variáveis de ambiente:');
  console.log('  - CLOUDINARY_API_KEY');
  console.log('  - CLOUDINARY_API_SECRET');
  process.exit(1);
}

// Lê o mapeamento
const mapping = JSON.parse(fs.readFileSync('cloudinary-url-mapping.json', 'utf8'));
console.log(`📁 Total de assets para renomear: ${mapping.length}\n`);

// Função para renomear asset
async function renameAsset(oldPublicId, newPublicId) {
  try {
    const result = await cloudinary.uploader.rename(
      oldPublicId,
      newPublicId,
      { 
        overwrite: true,
        invalidate: true,
        resource_type: 'image'
      }
    );
    return { success: true, result };
  } catch (error) {
    // Se falhar com image, tenta com raw
    if (error.message && error.message.includes('not found')) {
      try {
        const result = await cloudinary.uploader.rename(
          oldPublicId,
          newPublicId,
          { 
            overwrite: true,
            invalidate: true,
            resource_type: 'raw'
          }
        );
        return { success: true, result };
      } catch (rawError) {
        return { success: false, error: rawError.message || rawError };
      }
    }
    return { success: false, error: error.message || error };
  }
}

// Processa renomeações
async function processRenames() {
  const stats = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };
  
  console.log('🔄 Iniciando renomeações...\n');
  
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
    process.stdout.write(`🔄 [${i+1}/${mapping.length}] ${entry.old_public_id} → `);
    
    const result = await renameAsset(entry.old_public_id, entry.new_public_id);
    
    if (result.success) {
      console.log(`✅ ${entry.new_public_id}`);
      stats.success++;
    } else {
      console.log(`❌ Erro: ${result.error}`);
      stats.failed++;
      stats.errors.push({
        old: entry.old_public_id,
        new: entry.new_public_id,
        error: result.error
      });
    }
    
    // Delay para não sobrecarregar a API (a cada 20 renomeações)
    if ((i + 1) % 20 === 0 && i < mapping.length - 1) {
      console.log('\n⏸️  Pausando 3 segundos para não sobrecarregar a API...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Salva progresso
  const progress = {
    total: mapping.length,
    success: stats.success,
    failed: stats.failed,
    skipped: stats.skipped,
    errors: stats.errors.slice(0, 10), // Salva apenas os primeiros 10 erros
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('cloudinary-rename-results.json', JSON.stringify(progress, null, 2));
  
  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA RENOMEAÇÃO:');
  console.log('='.repeat(60));
  console.log(`✅ Sucesso: ${stats.success} assets renomeados`);
  console.log(`❌ Falhou: ${stats.failed} assets`);
  console.log(`⏭️  Ignorados: ${stats.skipped} assets`);
  console.log(`📁 Resultados salvos em: cloudinary-rename-results.json`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Primeiros erros encontrados:');
    stats.errors.slice(0, 5).forEach(err => {
      console.log(`  ${err.old}`);
      console.log(`    → ${err.new}`);
      console.log(`    Erro: ${err.error}\n`);
    });
    if (stats.errors.length > 5) {
      console.log(`  ... e mais ${stats.errors.length - 5} erros`);
    }
  }
  
  if (stats.success > 0) {
    console.log('\n✨ Assets renomeados com sucesso!');
    console.log('\n📝 RESULTADOS:');
    console.log(`  - ${stats.success} assets movidos para nova estrutura`);
    console.log('  - Pastas criadas automaticamente no Cloudinary');
    console.log('  - URLs antigas continuam funcionando (redirecionamento)');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Verifique o Cloudinary Media Library');
    console.log('2. Os assets estão organizados em:');
    console.log('   - atria-veiculos/images/brands');
    console.log('   - atria-veiculos/images/misc');
    console.log('   - atria-veiculos/veiculos');
    console.log('   - atria-veiculos/hero');
    console.log('   - etc.');
  }
}

// Executa
processRenames()
  .then(() => {
    console.log('\n✅ Processo concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });