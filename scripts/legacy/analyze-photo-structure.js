import XLSX from 'xlsx';
import { readFileSync } from 'fs';

console.log('🔍 ANÁLISE DA ESTRUTURA DE FOTOS NA PLANILHA');
console.log('='.repeat(60));

try {
  // Ler planilha
  const data = readFileSync('./attached_assets/estoque_atria_com_opcionais_1753662813056.xlsx');
  const workbook = XLSX.read(data, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 Total de linhas: ${jsonData.length}`);
  console.log('📋 Primeiros 5 cabeçalhos encontrados:');
  
  const headers = Object.keys(jsonData[0] || {});
  headers.slice(0, 5).forEach((header, index) => {
    console.log(`   ${index + 1}. ${header}`);
  });
  
  console.log('\n📸 ANÁLISE ESPECÍFICA DE CAMPOS DE FOTOS:');
  console.log('-'.repeat(40));
  
  // Verificar campos relacionados a fotos
  const photoFields = headers.filter(header => 
    header.toLowerCase().includes('foto') || 
    header.toLowerCase().includes('imagem') ||
    header.toLowerCase().includes('image')
  );
  
  console.log(`🖼️ Campos de foto encontrados: ${photoFields.length}`);
  photoFields.forEach(field => {
    console.log(`   - ${field}`);
  });
  
  console.log('\n📋 TODOS OS CABEÇALHOS DA PLANILHA:');
  console.log('-'.repeat(40));
  headers.forEach((header, index) => {
    console.log(`${index + 1}. ${header}`);
  });
  
  console.log('\n📝 AMOSTRA DOS PRIMEIROS 3 VEÍCULOS:');
  console.log('-'.repeat(40));
  
  for (let i = 0; i < Math.min(3, jsonData.length); i++) {
    const vehicle = jsonData[i];
    console.log(`\n🚗 VEÍCULO ${i + 1}: ${vehicle.Marca || 'N/A'} ${vehicle.Modelo || 'N/A'}`);
    
    // Mostrar todos os campos que contêm foto/imagem
    photoFields.forEach(field => {
      const value = vehicle[field];
      if (value) {
        console.log(`   ${field}: ${value}`);
        
        // Se contém múltiplas URLs, mostrar separadas
        if (typeof value === 'string' && (value.includes(';') || value.includes(','))) {
          const urls = value.split(/[;,]/).map(url => url.trim()).filter(url => url);
          console.log(`   ↳ URLs separadas (${urls.length}):`);
          urls.slice(0, 3).forEach((url, index) => {
            console.log(`     ${index + 1}. ${url}`);
          });
          if (urls.length > 3) {
            console.log(`     ... e mais ${urls.length - 3} URLs`);
          }
        }
      } else {
        console.log(`   ${field}: (vazio)`);
      }
    });
  }
  
  console.log('\n📊 ESTATÍSTICAS DE FOTOS:');
  console.log('-'.repeat(40));
  
  let vehiclesWithPhotos = 0;
  let totalPhotos = 0;
  let maxPhotosPerVehicle = 0;
  
  jsonData.forEach(vehicle => {
    let vehiclePhotoCount = 0;
    
    photoFields.forEach(field => {
      const value = vehicle[field];
      if (value && typeof value === 'string') {
        if (value.includes(';') || value.includes(',')) {
          const urls = value.split(/[;,]/).map(url => url.trim()).filter(url => url);
          vehiclePhotoCount += urls.length;
        } else if (value.trim()) {
          vehiclePhotoCount += 1;
        }
      }
    });
    
    if (vehiclePhotoCount > 0) {
      vehiclesWithPhotos++;
      totalPhotos += vehiclePhotoCount;
      maxPhotosPerVehicle = Math.max(maxPhotosPerVehicle, vehiclePhotoCount);
    }
  });
  
  console.log(`📈 Veículos com fotos: ${vehiclesWithPhotos}/${jsonData.length} (${((vehiclesWithPhotos/jsonData.length)*100).toFixed(1)}%)`);
  console.log(`📸 Total de fotos: ${totalPhotos}`);
  console.log(`📊 Média de fotos por veículo: ${(totalPhotos/vehiclesWithPhotos).toFixed(1)}`);
  console.log(`🏆 Máximo de fotos em um veículo: ${maxPhotosPerVehicle}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ ANÁLISE CONCLUÍDA');

} catch (error) {
  console.error('❌ Erro na análise:', error);
}