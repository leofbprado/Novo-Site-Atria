#!/usr/bin/env node
// Script para corrigir atributos duplicados e React props em vídeos

import fs from 'fs';
import path from 'path';

console.log('🔧 Corrigindo atributos de vídeo...\n');

// Função para corrigir atributos de vídeo
function fixVideoAttributes(content) {
  // Corrige autoplay para autoPlay (React)
  content = content.replace(/(\<video[^>]*)\s+autoplay(\s|>)/gi, '$1 autoPlay$2');
  
  // Corrige muted para muted (já está correto)
  // Corrige loop para loop (já está correto)
  
  // Corrige playsInline para playsInline (já está correto no React)
  content = content.replace(/(\<video[^>]*)\s+playsinline(\s|>)/gi, '$1 playsInline$2');
  
  return content;
}

// Processa arquivos JSX/JS
function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Corrige atributos de vídeo
  content = fixVideoAttributes(content);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath}: atributos de vídeo corrigidos`);
  }
}

// Processa diretório src recursivamente
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

processDirectory('./src');
console.log('\n✅ Correção de atributos de vídeo concluída!');