import xlsx from 'xlsx';
import crypto from 'crypto';
import fs from 'fs';

// Ler arquivo Excel
const filePath = 'attached_assets/estoque_atria_com_opcionais_1753662813056.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet);

console.log('💾 SALVANDO VEÍCULOS LOCALMENTE (FALLBACK)');
console.log('==========================================\n');

// Função para processar fotos
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

// Processar todos os veículos
const vehicles = [];
let processedCount = 0;

for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  const vehicleUUID = crypto.randomUUID();
  
  // Processar fotos
  const photosArray = processPhotos(row);
  const imagemPrincipal = row['Imagem Principal'] ? row['Imagem Principal'].trim() : null;
  
  // Criar objeto veículo completo
  const vehicle = {
    vehicle_uuid: vehicleUUID,
    timestamp: Date.now(),
    data_importacao: new Date().toISOString(),
    
    // Dados básicos
    marca: row.Marca || '',
    modelo: row.Modelo || '',
    versao: row.Versão || row.Versao || '',
    ano: parseInt(row['Ano Modelo']) || new Date().getFullYear(),
    combustivel: row.Combustível || row.Combustivel || 'Flex',
    km: parseInt(row.KM) || 0,
    cor: row.Cor || 'Não informado',
    cambio: row.Câmbio || row.Cambio || 'Manual',
    preco: parseFloat(String(row.Preço || row.Preco || '0').replace(/[R$.\s]/g, '').replace(',', '.')) || 0,
    placa: row.Placa || '',
    
    // ✅ CAMPOS DE FOTOS
    photos: photosArray,
    imagens: photosArray,
    imagemPrincipal: imagemPrincipal,
    imagem_capa: imagemPrincipal,
    foto_destaque: imagemPrincipal,
    
    // Status
    ativo: true,
    mais_vendidos: false,
    mostrar_de_por: false,
    
    // Metadados
    origem_importacao: 'local_fallback',
    versao_sistema: '2.0'
  };
  
  vehicles.push(vehicle);
  processedCount++;
  
  if (processedCount % 50 === 0) {
    console.log(`📦 Processados: ${processedCount}/${jsonData.length} veículos`);
  }
}

// Salvar em arquivo JSON
const outputPath = 'vehicle_data.json';
fs.writeFileSync(outputPath, JSON.stringify(vehicles, null, 2));

console.log(`\n✅ IMPORTAÇÃO LOCAL CONCLUÍDA!`);
console.log(`   Total de veículos processados: ${vehicles.length}`);
console.log(`   Arquivo salvo em: ${outputPath}`);
console.log(`   Tamanho do arquivo: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

// Estatísticas
const totalPhotos = vehicles.reduce((sum, v) => sum + v.photos.length, 0);
console.log(`\n📊 ESTATÍSTICAS:`);
console.log(`   Total de fotos: ${totalPhotos}`);
console.log(`   Média de fotos por veículo: ${(totalPhotos / vehicles.length).toFixed(1)}`);
console.log(`   Veículos com imagem principal: ${vehicles.filter(v => v.imagemPrincipal).length}`);

console.log(`\n💡 PRÓXIMOS PASSOS:`);
console.log(`   1. Use o arquivo vehicle_data.json para testes locais`);
console.log(`   2. Aguarde o reset das quotas do Firebase`);
console.log(`   3. Execute update-firebase-vehicles.js quando as quotas forem resetadas`);