#!/usr/bin/env node
// Script para analisar rapidamente quais assets estão sendo usados no código

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 Análise Rápida de Assets no Código\n');

// Função para extrair URLs/public_ids do código
function extractAssetsFromCode() {
  console.log('📋 Extraindo referencias de assets do código...\n');
  
  const patterns = [
    // URLs do Cloudinary
    'res\\.cloudinary\\.com/[^/]+/[^/]+/[^/]+/[^\\s"\']+',
    // Public IDs diretos
    'atria-veiculos/[^\\s"\']+',
    // URLs de outras CDNs que podem estar sendo usadas
    'i\\.postimg\\.cc/[^\\s"\']+',
    'lirp\\.cdn-website\\.com/[^\\s"\']+'
  ];
  
  let allMatches = new Set();
  
  patterns.forEach((pattern, index) => {
    console.log(`🔍 Padrão ${index + 1}: ${pattern}`);
    
    try {
      const result = execSync(
        `grep -r -o -E "${pattern}" src/ public/ --include="*.jsx" --include="*.js" --include="*.css" --include="*.html" 2>/dev/null || true`,
        { encoding: 'utf8' }
      );
      
      const matches = result.trim().split('\n').filter(match => match.trim());
      matches.forEach(match => allMatches.add(match.trim()));
      
      console.log(`  📦 ${matches.length} matches encontrados`);
    } catch (error) {
      console.log(`  ❌ Erro no padrão: ${error.message}`);
    }
  });
  
  return Array.from(allMatches);
}

// Função principal
function analyzeCodeAssets() {
  const usedAssets = extractAssetsFromCode();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ASSETS ENCONTRADOS NO CÓDIGO:');
  console.log('='.repeat(60));
  console.log(`Total: ${usedAssets.length} referencias\n`);
  
  // Agrupa por tipo
  const groups = {
    cloudinary: [],
    postimg: [],
    lirp: [],
    outros: []
  };
  
  usedAssets.forEach(asset => {
    if (asset.includes('res.cloudinary.com') || asset.startsWith('atria-veiculos/')) {
      groups.cloudinary.push(asset);
    } else if (asset.includes('i.postimg.cc')) {
      groups.postimg.push(asset);
    } else if (asset.includes('lirp.cdn-website.com')) {
      groups.lirp.push(asset);
    } else {
      groups.outros.push(asset);
    }
  });
  
  console.log('🔹 CLOUDINARY ASSETS:');
  groups.cloudinary.forEach((asset, i) => {
    console.log(`  ${i + 1}. ${asset}`);
  });
  
  console.log(`\n🔹 POSTIMG ASSETS: ${groups.postimg.length}`);
  groups.postimg.slice(0, 10).forEach((asset, i) => {
    console.log(`  ${i + 1}. ${asset}`);
  });
  if (groups.postimg.length > 10) {
    console.log(`  ... e mais ${groups.postimg.length - 10}`);
  }
  
  console.log(`\n🔹 LIRP CDN ASSETS: ${groups.lirp.length}`);
  groups.lirp.slice(0, 10).forEach((asset, i) => {
    console.log(`  ${i + 1}. ${asset}`);
  });
  if (groups.lirp.length > 10) {
    console.log(`  ... e mais ${groups.lirp.length - 10}`);
  }
  
  if (groups.outros.length > 0) {
    console.log(`\n🔹 OUTROS: ${groups.outros.length}`);
    groups.outros.forEach((asset, i) => {
      console.log(`  ${i + 1}. ${asset}`);
    });
  }
  
  // Salva resultado
  const result = {
    timestamp: new Date().toISOString(),
    total: usedAssets.length,
    groups,
    allAssets: usedAssets
  };
  
  fs.writeFileSync('code-assets-analysis.json', JSON.stringify(result, null, 2));
  console.log('\n📄 Análise salva em: code-assets-analysis.json');
  
  return result;
}

analyzeCodeAssets();