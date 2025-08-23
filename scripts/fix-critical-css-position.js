#!/usr/bin/env node

/**
 * Fix Critical CSS Position
 * Move CSS crítico para o início do <head> e remove blocos vazios
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixCriticalCSSPosition() {
  const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Arquivo dist/index.html não encontrado');
    return false;
  }

  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // 1. Remove todos os blocos <style> vazios
  htmlContent = htmlContent.replace(/<style>\s*<\/style>/g, '');
  
  // 2. Remove blocos de style com apenas comentários vazios
  htmlContent = htmlContent.replace(/<style>\s*\/\*[^*]*\*\/\s*<\/style>/g, '');
  
  // 3. Remove style tags com id específicos vazios
  htmlContent = htmlContent.replace(/<style[^>]*id="[^"]*"[^>]*>\s*<\/style>/g, '');
  
  // 3.5. Remove o bloco de CSS antigo com fonte Inter
  htmlContent = htmlContent.replace(/<style>\s*\/\*\s*CSS crítico[^<]*Inter[^<]*<\/style>/g, '');
  
  // 4. Extrai o CSS crítico atual (se existir)
  const criticalCSSMatch = htmlContent.match(/<style data-critical-css="true">([\s\S]*?)<\/style>/);
  
  if (!criticalCSSMatch) {
    console.error('❌ CSS crítico não encontrado');
    return false;
  }
  
  const criticalCSS = criticalCSSMatch[0];
  
  // 5. Remove o CSS crítico da posição atual
  htmlContent = htmlContent.replace(criticalCSSMatch[0], '');
  
  // 6. Remove link deferido duplicado se existir
  htmlContent = htmlContent.replace(/<link[^>]*data-deferred-css="true"[^>]*>/g, '');
  htmlContent = htmlContent.replace(/<noscript><link[^>]*href="[^"]*\/assets\/css\/[^"]*"[^>]*><\/noscript>/g, '');
  
  // 7. Insere CSS crítico logo após <meta charset>
  const metaCharsetMatch = htmlContent.match(/<meta charset="UTF-8"[^>]*>/);
  if (metaCharsetMatch) {
    const insertPosition = htmlContent.indexOf(metaCharsetMatch[0]) + metaCharsetMatch[0].length;
    htmlContent = htmlContent.slice(0, insertPosition) + 
                  '\n    ' + criticalCSS + 
                  htmlContent.slice(insertPosition);
  }
  
  // 8. Adiciona link deferido antes do </head>
  const mainCSSFile = 'css/index-Cvlvu5bl.css';
  const deferredCSS = `
  <link rel="preload" href="/assets/${mainCSSFile}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/assets/${mainCSSFile}"></noscript>`;
  
  htmlContent = htmlContent.replace('</head>', deferredCSS + '\n</head>');
  
  // 9. Remove espaços em branco extras
  htmlContent = htmlContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Salva o HTML corrigido
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  console.log('✅ CSS crítico movido para posição correta');
  console.log('✅ Blocos <style> vazios removidos');
  console.log('✅ HTML otimizado para melhor FCP');
  
  return true;
}

// Executa a correção
if (import.meta.url === `file://${process.argv[1]}`) {
  fixCriticalCSSPosition();
}

export default fixCriticalCSSPosition;