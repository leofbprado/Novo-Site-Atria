/**
 * Script para atualizar src/data/brands.js com URLs otimizadas do Cloudinary
 */

import fs from 'fs';
import path from 'path';

// Mapeamento das marcas migradas
const cloudinaryBrands = {
  "Audi": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490887/atria-veiculos/brands/atria-veiculos/brands/audi",
  "BMW": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490888/atria-veiculos/brands/atria-veiculos/brands/bmw",
  "Ford": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490889/atria-veiculos/brands/atria-veiculos/brands/ford",
  "Mercedes-Benz": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490890/atria-veiculos/brands/atria-veiculos/brands/mercedes-benz",
  "Peugeot": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490891/atria-veiculos/brands/atria-veiculos/brands/peugeot",
  "Volkswagen": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490892/atria-veiculos/brands/atria-veiculos/brands/volkswagen",
  "Toyota": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490893/atria-veiculos/brands/atria-veiculos/brands/toyota",
  "Chevrolet": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490894/atria-veiculos/brands/atria-veiculos/brands/chevrolet",
  "Renault": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490896/atria-veiculos/brands/atria-veiculos/brands/renault",
  "KIA": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490897/atria-veiculos/brands/atria-veiculos/brands/kia",
  "Volvo": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490898/atria-veiculos/brands/atria-veiculos/brands/volvo",
  "CAOA Chery": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490899/atria-veiculos/brands/atria-veiculos/brands/caoa-chery",
  "Fiat": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490900/atria-veiculos/brands/atria-veiculos/brands/fiat",
  "Jeep": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490901/atria-veiculos/brands/atria-veiculos/brands/jeep",
  "Honda": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490902/atria-veiculos/brands/atria-veiculos/brands/honda",
  "Hyundai": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490903/atria-veiculos/brands/atria-veiculos/brands/hyundai",
  "Citroën": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490904/atria-veiculos/brands/atria-veiculos/brands/citroen",
  "JAC": "https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:good,w_100,h_100,c_fit/v1754490905/atria-veiculos/brands/atria-veiculos/brands/jac"
};

async function updateBrandsFile() {
  try {
    console.log('🔄 Atualizando src/data/brands.js...');
    
    // Ler arquivo atual
    const brandsPath = './src/data/brands.js';
    let content = fs.readFileSync(brandsPath, 'utf8');
    
    let updatedCount = 0;
    
    // Substituir URLs para cada marca
    Object.entries(cloudinaryBrands).forEach(([brandName, cloudinaryUrl]) => {
      // Procurar por entradas com esse título
      const regex = new RegExp(
        `(src:\\s*['"]/[^'"]*['"],[\\s\\S]*?title:\\s*['"]${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"])`,
        'g'
      );
      
      const newContent = content.replace(regex, (match) => {
        updatedCount++;
        return match.replace(/src:\s*['"][^'"]*['"]/, `src: "${cloudinaryUrl}"`);
      });
      
      if (newContent !== content) {
        content = newContent;
        console.log(`✅ ${brandName} → Cloudinary WebP`);
      }
    });
    
    // Salvar arquivo atualizado
    fs.writeFileSync(brandsPath, content);
    
    console.log(`\n🎉 Arquivo atualizado!`);
    console.log(`✅ ${updatedCount} marcas migradas para Cloudinary WebP`);
    
    return { success: true, updatedCount };
    
  } catch (error) {
    console.error('❌ Erro ao atualizar brands.js:', error);
    return { success: false, error: error.message };
  }
}

async function main() {
  await updateBrandsFile();
}

main();