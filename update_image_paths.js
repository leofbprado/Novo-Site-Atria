#!/usr/bin/env node

/**
 * Script para atualizar caminhos de imagens no código JSX
 * Substitui imagens antigas por versões otimizadas WebP
 */

import fs from 'fs';
import path from 'path';

// Mapeamento de arquivos otimizados
const optimizedImages = {
  '/images/financing-calculator-backup-backup.png': '/images/optimized/financing-calculator-backup-backup.webp',
  '/images/financing-calculator-backup.png': '/images/optimized/financing-calculator-backup.webp', 
  '/images/financing-calculator.png': '/images/optimized/financing-calculator.webp',
  '/images/atria-logo-final.png': '/images/optimized/atria-logo-final.webp',
  '/images/atria-logo-white.png': '/images/optimized/atria-logo-white.webp',
  '/images/logo.png': '/images/optimized/logo.webp',
  // Adicionar mais conforme necessário
};

// Função para encontrar arquivos JSX/JS recursivamente
function findJSXFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
      findJSXFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.jsx') || item.endsWith('.js') || item.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Função para atualizar um arquivo
function updateFile(filePath) {
  console.log(`🔍 Analisando: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  let changes = [];
  
  // Substituir cada imagem otimizada
  for (const [oldPath, newPath] of Object.entries(optimizedImages)) {
    // Padrões de busca diferentes
    const patterns = [
      new RegExp(`src=['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`src={['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        const newContent = content.replace(pattern, (match) => {
          if (match.includes('src=')) {
            return match.replace(oldPath, newPath);
          } else {
            return match.replace(oldPath, newPath);
          }
        });
        
        if (newContent !== content) {
          content = newContent;
          updated = true;
          changes.push(`${oldPath} → ${newPath}`);
        }
      }
    }
  }
  
  // Salvar arquivo se houve mudanças
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Atualizado! Mudanças:`);
    changes.forEach(change => console.log(`    📄 ${change}`));
  } else {
    console.log(`  ➖ Nenhuma imagem encontrada`);
  }
  
  return updated;
}

// Função principal
function main() {
  console.log('🚀 ATUALIZANDO CAMINHOS DE IMAGENS');
  console.log('===================================');
  console.log('🎯 Substituindo por versões WebP otimizadas\n');
  
  // Encontrar todos os arquivos JSX/JS
  const srcFiles = findJSXFiles('./src');
  const publicFiles = findJSXFiles('./public').filter(f => f.endsWith('.html'));
  const allFiles = [...srcFiles, ...publicFiles];
  
  console.log(`📂 Encontrados ${allFiles.length} arquivos para analisar\n`);
  
  let totalUpdated = 0;
  
  // Processar cada arquivo
  for (const file of allFiles) {
    if (updateFile(file)) {
      totalUpdated++;
    }
    console.log('');
  }
  
  console.log('🎉 ATUALIZAÇÃO CONCLUÍDA!');
  console.log('========================');
  console.log(`📊 Arquivos atualizados: ${totalUpdated}/${allFiles.length}`);
  console.log(`🚀 Imagens otimizadas: ${Object.keys(optimizedImages).length}`);
  
  if (totalUpdated > 0) {
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Testar o site para verificar se as imagens carregam');
    console.log('2. Verificar se não há imagens quebradas');
    console.log('3. Executar build para produção');
    console.log('4. Medir melhoria de performance');
  }
}

// Executar automaticamente
main();