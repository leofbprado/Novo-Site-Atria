#!/usr/bin/env node
// Script para verificar se os folders foram criados no Cloudinary

import { v2 as cloudinary } from 'cloudinary';

// Configuração
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🔍 Verificando estrutura de folders no Cloudinary...\n');

async function checkFolders() {
  try {
    // Lista todos os folders
    const result = await cloudinary.api.root_folders();
    
    console.log('📁 Folders encontrados na raiz:');
    result.folders.forEach(folder => {
      console.log(`  - ${folder.name} (${folder.path})`);
    });
    
    // Verifica especificamente o folder atria-veiculos
    console.log('\n🔍 Verificando estrutura atria-veiculos...');
    
    try {
      const atriaResult = await cloudinary.api.sub_folders('atria-veiculos');
      console.log('📂 Subfolders em atria-veiculos:');
      atriaResult.folders.forEach(folder => {
        console.log(`  - ${folder.name} (${folder.path})`);
      });
      
      // Verifica assets em algumas categorias
      console.log('\n🖼️  Assets em algumas categorias:');
      
      const categories = ['atria-veiculos/images/brands', 'atria-veiculos/images/misc', 'atria-veiculos/hero'];
      
      for (const category of categories) {
        try {
          const assets = await cloudinary.api.resources({
            type: 'upload',
            prefix: category,
            max_results: 5
          });
          console.log(`\n  ${category}: ${assets.resources.length} assets encontrados`);
          assets.resources.forEach(asset => {
            console.log(`    - ${asset.public_id}`);
          });
        } catch (e) {
          console.log(`\n  ${category}: Nenhum asset encontrado`);
        }
      }
      
    } catch (e) {
      console.log('❌ Folder atria-veiculos não encontrado!');
      console.log('Isso indica que a renomeação ainda não foi concluída.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar folders:', error.message);
  }
}

checkFolders();