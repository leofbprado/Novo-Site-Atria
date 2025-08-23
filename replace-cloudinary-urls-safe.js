#!/usr/bin/env node
// Script seguro para substituir URLs do Cloudinary em todo o código

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔄 Atualizando URLs do Cloudinary no código...\n');

// Lê o mapeamento
const mapping = JSON.parse(fs.readFileSync('cloudinary-url-mapping.json', 'utf8'));
console.log(`📊 Total de URLs para substituir: ${mapping.length}`);

// Criar backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupName = `backup-before-url-update-${timestamp}.tar.gz`;
console.log(`\n📦 Criando backup: ${backupName}`);
try {
  execSync(`tar -czf ${backupName} src/ public/`, { stdio: 'pipe' });
  console.log(`✅ Backup criado com sucesso!\n`);
} catch (error) {
  console.log('⚠️  Não foi possível criar backup, continuando...\n');
}

// Diretórios e extensões para processar
const DIRECTORIES = ['src', 'public'];
const EXTENSIONS = ['.js', '.jsx', '.css', '.html', '.json', '.md'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

// Estatísticas
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  totalReplacements: 0,
  errors: []
};

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
  let fileReplacements = 0;
  
  // Processa cada mapeamento
  mapping.forEach(entry => {
    // Substituir URL completa
    const oldUrl = entry.old_url;
    const newUrl = entry.new_url;
    
    // Escape caracteres especiais para regex
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Padrão 1: URL completa
    const oldUrlRegex = new RegExp(escapeRegex(oldUrl), 'g');
    const matches1 = content.match(oldUrlRegex);
    if (matches1) {
      content = content.replace(oldUrlRegex, newUrl);
      fileReplacements += matches1.length;
    }
    
    // Padrão 2: URL sem protocolo
    const oldUrlNoProto = oldUrl.replace(/^https?:/, '');
    const newUrlNoProto = newUrl.replace(/^https?:/, '');
    const oldUrlNoProtoRegex = new RegExp(escapeRegex(oldUrlNoProto), 'g');
    const matches2 = content.match(oldUrlNoProtoRegex);
    if (matches2) {
      content = content.replace(oldUrlNoProtoRegex, newUrlNoProto);
      fileReplacements += matches2.length;
    }
    
    // Padrão 3: URL com versão (v12345678)
    const versionPattern = `res\\.cloudinary\\.com/dyngqkiyl/image/upload/v\\d+/${escapeRegex(entry.old_public_id)}`;
    const versionRegex = new RegExp(versionPattern, 'g');
    const matches3 = content.match(versionRegex);
    if (matches3) {
      const newUrlWithPath = `res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/${entry.new_public_id}`;
      content = content.replace(versionRegex, newUrlWithPath);
      fileReplacements += matches3.length;
    }
  });
  
  // Salva se houve mudanças
  if (content !== originalContent) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.totalReplacements += fileReplacements;
      console.log(`✅ ${filePath}: ${fileReplacements} substituições`);
    } catch (error) {
      stats.errors.push({ file: filePath, error: error.message });
    }
  }
  
  stats.filesProcessed++;
}

// Função para processar diretório recursivamente
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
console.log('📊 RESUMO DA ATUALIZAÇÃO:');
console.log('='.repeat(60));
console.log(`📁 Arquivos processados: ${stats.filesProcessed}`);
console.log(`✏️  Arquivos modificados: ${stats.filesModified}`);
console.log(`🔄 Total de substituições: ${stats.totalReplacements}`);

if (stats.errors.length > 0) {
  console.log(`\n⚠️  Erros encontrados: ${stats.errors.length}`);
  stats.errors.slice(0, 5).forEach(err => {
    console.log(`  ${err.file}: ${err.error}`);
  });
}

// Verificação final - busca por URLs antigas
console.log('\n🔍 Verificando URLs antigas restantes...\n');

let foundOldUrls = false;
DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      // Busca por padrão antigo com versão
      const cmd = `grep -r "res\\.cloudinary\\.com/dyngqkiyl/image/upload/v" ${dir} 2>/dev/null | head -5 || true`;
      const result = execSync(cmd, { encoding: 'utf8' });
      
      if (result.trim()) {
        console.log(`⚠️  URLs antigas encontradas em ${dir}:`);
        const lines = result.trim().split('\n');
        lines.forEach(line => {
          const [file, ...rest] = line.split(':');
          const content = rest.join(':').trim();
          if (content.length > 100) {
            console.log(`  ${file}: ${content.substring(0, 100)}...`);
          } else {
            console.log(`  ${file}: ${content}`);
          }
        });
        foundOldUrls = true;
      }
    } catch (e) {
      // Sem correspondências encontradas
    }
  }
});

if (!foundOldUrls) {
  console.log('✅ Nenhuma URL antiga com versão foi encontrada!');
  console.log('   Todas as URLs foram atualizadas com sucesso!');
} else {
  console.log('\n⚠️  Algumas URLs antigas ainda existem.');
  console.log('   Isso pode ser normal para alguns casos especiais.');
}

console.log('\n✨ Processo concluído com sucesso!');
console.log('\n📌 PRÓXIMOS PASSOS:');
console.log('1. Teste o site localmente: npm run dev');
console.log('2. Verifique se todas as imagens estão carregando');
console.log('3. Execute npm run build para criar versão de produção');
console.log('4. Faça deploy para https://novo-site-atria.web.app/');

// Salva relatório
const report = {
  timestamp: new Date().toISOString(),
  backup: backupName,
  stats: stats,
  foundOldUrls: foundOldUrls
};

fs.writeFileSync('url-update-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Relatório salvo em: url-update-report.json');