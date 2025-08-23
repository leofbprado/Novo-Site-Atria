#!/usr/bin/env node

/**
 * Análise do vendor-misc bundle para otimização do primeiro paint
 * Identifica dependências críticas vs não-críticas
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Analisando vendor-misc para otimização de primeiro paint...\n');

// Mapear componentes críticos vs não-críticos
const criticalComponents = [
  'Hero', 'Cars', 'SmartSearchInput', 'Header'
];

const nonCriticalComponents = [
  'Footer', 'MobileMenu', 'FilterSidebar', 'Testimonials', 
  'Blogs', 'About', 'ContactForm', 'SellCarPage'
];

const criticalLibs = [
  'react', 'react-dom', 'react-router-dom'
];

const nonCriticalLibs = [
  'framer-motion', 'react-slick', 'chart.js', 'photoswipe',
  'react-modal-video', 'xlsx', 'cloudinary'
];

console.log('📊 COMPONENTES CRÍTICOS (primeiro paint):');
criticalComponents.forEach(comp => console.log(`  ✅ ${comp}`));

console.log('\n📊 COMPONENTES NÃO-CRÍTICOS (lazy loading):');
nonCriticalComponents.forEach(comp => console.log(`  ⚡ ${comp} -> React.lazy()`));

console.log('\n📚 BIBLIOTECAS CRÍTICAS:');
criticalLibs.forEach(lib => console.log(`  🔧 ${lib}`));

console.log('\n📚 BIBLIOTECAS NÃO-CRÍTICAS:');
nonCriticalLibs.forEach(lib => console.log(`  🚀 ${lib} -> code splitting`));

// Análise do build atual
const distPath = './dist';
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  const vendorFiles = files.filter(f => f.startsWith('vendor-') && f.endsWith('.js'));
  
  console.log('\n🗂️  VENDOR BUNDLES ATUAIS:');
  vendorFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  📦 ${file}: ${sizeKB} KB`);
  });
}

console.log('\n🎯 RECOMENDAÇÕES DE OTIMIZAÇÃO:');
console.log('1. Separar vendor-misc em crítico/não-crítico');
console.log('2. Implementar React.lazy nos componentes não essenciais');
console.log('3. Inline pequenas funções JS diretamente no HTML');
console.log('4. Preload apenas bibliotecas críticas');
console.log('5. Lazy load bibliotecas de interação (motion, charts)');

console.log('\n✅ Análise concluída!');