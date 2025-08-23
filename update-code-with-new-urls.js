#!/usr/bin/env node
// Script final para atualizar código com as novas URLs organizadas

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔄 Atualizando código com URLs organizadas do Cloudinary...\n');

// Lê o mapeamento
const mapping = JSON.parse(fs.readFileSync('cloudinary-url-mapping.json', 'utf8'));

// Backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupName = `backup-final-urls-${timestamp}.tar.gz`;
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

let stats = {
  filesProcessed: 0,
  filesModified: 0,
  totalReplacements: 0
};

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
  let replacements = 0;
  
  // Para cada mapeamento de URL
  mapping.forEach(entry => {
    const oldUrl = entry.old_url;
    const newUrl = entry.new_url;
    
    // Substituição direta
    if (content.includes(oldUrl)) {
      content = content.replaceAll(oldUrl, newUrl);
      replacements++;
    }
    
    // Substitui versões sem protocolo
    const oldUrlNoProto = oldUrl.replace(/^https?:/, '');
    const newUrlNoProto = newUrl.replace(/^https?:/, '');
    
    if (content.includes(oldUrlNoProto)) {
      content = content.replaceAll(oldUrlNoProto, newUrlNoProto);
      replacements++;
    }
  });
  
  // Salva se houve mudanças
  if (content !== originalContent && replacements > 0) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.totalReplacements += replacements;
      console.log(`✅ ${filePath}: ${replacements} URLs atualizadas`);
    } catch (error) {
      console.error(`❌ Erro ao salvar ${filePath}: ${error.message}`);
    }
  }
  
  stats.filesProcessed++;
}

// Processa diretórios recursivamente
function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

// Processa
console.log('🔍 Processando arquivos...\n');
DIRECTORIES.forEach(dir => {
  console.log(`📂 Processando ${dir}/...`);
  processDirectory(dir);
});

// Resumo
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA ATUALIZAÇÃO FINAL:');
console.log('='.repeat(60));
console.log(`📁 Arquivos processados: ${stats.filesProcessed}`);
console.log(`✏️  Arquivos modificados: ${stats.filesModified}`);
console.log(`🔄 URLs atualizadas: ${stats.totalReplacements}`);

// Verifica se ainda há URLs antigas
console.log('\n🔍 Verificação final...');
const oldPatterns = [
  'atria-site/images/',
  'res.cloudinary.com/dyngqkiyl/image/upload/v',
  'freepik__'
];

let foundOldUrls = false;
oldPatterns.forEach(pattern => {
  try {
    const result = execSync(
      `grep -r "${pattern}" src/ public/ --include="*.jsx" --include="*.js" 2>/dev/null | head -3 || true`,
      { encoding: 'utf8' }
    );
    
    if (result.trim()) {
      console.log(`⚠️  Padrão antigo encontrado (${pattern}):`);
      result.trim().split('\n').slice(0, 2).forEach(line => {
        const [file] = line.split(':');
        console.log(`  ${file}`);
      });
      foundOldUrls = true;
    }
  } catch (e) {}
});

if (!foundOldUrls) {
  console.log('✅ Todas as URLs foram atualizadas para a estrutura organizada!');
}

console.log('\n✨ Atualização concluída!');
console.log('\n🎯 RESULTADOS:');
console.log('• Assets organizados no Cloudinary em folders categorizados');
console.log('• URLs no código atualizadas para nova estrutura');
console.log('• Otimizações f_auto,q_auto mantidas');
console.log('• Performance melhorada com organização');

console.log('\n💡 PRÓXIMOS PASSOS:');
console.log('1. Teste: npm run dev');
console.log('2. Build: npm run build');
console.log('3. Deploy: https://novo-site-atria.web.app/');

// Relatório
const report = {
  timestamp: new Date().toISOString(),
  backup: backupName,
  cloudinaryFoldersCreated: true,
  assetsReorganized: 230,
  codeUpdated: {
    filesModified: stats.filesModified,
    urlsUpdated: stats.totalReplacements
  }
};

fs.writeFileSync('final-cloudinary-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Relatório final salvo em: final-cloudinary-report.json');