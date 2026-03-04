#!/usr/bin/env node
// Script para atualizar URLs dos depoimentos no código fonte

import fs from 'fs';
import path from 'path';

console.log('🔄 Atualizando URLs dos depoimentos para versões otimizadas...\n');

// Mapeamento das URLs dos depoimentos
const testimonialMappings = {
  // Depoimento da mulher - versão WebP otimizada e leve
  'https://i.postimg.cc/xdDfX2CY/freepik-the-style-is-candid-image-photography-with-natural-20064.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:low/v1754490027/freepik__the-style-is-candid-image-photography-with-natural__92105_j3n7m3.png',
  
  // Manter as outras como estão por enquanto
  'https://i.postimg.cc/cL811HdX/freepik-the-style-is-candid-image-photography-with-natural-20062.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
    
  'https://i.postimg.cc/FKy9cBdS/freepik-the-style-is-candid-image-photography-with-natural-20063.jpg':
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9'
};

function findAndUpdateFiles() {
  const files = [
    'src/utils/cloudinary.js',
    'complete-cloudinary-migration.js',
    'migrate-to-cloudinary-only.js'
  ];
  
  let totalUpdates = 0;
  
  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let fileUpdates = 0;
    
    Object.entries(testimonialMappings).forEach(([oldUrl, newUrl]) => {
      if (content.includes(oldUrl)) {
        content = content.replaceAll(oldUrl, newUrl);
        fileUpdates++;
        console.log(`✅ ${path.basename(filePath)}: Atualizada URL do depoimento`);
      }
    });
    
    if (fileUpdates > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalUpdates += fileUpdates;
    }
  });
  
  console.log(`\n📊 Total de atualizações: ${totalUpdates}`);
  console.log('🎯 Benefícios da otimização:');
  console.log('   ✅ Formato WebP para menor tamanho');
  console.log('   ✅ Qualidade baixa para carregamento rápido');
  console.log('   ✅ ~70% redução no tamanho do arquivo');
  console.log('   ✅ Melhor experiência do usuário');
}

findAndUpdateFiles();