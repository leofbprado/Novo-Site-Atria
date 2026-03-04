#!/usr/bin/env node
// Script para atualizar URLs do Cloudinary existentes no código

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔄 Atualizando URLs do Cloudinary para versão otimizada...\n');

// Backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupName = `backup-cloudinary-update-${timestamp}.tar.gz`;
console.log(`📦 Criando backup: ${backupName}`);
try {
  execSync(`tar -czf ${backupName} src/ public/`, { stdio: 'pipe' });
  console.log(`✅ Backup criado!\n`);
} catch (error) {
  console.log('⚠️  Backup falhou, continuando...\n');
}

// Configurações
const DIRECTORIES = ['src', 'public'];
const EXTENSIONS = ['.js', '.jsx', '.css', '.html'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

// Estatísticas
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  totalReplacements: 0,
  urlsFound: new Set(),
  urlsReplaced: new Set()
};

// Função para otimizar URL do Cloudinary
function optimizeCloudinaryUrl(url) {
  // Verifica se é uma URL do Cloudinary
  if (!url.includes('res.cloudinary.com/dyngqkiyl')) {
    return url;
  }
  
  // Se já tem f_auto,q_auto, retorna como está
  if (url.includes('f_auto') && url.includes('q_auto')) {
    return url;
  }
  
  // URLs de vídeo - adiciona otimização específica
  if (url.includes('/video/upload/')) {
    // Se já tem transformações
    if (url.includes('/upload/') && !url.includes('/upload/v')) {
      return url; // Já tem transformações
    }
    
    // Adiciona transformações para vídeo
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // Remove versão se existir
      let pathPart = parts[1];
      pathPart = pathPart.replace(/^v\d+\//, '');
      
      // Adiciona otimização básica para vídeos que não têm transformações
      if (!parts[0].includes('so_') && !parts[0].includes('w_') && !parts[0].includes('q_')) {
        return `${parts[0]}/upload/f_auto,q_auto:eco/${pathPart}`;
      }
    }
    return url; // Mantém como está se já tem transformações específicas
  }
  
  // URLs de imagem - adiciona f_auto,q_auto
  if (url.includes('/image/upload/')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      // Remove versão se existir
      let pathPart = parts[1];
      pathPart = pathPart.replace(/^v\d+\//, '');
      
      // Se já tem alguma transformação, adiciona f_auto,q_auto no início
      if (parts[1].includes(',') || parts[1].includes('w_') || parts[1].includes('h_')) {
        return url; // Já tem transformações, mantém como está
      }
      
      // Adiciona transformações otimizadas
      return `${parts[0]}/upload/f_auto,q_auto/${pathPart}`;
    }
  }
  
  return url;
}

// Função para processar arquivo
function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return;
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return;
  }
  
  let originalContent = content;
  let fileReplacements = 0;
  
  // Regex para encontrar URLs do Cloudinary
  const cloudinaryRegex = /https?:\/\/res\.cloudinary\.com\/dyngqkiyl\/[^"'\s\)]+/g;
  
  // Encontra todas as URLs
  const matches = content.match(cloudinaryRegex);
  if (matches) {
    matches.forEach(url => {
      stats.urlsFound.add(url);
      
      const optimizedUrl = optimizeCloudinaryUrl(url);
      if (optimizedUrl !== url) {
        // Faz a substituição
        content = content.replace(url, optimizedUrl);
        fileReplacements++;
        stats.urlsReplaced.add(url);
      }
    });
  }
  
  // Salva se houve mudanças
  if (content !== originalContent) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.totalReplacements += fileReplacements;
      console.log(`✅ ${filePath}: ${fileReplacements} URLs otimizadas`);
    } catch (error) {
      console.error(`❌ Erro ao salvar ${filePath}: ${error.message}`);
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
console.log('📊 RESUMO DA OTIMIZAÇÃO:');
console.log('='.repeat(60));
console.log(`📁 Arquivos processados: ${stats.filesProcessed}`);
console.log(`✏️  Arquivos modificados: ${stats.filesModified}`);
console.log(`🔄 Total de substituições: ${stats.totalReplacements}`);
console.log(`🔍 URLs únicas encontradas: ${stats.urlsFound.size}`);
console.log(`✅ URLs otimizadas: ${stats.urlsReplaced.size}`);

// Mostra algumas URLs que foram encontradas
if (stats.urlsFound.size > 0) {
  console.log('\n📋 Exemplos de URLs processadas:');
  let count = 0;
  stats.urlsFound.forEach(url => {
    if (count < 5) {
      const optimized = optimizeCloudinaryUrl(url);
      if (optimized !== url) {
        console.log(`\n  Original: ${url.substring(0, 80)}...`);
        console.log(`  Otimizada: ${optimized.substring(0, 80)}...`);
        count++;
      }
    }
  });
}

// Verificação final
console.log('\n🔍 Verificando URLs antigas sem otimização...\n');

let foundUnoptimized = false;
DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      // Busca por URLs sem f_auto ou q_auto
      const cmd = `grep -r "res\\.cloudinary\\.com/dyngqkiyl/image/upload/v" ${dir} 2>/dev/null | head -3 || true`;
      const result = execSync(cmd, { encoding: 'utf8' });
      
      if (result.trim()) {
        console.log(`⚠️  URLs não otimizadas encontradas em ${dir}:`);
        const lines = result.trim().split('\n');
        lines.forEach(line => {
          const [file, ...rest] = line.split(':');
          const content = rest.join(':').trim();
          console.log(`  ${file}: ${content.substring(0, 80)}...`);
        });
        foundUnoptimized = true;
      }
    } catch (e) {
      // Sem correspondências
    }
  }
});

if (!foundUnoptimized) {
  console.log('✅ Todas as URLs de imagem estão otimizadas!');
}

console.log('\n✨ Processo concluído!');
console.log('\n📌 BENEFÍCIOS DA OTIMIZAÇÃO:');
console.log('  • f_auto: Entrega automática em WebP/AVIF para navegadores modernos');
console.log('  • q_auto: Qualidade otimizada automaticamente');
console.log('  • Redução de 30-60% no tamanho dos arquivos');
console.log('  • Melhoria significativa no tempo de carregamento');

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. Teste o site: npm run dev');
console.log('2. Verifique o carregamento das imagens');
console.log('3. Execute npm run build para produção');
console.log('4. Deploy para https://novo-site-atria.web.app/');

// Salva relatório
const report = {
  timestamp: new Date().toISOString(),
  backup: backupName,
  stats: {
    filesProcessed: stats.filesProcessed,
    filesModified: stats.filesModified,
    totalReplacements: stats.totalReplacements,
    urlsFound: stats.urlsFound.size,
    urlsOptimized: stats.urlsReplaced.size
  },
  sampleUrls: Array.from(stats.urlsReplaced).slice(0, 10)
};

fs.writeFileSync('cloudinary-optimization-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Relatório salvo em: cloudinary-optimization-report.json');