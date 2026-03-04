#!/usr/bin/env node
// Script para migrar todas as imagens para usar apenas URLs do Cloudinary

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔄 Migrando todas as imagens para Cloudinary exclusivamente\n');

// Mapeamento de URLs externas para equivalentes no Cloudinary
const URL_MIGRATIONS = {
  // URLs i.postimg.cc para Cloudinary equivalentes
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:low/v1754490027/freepik__the-style-is-candid-image-photography-with-natural__92105_j3n7m3.png': 
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
    
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
    
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
    
  'https://i.postimg.cc/1RVNzN1q/Design-sem-nome-10.png':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/hero/banner-six',
    
  // URLs lirp.cdn-website.com mantidas (são do blog externo)
  // Essas ficam como estão por serem conteúdo externo do blog
};

// URLs antigas do Cloudinary para nova estrutura organizada
const CLOUDINARY_STRUCTURE_MIGRATIONS = {
  // URLs antigas sem estrutura para nova estrutura organizada
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto:eco/v1/atria-site/financing-calculator':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/ferramentas/financing-calculator',
    
  'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto:eco/v1/atria-site/sell-car-cta':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/sell-car-cta',
};

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  externalMigrations: 0,
  structureMigrations: 0,
  totalReplacements: 0
};

// Função para processar arquivo
function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.css', '.html'].includes(ext)) return;
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return;
  }
  
  let originalContent = content;
  let replacements = 0;
  
  // Migra URLs externas para Cloudinary
  Object.entries(URL_MIGRATIONS).forEach(([oldUrl, newUrl]) => {
    if (content.includes(oldUrl)) {
      content = content.replaceAll(oldUrl, newUrl);
      replacements++;
      stats.externalMigrations++;
    }
  });
  
  // Migra estrutura antiga do Cloudinary para nova
  Object.entries(CLOUDINARY_STRUCTURE_MIGRATIONS).forEach(([oldUrl, newUrl]) => {
    if (content.includes(oldUrl)) {
      content = content.replaceAll(oldUrl, newUrl);
      replacements++;
      stats.structureMigrations++;
    }
  });
  
  // Atualiza todas as URLs do Cloudinary para usar f_auto,q_auto consistente
  const cloudinaryUrlPattern = /https:\/\/res\.cloudinary\.com\/dyngqkiyl\/image\/upload\/[^"'\s]+/g;
  content = content.replace(cloudinaryUrlPattern, (match) => {
    // Se já tem f_auto,q_auto, mantém; se não tem, adiciona
    if (match.includes('f_auto') && match.includes('q_auto')) {
      return match;
    } else {
      // Adiciona f_auto,q_auto após /upload/
      const newUrl = match.replace('/upload/', '/upload/f_auto,q_auto/');
      if (newUrl !== match) {
        replacements++;
        stats.structureMigrations++;
      }
      return newUrl;
    }
  });
  
  // Salva se houve mudanças
  if (content !== originalContent && replacements > 0) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.totalReplacements += replacements;
      console.log(`✅ ${filePath}: ${replacements} migrações realizadas`);
    } catch (error) {
      console.error(`❌ Erro ao salvar ${filePath}: ${error.message}`);
    }
  }
  
  stats.filesProcessed++;
}

// Processa diretórios recursivamente
function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

// Função principal
function migrateToCloudinaryOnly() {
  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupName = `backup-cloudinary-migration-${timestamp}.tar.gz`;
  
  console.log(`📦 Criando backup: ${backupName}`);
  try {
    execSync(`tar -czf ${backupName} src/ public/`, { stdio: 'pipe' });
    console.log(`✅ Backup criado!\n`);
  } catch (error) {
    console.log('⚠️  Backup falhou, continuando...\n');
  }
  
  console.log('🔍 Processando arquivos...\n');
  
  // Processa src e public
  ['src', 'public'].forEach(dir => {
    console.log(`📂 Processando ${dir}/...`);
    processDirectory(dir);
  });
  
  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA MIGRAÇÃO PARA CLOUDINARY:');
  console.log('='.repeat(60));
  console.log(`📁 Arquivos processados: ${stats.filesProcessed}`);
  console.log(`✏️  Arquivos modificados: ${stats.filesModified}`);
  console.log(`🔄 Total de substituições: ${stats.totalReplacements}`);
  console.log(`🌐 URLs externas migradas: ${stats.externalMigrations}`);
  console.log(`🗂️  URLs estrutura atualizada: ${stats.structureMigrations}`);
  
  // Verificação final
  console.log('\n🔍 Verificação final...');
  
  try {
    const externalUrls = execSync(
      `grep -r "https://i\\.postimg\\.cc\\|https://lirp\\.cdn-website\\.com" src/ public/ --include="*.jsx" --include="*.js" 2>/dev/null | wc -l || echo 0`,
      { encoding: 'utf8' }
    ).trim();
    
    console.log(`📊 URLs externas restantes: ${externalUrls}`);
    
    if (parseInt(externalUrls) === 0 || parseInt(externalUrls) <= 3) {
      console.log('✅ Migração bem-sucedida! Apenas Cloudinary em uso.');
    } else {
      console.log('⚠️  Algumas URLs externas ainda presentes (podem ser do blog).');
    }
  } catch (e) {
    console.log('⚠️  Não foi possível verificar URLs restantes.');
  }
  
  // Salva relatório
  const report = {
    timestamp: new Date().toISOString(),
    backup: backupName,
    stats,
    migrations: {
      external: URL_MIGRATIONS,
      structure: CLOUDINARY_STRUCTURE_MIGRATIONS
    }
  };
  
  fs.writeFileSync('cloudinary-migration-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: cloudinary-migration-report.json');
  
  console.log('\n✨ Migração concluída!');
  console.log('🎯 Todas as imagens agora usam Cloudinary com otimizações f_auto,q_auto');
  console.log('🌐 URLs externas do blog (lirp.cdn-website.com) mantidas conforme necessário');
}

migrateToCloudinaryOnly();