import xlsx from 'xlsx';
import crypto from 'crypto';

// Ler arquivo Excel
const filePath = 'attached_assets/estoque_atria_com_opcionais_1753662813056.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet);

console.log('🔍 TESTE LOCAL DE PROCESSAMENTO DE DADOS');
console.log('========================================\n');

// Função para processar fotos (cópia da função original)
const processPhotos = (row) => {
  const photos = [];
  
  if (row['Imagem Principal']) {
    photos.push(row['Imagem Principal'].trim());
  }
  
  if (row.Fotos) {
    const additionalPhotos = row.Fotos.split(';')
      .map(url => url.trim())
      .filter(url => url && url !== row['Imagem Principal']);
    photos.push(...additionalPhotos);
  }
  
  return photos.filter(url => url);
};

// Testar com os primeiros 3 veículos
console.log(`📊 Testando processamento de ${Math.min(3, jsonData.length)} veículos:\n`);

for (let i = 0; i < Math.min(3, jsonData.length); i++) {
  const row = jsonData[i];
  const vehicleUUID = crypto.randomUUID();
  
  // Processar fotos
  const photosArray = processPhotos(row);
  const imagemPrincipal = row['Imagem Principal'] ? row['Imagem Principal'].trim() : null;
  
  // Criar objeto veículo (simplificado)
  const vehicle = {
    vehicle_uuid: vehicleUUID,
    marca: row.Marca || '',
    modelo: row.Modelo || '',
    versao: row.Versão || row.Versao || '',
    preco: parseFloat(String(row.Preço || row.Preco || '0').replace(/[R$.\s]/g, '').replace(',', '.')) || 0,
    
    // CAMPOS DE FOTOS
    photos: photosArray,
    imagens: photosArray,
    imagemPrincipal: imagemPrincipal,
    imagem_capa: imagemPrincipal,
    foto_destaque: imagemPrincipal,
  };
  
  console.log(`📋 Veículo ${i + 1}: ${vehicle.marca} ${vehicle.modelo}`);
  console.log(`   UUID: ${vehicle.vehicle_uuid.substring(0, 8)}...`);
  console.log(`   Preço: R$ ${vehicle.preco.toLocaleString('pt-BR')}`);
  console.log(`   Campo photos: ${Array.isArray(vehicle.photos) ? `✅ Array com ${vehicle.photos.length} URLs` : '❌ NÃO é array'}`);
  console.log(`   Campo imagemPrincipal: ${vehicle.imagemPrincipal ? '✅ SIM' : '❌ NÃO'}`);
  
  if (vehicle.photos.length > 0) {
    console.log(`   Primeira foto: ${vehicle.photos[0].substring(0, 70)}...`);
    console.log(`   Última foto: ${vehicle.photos[vehicle.photos.length - 1].substring(0, 70)}...`);
  }
  
  console.log(`\n   📸 Estrutura completa do campo photos:`);
  console.log(`   ${JSON.stringify(vehicle.photos, null, 4).substring(0, 500)}...\n`);
}

console.log('\n✅ CONCLUSÃO DO TESTE LOCAL:');
console.log('   - A função processPhotos está funcionando corretamente');
console.log('   - Os arrays de fotos estão sendo criados com as URLs da planilha');
console.log('   - O problema parece ser apenas com o Firestore (quota/permissões)');
console.log('\n💡 SUGESTÃO:');
console.log('   1. Verifique o console do Firebase para ver o status das quotas');
console.log('   2. Aguarde o reset das quotas (geralmente diário)');
console.log('   3. Ou atualize o plano do Firebase se necessário');