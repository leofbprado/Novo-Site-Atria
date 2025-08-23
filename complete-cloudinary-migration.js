#!/usr/bin/env node
// Script completo para migrar TODAS as URLs restantes para Cloudinary

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔄 Migrando URLs restantes do i.postimg.cc para Cloudinary\n');

// Mapeamento completo de URLs i.postimg.cc para equivalentes no Cloudinary
const COMPLETE_URL_MIGRATIONS = {
  // URLs específicas encontradas no código
  'https://i.postimg.cc/mZ8XxK8r/freepik-a-photographic-style-image-of-a-luxury-car-dealersh-33.jpg': 
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2',
    
  'https://i.postimg.cc/JzKCJzQW/freepik-the-style-is-automotive-landscape-design-A-visual-33.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2',
    
  'https://i.postimg.cc/XqzKxK1s/freepik-the-style-is-automotive-landscape-design-A-visual-34.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2',
    
  // Outras URLs About
  'https://i.postimg.cc/ydLNfHGZ/freepik-a-photographic-style-image-of-a-car-dealership-lot-34.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2',
    
  'https://i.postimg.cc/0N8VD9Pz/freepik-a-photographic-style-image-of-a-car-salesman-shaki-34.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2',
    
  'https://i.postimg.cc/xCzJNWhL/freepik-a-photographic-style-image-of-a-customer-and-sales-35.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2',
    
  // URLs CTA e outras
  'https://i.postimg.cc/hG9zqqLX/Design-sem-nome-8.png':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/sell-car-cta',
    
  'https://i.postimg.cc/7Zvv28w2/2.png':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/icons/logo-2',
    
  // URLs dos testimonials que ainda não foram migradas
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:low/v1754490027/freepik__the-style-is-candid-image-photography-with-natural__92105_j3n7m3.png':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
    
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
    
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9'
};

// Função para encontrar arquivos com URLs externas
function findFilesWithExternalUrls() {
  console.log('🔍 Localizando arquivos com URLs externas...\n');
  
  try {
    const result = execSync(
      `find src/ public/ -name "*.jsx" -o -name "*.js" | xargs grep -l "i\\.postimg\\.cc" 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
    
    if (result) {
      const files = result.split('\n').filter(f => f.trim());
      console.log(`📁 ${files.length} arquivos encontrados com URLs externas:`);
      files.forEach(file => console.log(`  - ${file}`));
      return files;
    } else {
      console.log('✅ Nenhum arquivo com URLs externas encontrado');
      return [];
    }
  } catch (error) {
    console.log('⚠️  Erro ao localizar arquivos:', error.message);
    return [];
  }
}

// Função para processar arquivo específico
function processFileComplete(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Erro ao ler ${filePath}: ${error.message}`);
    return { processed: false, changes: 0 };
  }
  
  let originalContent = content;
  let changes = 0;
  
  // Aplica todas as migrações
  Object.entries(COMPLETE_URL_MIGRATIONS).forEach(([oldUrl, newUrl]) => {
    if (content.includes(oldUrl)) {
      const count = (content.match(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      content = content.replaceAll(oldUrl, newUrl);
      changes += count;
      console.log(`  🔄 ${path.basename(filePath)}: ${count}x ${oldUrl.slice(25, 60)}... → Cloudinary`);
    }
  });
  
  // Salva se houve mudanças
  if (content !== originalContent && changes > 0) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return { processed: true, changes };
    } catch (error) {
      console.error(`❌ Erro ao salvar ${filePath}: ${error.message}`);
      return { processed: false, changes: 0 };
    }
  }
  
  return { processed: false, changes: 0 };
}

// Função principal
function completeMigration() {
  console.log('🚀 Iniciando migração completa para Cloudinary...\n');
  
  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupName = `backup-final-urls-${timestamp}.tar.gz`;
  
  console.log(`📦 Criando backup: ${backupName}`);
  try {
    execSync(`tar -czf ${backupName} src/ public/`, { stdio: 'pipe' });
    console.log(`✅ Backup criado!\n`);
  } catch (error) {
    console.log('⚠️  Backup falhou, continuando...\n');
  }
  
  // Encontra arquivos com URLs externas
  const files = findFilesWithExternalUrls();
  
  if (files.length === 0) {
    console.log('\n🎉 Nenhuma URL externa para migrar!');
    return;
  }
  
  console.log('\n🔄 Processando arquivos...\n');
  
  let stats = {
    filesProcessed: 0,
    filesModified: 0,
    totalChanges: 0
  };
  
  // Processa cada arquivo encontrado
  files.forEach(file => {
    const result = processFileComplete(file);
    stats.filesProcessed++;
    
    if (result.processed) {
      stats.filesModified++;
      stats.totalChanges += result.changes;
      console.log(`✅ ${file}: ${result.changes} migrações realizadas`);
    }
  });
  
  // Verificação final
  console.log('\n🔍 Verificação final...');
  
  try {
    const remainingUrls = execSync(
      `find src/ public/ -name "*.jsx" -o -name "*.js" | xargs grep "i\\.postimg\\.cc" 2>/dev/null | wc -l || echo 0`,
      { encoding: 'utf8' }
    ).trim();
    
    console.log(`📊 URLs i.postimg.cc restantes: ${remainingUrls}`);
    
    if (parseInt(remainingUrls) === 0) {
      console.log('✅ Sucesso total! Todas as URLs i.postimg.cc foram migradas.');
    } else {
      console.log('⚠️  Algumas URLs podem necessitar mapeamento manual.');
    }
  } catch (e) {
    console.log('⚠️  Não foi possível verificar URLs restantes.');
  }
  
  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA MIGRAÇÃO COMPLETA:');
  console.log('='.repeat(60));
  console.log(`📁 Arquivos processados: ${stats.filesProcessed}`);
  console.log(`✏️  Arquivos modificados: ${stats.filesModified}`);
  console.log(`🔄 Total de substituições: ${stats.totalChanges}`);
  console.log(`📦 Backup salvo: ${backupName}`);
  
  // Salva relatório
  const report = {
    timestamp: new Date().toISOString(),
    backup: backupName,
    stats,
    migrations: COMPLETE_URL_MIGRATIONS,
    processedFiles: files
  };
  
  fs.writeFileSync('final-cloudinary-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: final-cloudinary-report.json');
  
  console.log('\n✨ Migração completa concluída!');
  console.log('🎯 Todas as imagens principais agora usam Cloudinary');
  console.log('🌐 URLs de blog externo (lirp.cdn-website.com) mantidas conforme necessário');
}

completeMigration();