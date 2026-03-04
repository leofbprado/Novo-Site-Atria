#!/usr/bin/env node
// Script SEGURO para limpeza de assets - apenas remove assets claramente não utilizados

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

console.log('🛡️  Limpeza SEGURA de Assets não utilizados\n');

// Assets que SABEMOS que estão sendo usados (não deletar)
const PROTECTED_ASSETS = [
  // Vídeos principais
  'WhatsApp_Video_2024-12-11_at_14.54.24',
  
  // Assets em uso identificados
  'financing-calculator',
  'sell-car-cta',
  
  // Qualquer coisa com essas palavras-chave críticas
  'logo', 'hero', 'main', 'principal', 'banner'
];

// Categorias consideradas seguras para limpeza (assets de template)
const SAFE_TO_DELETE_CATEGORIES = [
  'deal1-', 'cart', 'candidate-', 'book1-', 'compare', 'add-car',
  'brand5-', 'brandf', 'blog4-', 'blog5-', 'blog3-', 'about-inner'
];

// Função para verificar se um asset é seguro para deletar
function isSafeToDelete(publicId) {
  // Nunca deletar assets protegidos
  if (PROTECTED_ASSETS.some(protectedAsset => publicId.includes(protectedAsset))) {
    return false;
  }
  
  // Só deletar se corresponder às categorias seguras
  return SAFE_TO_DELETE_CATEGORIES.some(category => publicId.includes(category));
}

// Função para buscar referência no código
function isReferencedInCode(publicId, secureUrl) {
  try {
    // Busca o ID público
    const result1 = execSync(
      `find src/ public/ -name "*.jsx" -o -name "*.js" -o -name "*.css" -o -name "*.html" | xargs grep -l "${publicId}" 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
    
    // Busca variações do nome do asset
    const assetName = publicId.split('/').pop();
    const result2 = execSync(
      `find src/ public/ -name "*.jsx" -o -name "*.js" -o -name "*.css" -o -name "*.html" | xargs grep -l "${assetName}" 2>/dev/null || true`,
      { encoding: 'utf8' }
    ).trim();
    
    return result1.length > 0 || result2.length > 0;
  } catch (error) {
    // Em caso de erro, assumir que está sendo usado (seguro)
    return true;
  }
}

async function safeCleanup() {
  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupName = `backup-safe-cleanup-${timestamp}.tar.gz`;
  
  console.log(`📦 Criando backup: ${backupName}`);
  try {
    execSync(`tar -czf ${backupName} src/ public/`, { stdio: 'pipe' });
    console.log(`✅ Backup criado!\n`);
  } catch (error) {
    console.log('⚠️  Backup falhou, continuando...\n');
  }
  
  console.log('📋 Coletando assets do Cloudinary...');
  
  // Coleta assets
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
      
    } catch (error) {
      console.error('❌ Erro ao coletar assets:', error.message);
      break;
    }
  } while (nextCursor);
  
  console.log(`✅ ${allAssets.length} assets encontrados\n`);
  
  // Análise segura
  console.log('🔍 Analisando assets para limpeza SEGURA...\n');
  
  const safeToDelete = [];
  const protectedAssets = [];
  
  allAssets.forEach((asset, index) => {
    const publicId = asset.public_id;
    
    // Verifica se é seguro deletar
    const isSafe = isSafeToDelete(publicId);
    const isReferenced = isReferencedInCode(publicId, asset.secure_url);
    
    if (isSafe && !isReferenced) {
      safeToDelete.push(asset);
      console.log(`🗑️  DELETAR: ${publicId}`);
    } else {
      protectedAssets.push(asset);
      console.log(`✅ MANTER: ${publicId} ${!isSafe ? '(protegido)' : ''} ${isReferenced ? '(em uso)' : ''}`);
    }
    
    // Pausa a cada 20 assets
    if (index > 0 && index % 20 === 0) {
      console.log(`⏸️  Pausa...`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA ANÁLISE SEGURA:');
  console.log('='.repeat(60));
  console.log(`📦 Total analisado: ${allAssets.length}`);
  console.log(`✅ Assets mantidos: ${protectedAssets.length}`);
  console.log(`🗑️  Assets para deletar: ${safeToDelete.length}`);
  
  if (safeToDelete.length === 0) {
    console.log('\n🎉 Nenhum asset seguro para deletar identificado!');
    console.log('Todos os assets são considerados importantes ou em uso.');
    return;
  }
  
  console.log('\n🗑️  LISTA DE DELEÇÃO (apenas assets de template não utilizados):');
  safeToDelete.forEach((asset, index) => {
    console.log(`${index + 1}. ${asset.public_id}`);
    console.log(`   Tamanho: ${(asset.bytes / 1024).toFixed(2)} KB`);
  });
  
  const totalSize = safeToDelete.reduce((sum, asset) => sum + asset.bytes, 0);
  console.log(`\n💾 Espaço a ser liberado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  console.log('\n🔥 Iniciando deleção segura...\n');
  
  let deleted = 0;
  let errors = 0;
  
  for (const asset of safeToDelete) {
    try {
      await cloudinary.uploader.destroy(asset.public_id);
      deleted++;
      console.log(`✅ ${deleted}/${safeToDelete.length}: ${asset.public_id} deletado`);
    } catch (error) {
      errors++;
      console.log(`❌ Erro ao deletar ${asset.public_id}: ${error.message}`);
    }
    
    // Pausa entre deleções
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO DA LIMPEZA SEGURA:');
  console.log('='.repeat(60));
  console.log(`🗑️  Assets deletados: ${deleted}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`✅ Assets mantidos: ${protectedAssets.length}`);
  console.log(`💾 Espaço liberado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  // Salva relatório
  const report = {
    timestamp: new Date().toISOString(),
    backup: backupName,
    summary: {
      totalAnalyzed: allAssets.length,
      deleted: deleted,
      maintained: protectedAssets.length,
      errors: errors,
      spaceSavedMB: (totalSize / 1024 / 1024).toFixed(2)
    },
    deletedAssets: safeToDelete.map(asset => ({
      public_id: asset.public_id,
      size_kb: Math.round(asset.bytes / 1024)
    }))
  };
  
  fs.writeFileSync('safe-cleanup-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo em: safe-cleanup-report.json');
  
  console.log('\n✨ Limpeza segura concluída!');
  console.log('🎯 Apenas assets de template claramente não utilizados foram removidos');
}

safeCleanup().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});