#!/usr/bin/env node
// Script corrigido para detectar assets realmente utilizados

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Análise Corrigida de Assets no Código\n');

// Função para buscar strings de forma mais precisa
function searchInFiles(searchTerm) {
  try {
    // Busca mais simples e direta
    const result = execSync(
      `find src/ public/ -name "*.jsx" -o -name "*.js" -o -name "*.css" -o -name "*.html" | xargs grep -l "${searchTerm}" 2>/dev/null | head -5 || true`,
      { encoding: 'utf8' }
    ).trim();
    
    return result.length > 0;
  } catch (error) {
    return false;
  }
}

// Testa alguns assets conhecidos
console.log('🧪 Testando detecção com assets conhecidos:\n');

const testAssets = [
  'atria-site/images/brands/brand-fiat',
  'atria-site/images/resource/logo',
  'res.cloudinary.com',
  'dyngqkiyl',
  'financing-calculator',
  'sell-car-cta'
];

testAssets.forEach(asset => {
  const found = searchInFiles(asset);
  console.log(`${found ? '✅' : '❌'} ${asset}: ${found ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
});

// Vamos ver o que realmente existe nos arquivos
console.log('\n📋 Sample do que existe nos arquivos:\n');

try {
  const sampleFiles = [
    'src/components/homes/home-1/Hero.jsx',
    'src/components/homes/home-1/Cars.jsx',
    'src/components/common/OptimizedImage.jsx'
  ];
  
  sampleFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 ${file}:`);
      const content = fs.readFileSync(file, 'utf8');
      
      // Procura por padrões de URL
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('res.cloudinary.com') || 
            line.includes('i.postimg.cc') || 
            line.includes('atria-') ||
            line.includes('cloudinary')) {
          console.log(`  Linha ${i + 1}: ${line.trim().substring(0, 100)}...`);
        }
      });
      console.log('');
    }
  });
} catch (error) {
  console.log('Erro ao ler arquivos sample:', error.message);
}

// Método melhorado para encontrar assets
console.log('🎯 Buscando todos os padrões de URL/asset:\n');

const patterns = [
  'res\\.cloudinary\\.com',
  'i\\.postimg\\.cc', 
  'lirp\\.cdn-website\\.com',
  'atria-site',
  'atria-veiculos',
  'cloudinary',
  'postimg',
  'financing-calculator',
  'sell-car'
];

let foundAssets = new Set();

patterns.forEach(pattern => {
  try {
    const result = execSync(
      `find src/ public/ -name "*.jsx" -o -name "*.js" -o -name "*.css" -o -name "*.html" | xargs grep -h "${pattern}" 2>/dev/null || true`,
      { encoding: 'utf8' }
    );
    
    const lines = result.trim().split('\n').filter(line => line.trim());
    console.log(`🔍 ${pattern}: ${lines.length} ocorrências encontradas`);
    
    lines.slice(0, 3).forEach(line => {
      console.log(`  ${line.trim().substring(0, 80)}...`);
      foundAssets.add(line.trim());
    });
    console.log('');
  } catch (error) {
    console.log(`❌ Erro buscando ${pattern}: ${error.message}`);
  }
});

console.log(`📊 Total de linhas únicas encontradas: ${foundAssets.size}`);

// Salva resultado para análise
const result = {
  timestamp: new Date().toISOString(),
  testResults: testAssets.map(asset => ({
    asset,
    found: searchInFiles(asset)
  })),
  totalLinesFound: foundAssets.size,
  sampleLines: Array.from(foundAssets).slice(0, 20)
};

fs.writeFileSync('asset-detection-debug.json', JSON.stringify(result, null, 2));
console.log('📄 Debug salvo em: asset-detection-debug.json');