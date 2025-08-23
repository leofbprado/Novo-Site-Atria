#!/usr/bin/env node
// Script para adicionar atributos de otimização em todas as tags <img> e <video>

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Otimizando atributos de mídia (img/video)...\n');

// Backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupName = `backup-media-attrs-${timestamp}.tar.gz`;
console.log(`📦 Criando backup: ${backupName}`);
try {
  execSync(`tar -czf ${backupName} src/ public/`, { stdio: 'pipe' });
  console.log(`✅ Backup criado!\n`);
} catch (error) {
  console.log('⚠️  Backup falhou, continuando...\n');
}

// Configurações
const DIRECTORIES = ['src', 'public'];
const EXTENSIONS = ['.js', '.jsx', '.html'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

// Estatísticas
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  imagesOptimized: 0,
  videosOptimized: 0,
  errors: []
};

// Componentes conhecidos como above-the-fold
const ABOVE_THE_FOLD_COMPONENTS = [
  'Hero.jsx',
  'HeroBanner',
  'Header',
  'Navigation',
  'TopBar'
];

// Função para determinar se é above-the-fold
function isAboveTheFold(filePath, context) {
  // Verifica se está em componente above-the-fold
  for (const component of ABOVE_THE_FOLD_COMPONENTS) {
    if (filePath.includes(component)) {
      return true;
    }
  }
  
  // Verifica classes/ids específicos
  if (context.includes('hero') || context.includes('banner') || context.includes('header')) {
    return true;
  }
  
  return false;
}

// Função para extrair dimensões de URL do Cloudinary
function extractCloudinaryDimensions(url) {
  // Procura por w_XXX e h_XXX na URL
  const widthMatch = url.match(/w_(\d+)/);
  const heightMatch = url.match(/h_(\d+)/);
  
  if (widthMatch && heightMatch) {
    return {
      width: widthMatch[1],
      height: heightMatch[1]
    };
  }
  
  // Dimensões padrão baseadas em contexto comum
  if (url.includes('logo') || url.includes('brand')) {
    return { width: '150', height: '60' };
  }
  if (url.includes('banner')) {
    return { width: '1920', height: '600' };
  }
  if (url.includes('car') || url.includes('vehicle')) {
    return { width: '400', height: '300' };
  }
  
  return { width: '800', height: '600' }; // Padrão genérico
}

// Função para otimizar tag <img>
function optimizeImgTag(imgTag, filePath, fullContent) {
  let optimized = imgTag;
  const isAbove = isAboveTheFold(filePath, imgTag);
  
  // Adiciona loading
  if (!optimized.includes('loading=')) {
    const loadingValue = isAbove ? 'eager' : 'lazy';
    optimized = optimized.replace('<img', `<img loading="${loadingValue}"`);
  }
  
  // Adiciona decoding
  if (!optimized.includes('decoding=')) {
    optimized = optimized.replace('<img', '<img decoding="async"');
  }
  
  // Adiciona fetchpriority
  if (!optimized.includes('fetchpriority=')) {
    const priority = isAbove ? 'high' : 'low';
    optimized = optimized.replace('<img', `<img fetchpriority="${priority}"`);
  }
  
  // Adiciona width/height se não existir
  if (!optimized.includes('width=') || !optimized.includes('height=')) {
    // Tenta extrair src
    const srcMatch = optimized.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      const src = srcMatch[1];
      const dims = extractCloudinaryDimensions(src);
      
      if (!optimized.includes('width=')) {
        optimized = optimized.replace('<img', `<img width="${dims.width}"`);
      }
      if (!optimized.includes('height=')) {
        optimized = optimized.replace('<img', `<img height="${dims.height}"`);
      }
    }
  }
  
  // Limpa espaços duplos
  optimized = optimized.replace(/\s+/g, ' ');
  
  return optimized;
}

// Função para otimizar tag <video>
function optimizeVideoTag(videoTag) {
  let optimized = videoTag;
  
  // Adiciona preload
  if (!optimized.includes('preload=')) {
    optimized = optimized.replace('<video', '<video preload="none"');
  }
  
  // Adiciona loading
  if (!optimized.includes('loading=')) {
    optimized = optimized.replace('<video', '<video loading="lazy"');
  }
  
  // Adiciona fetchpriority
  if (!optimized.includes('fetchpriority=')) {
    optimized = optimized.replace('<video', '<video fetchpriority="low"');
  }
  
  // Adiciona atributos de autoplay se não existirem
  if (!optimized.includes('autoplay')) {
    optimized = optimized.replace('<video', '<video autoplay');
  }
  if (!optimized.includes('muted')) {
    optimized = optimized.replace('<video', '<video muted');
  }
  if (!optimized.includes('loop')) {
    optimized = optimized.replace('<video', '<video loop');
  }
  if (!optimized.includes('playsInline')) {
    optimized = optimized.replace('<video', '<video playsInline');
  }
  
  // Limpa espaços duplos
  optimized = optimized.replace(/\s+/g, ' ');
  
  return optimized;
}

// Função para processar arquivo
function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return;
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    return;
  }
  
  let originalContent = content;
  let imgCount = 0;
  let videoCount = 0;
  
  // Processa tags <img>
  // Regex para encontrar tags img completas (incluindo self-closing)
  const imgRegex = /<img[^>]*>/gi;
  content = content.replace(imgRegex, (match) => {
    const optimized = optimizeImgTag(match, filePath, originalContent);
    if (optimized !== match) {
      imgCount++;
    }
    return optimized;
  });
  
  // Processa tags <video>
  const videoRegex = /<video[^>]*>/gi;
  content = content.replace(videoRegex, (match) => {
    const optimized = optimizeVideoTag(match);
    if (optimized !== match) {
      videoCount++;
    }
    return optimized;
  });
  
  // Salva se houve mudanças
  if (content !== originalContent) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.imagesOptimized += imgCount;
      stats.videosOptimized += videoCount;
      
      if (imgCount > 0 || videoCount > 0) {
        console.log(`✅ ${filePath}`);
        if (imgCount > 0) console.log(`   📷 ${imgCount} imagens otimizadas`);
        if (videoCount > 0) console.log(`   🎬 ${videoCount} vídeos otimizados`);
      }
    } catch (error) {
      stats.errors.push({ file: filePath, error: error.message });
    }
  }
  
  stats.filesProcessed++;
}

// Função para processar diretório
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Diretório não encontrado: ${dir}`);
    return;
  }
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(item)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

// Processa todos os diretórios
console.log('🔍 Processando arquivos...\n');
DIRECTORIES.forEach(dir => {
  console.log(`📂 Processando ${dir}/...`);
  processDirectory(dir);
  console.log('');
});

// Resumo
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA OTIMIZAÇÃO DE MÍDIA:');
console.log('='.repeat(60));
console.log(`📁 Arquivos processados: ${stats.filesProcessed}`);
console.log(`✏️  Arquivos modificados: ${stats.filesModified}`);
console.log(`📷 Imagens otimizadas: ${stats.imagesOptimized}`);
console.log(`🎬 Vídeos otimizados: ${stats.videosOptimized}`);

if (stats.errors.length > 0) {
  console.log(`\n⚠️  Erros encontrados: ${stats.errors.length}`);
  stats.errors.slice(0, 5).forEach(err => {
    console.log(`  ${err.file}: ${err.error}`);
  });
}

// Verificação final
console.log('\n🔍 Verificando atributos faltantes...\n');

let missingAttrs = false;
DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      // Verifica imagens sem loading
      const imgCheck = execSync(
        `grep -r '<img' ${dir} --include="*.jsx" --include="*.js" | grep -v 'loading=' | head -3 || true`,
        { encoding: 'utf8' }
      );
      
      if (imgCheck.trim()) {
        console.log(`⚠️  Imagens sem loading="${dir}":`);
        const lines = imgCheck.trim().split('\n');
        lines.forEach(line => {
          const [file] = line.split(':');
          console.log(`  ${file}`);
        });
        missingAttrs = true;
      }
      
      // Verifica vídeos sem preload
      const videoCheck = execSync(
        `grep -r '<video' ${dir} --include="*.jsx" --include="*.js" | grep -v 'preload=' | head -3 || true`,
        { encoding: 'utf8' }
      );
      
      if (videoCheck.trim()) {
        console.log(`⚠️  Vídeos sem preload em ${dir}:`);
        const lines = videoCheck.trim().split('\n');
        lines.forEach(line => {
          const [file] = line.split(':');
          console.log(`  ${file}`);
        });
        missingAttrs = true;
      }
    } catch (e) {
      // Sem correspondências
    }
  }
});

if (!missingAttrs) {
  console.log('✅ Todos os elementos de mídia estão otimizados!');
}

console.log('\n✨ Otimização concluída!');
console.log('\n📌 BENEFÍCIOS DOS ATRIBUTOS:');
console.log('  • loading="lazy": Carregamento sob demanda');
console.log('  • decoding="async": Decodificação não-bloqueante');
console.log('  • fetchpriority: Priorização de recursos críticos');
console.log('  • width/height: Evita layout shift (CLS)');
console.log('  • preload="none": Economia de banda em vídeos');

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. Teste o site: npm run dev');
console.log('2. Verifique o carregamento progressivo');
console.log('3. Execute npm run build para produção');
console.log('4. Teste métricas no PageSpeed Insights');

// Salva relatório
const report = {
  timestamp: new Date().toISOString(),
  backup: backupName,
  stats: {
    filesProcessed: stats.filesProcessed,
    filesModified: stats.filesModified,
    imagesOptimized: stats.imagesOptimized,
    videosOptimized: stats.videosOptimized,
    errors: stats.errors.length
  }
};

fs.writeFileSync('media-optimization-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Relatório salvo em: media-optimization-report.json');