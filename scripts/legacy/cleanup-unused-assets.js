#!/usr/bin/env node
// Script para identificar e remover assets não utilizados no Cloudinary e código

import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { execSync } from 'child_process';

// Configuração
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🧹 Limpeza de Assets Não Utilizados\n');

let stats = {
  totalAssets: 0,
  usedAssets: 0,
  unusedAssets: 0,
  deletedAssets: 0,
  errors: 0
};

// Função para obter todos os assets do Cloudinary
async function getAllCloudinaryAssets() {
  console.log('📋 Coletando assets do Cloudinary...');
  
  let allAssets = [];
  let nextCursor = null;
  
  do {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor
      });
      
      allAssets = allAssets.concat(result.resources);
      nextCursor = result.next_cursor;
      
      console.log(`  📦 ${allAssets.length} assets coletados...`);
    } catch (error) {
      console.error('❌ Erro ao coletar assets:', error.message);
      break;
    }
  } while (nextCursor);
  
  stats.totalAssets = allAssets.length;
  console.log(`✅ Total: ${stats.totalAssets} assets encontrados\n`);
  
  return allAssets;
}

// Função para verificar se um asset está sendo usado no código
function isAssetUsedInCode(publicId, secureUrl) {
  try {
    // Verifica se o public_id está sendo usado
    const grepResult1 = execSync(
      `grep -r "${publicId}" src/ public/ --include="*.jsx" --include="*.js" --include="*.css" --include="*.html" 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
    
    // Verifica se a URL está sendo usado
    const grepResult2 = execSync(
      `grep -r "${secureUrl}" src/ public/ --include="*.jsx" --include="*.js" --include="*.css" --include="*.html" 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
    
    // Verifica variações da URL (sem protocolo, etc)
    const urlWithoutProtocol = secureUrl.replace(/^https?:/, '');
    const grepResult3 = execSync(
      `grep -r "${urlWithoutProtocol}" src/ public/ --include="*.jsx" --include="*.js" --include="*.css" --include="*.html" 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
    
    return grepResult1 || grepResult2 || grepResult3;
  } catch (error) {
    return false;
  }
}

// Função para deletar asset do Cloudinary
async function deleteAsset(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao deletar ${publicId}: ${error.message}`);
    stats.errors++;
    return false;
  }
}

// Função principal
async function cleanupUnusedAssets() {
  // Backup do estado atual
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupName = `backup-before-cleanup-${timestamp}.tar.gz`;
  
  console.log(`📦 Criando backup: ${backupName}`);
  try {
    execSync(`tar -czf ${backupName} src/ public/`, { stdio: 'pipe' });
    console.log(`✅ Backup criado!\n`);
  } catch (error) {
    console.log('⚠️  Backup falhou, continuando...\n');
  }
  
  // Obter todos os assets
  const allAssets = await getAllCloudinaryAssets();
  
  console.log('🔍 Analisando uso de assets...\n');
  
  const unusedAssets = [];
  const usedAssets = [];
  
  // Verifica cada asset
  for (let i = 0; i < allAssets.length; i++) {
    const asset = allAssets[i];
    const isUsed = isAssetUsedInCode(asset.public_id, asset.secure_url);
    
    if (isUsed) {
      usedAssets.push(asset);
      console.log(`✅ [${i + 1}/${allAssets.length}] USADO: ${asset.public_id}`);
    } else {
      unusedAssets.push(asset);
      console.log(`❌ [${i + 1}/${allAssets.length}] NÃO USADO: ${asset.public_id}`);
    }
    
    // Pausa a cada 50 assets para não sobrecarregar
    if (i > 0 && i % 50 === 0) {
      console.log(`⏸️  Pausa de 2 segundos...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  stats.usedAssets = usedAssets.length;
  stats.unusedAssets = unusedAssets.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANÁLISE DE USO:');
  console.log('='.repeat(60));
  console.log(`📦 Total de assets: ${stats.totalAssets}`);
  console.log(`✅ Assets em uso: ${stats.usedAssets}`);
  console.log(`❌ Assets não utilizados: ${stats.unusedAssets}`);
  
  if (unusedAssets.length === 0) {
    console.log('\n🎉 Todos os assets estão sendo utilizados! Nenhuma limpeza necessária.');
    return;
  }
  
  console.log('\n🗑️  ASSETS PARA DELETAR:');
  console.log('='.repeat(60));
  unusedAssets.forEach((asset, index) => {
    console.log(`${index + 1}. ${asset.public_id}`);
    console.log(`   URL: ${asset.secure_url}`);
    console.log(`   Tamanho: ${(asset.bytes / 1024).toFixed(2)} KB`);
    console.log(`   Formato: ${asset.format}`);
    console.log('');
  });
  
  console.log('🔥 INICIANDO DELEÇÃO...\n');
  
  // Deleta assets não utilizados
  for (let i = 0; i < unusedAssets.length; i++) {
    const asset = unusedAssets[i];
    console.log(`🗑️  [${i + 1}/${unusedAssets.length}] Deletando: ${asset.public_id}`);
    
    const deleted = await deleteAsset(asset.public_id);
    if (deleted) {
      stats.deletedAssets++;
      console.log(`✅ Deletado com sucesso!`);
    }
    
    // Pausa entre deleções
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO FINAL:');
  console.log('='.repeat(60));
  console.log(`📦 Total de assets analisados: ${stats.totalAssets}`);
  console.log(`✅ Assets mantidos: ${stats.usedAssets}`);
  console.log(`🗑️  Assets deletados: ${stats.deletedAssets}`);
  console.log(`❌ Erros: ${stats.errors}`);
  
  const spaceSaved = unusedAssets.reduce((total, asset) => total + asset.bytes, 0);
  console.log(`💾 Espaço liberado: ${(spaceSaved / 1024 / 1024).toFixed(2)} MB`);
  
  // Salva relatório
  const report = {
    timestamp: new Date().toISOString(),
    backup: backupName,
    stats,
    deletedAssets: unusedAssets.map(asset => ({
      public_id: asset.public_id,
      url: asset.secure_url,
      size_kb: Math.round(asset.bytes / 1024),
      format: asset.format
    }))
  };
  
  fs.writeFileSync('cleanup-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: cleanup-report.json');
  
  console.log('\n✨ Limpeza concluída!');
  console.log('🎯 Cloudinary otimizado - apenas assets utilizados mantidos');
}

// Executa
cleanupUnusedAssets().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});