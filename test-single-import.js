import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import xlsx from 'xlsx';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBw3f7jKOk5ApzGsls45IQqhUCAA8jcFqQ",
  authDomain: "atria-veiculos.firebaseapp.com",
  projectId: "atria-veiculos",
  storageBucket: "atria-veiculos.firebasestorage.app",
  messagingSenderId: "644463113399",
  appId: "1:644463113399:web:b513aa46a87cf2e8e8e6a1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ler primeiro veículo da planilha
const filePath = 'attached_assets/estoque_atria_com_opcionais_1753662813056.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet);

const row = jsonData[0]; // Primeiro veículo

console.log('🚗 TESTANDO IMPORTAÇÃO DE UM ÚNICO VEÍCULO');
console.log('=========================================\n');

// Processar fotos
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

const vehicle = {
  vehicle_uuid: 'TEST_IMPORT_001',
  marca: row.Marca || '',
  modelo: row.Modelo || '',
  versao: row.Versão || row.Versao || '',
  ano: parseInt(row['Ano Modelo']) || 2024,
  km: parseInt(row.KM) || 0,
  combustivel: row.Combustível || row.Combustivel || 'Flex',
  cambio: row.Câmbio || row.Cambio || 'Manual',
  preco: parseFloat(String(row.Preço || row.Preco || '0').replace(/[R$.\s]/g, '').replace(',', '.')) || 0,
  placa: row.Placa || '',
  
  // ✅ CAMPOS DE FOTOS ESSENCIAIS
  photos: photos,
  imagens: photos,
  imagemPrincipal: row['Imagem Principal'] ? row['Imagem Principal'].trim() : null,
  imagem_capa: row['Imagem Principal'] ? row['Imagem Principal'].trim() : null,
  
  // Status
  ativo: true,
  mais_vendidos: false,
  mostrar_de_por: false,
  
  // Metadados
  data_importacao: new Date(),
  origem_importacao: 'test_import'
};

console.log('📋 Dados do veículo:');
console.log(`   Marca: ${vehicle.marca}`);
console.log(`   Modelo: ${vehicle.modelo}`);
console.log(`   Versão: ${vehicle.versao}`);
console.log(`   Ano: ${vehicle.ano}`);
console.log(`   KM: ${vehicle.km}`);
console.log(`   Preço: R$ ${vehicle.preco}`);
console.log(`   Fotos: ${vehicle.photos.length} URLs`);
console.log(`   Imagem Principal: ${vehicle.imagemPrincipal ? 'SIM' : 'NÃO'}`);

console.log('\n📸 URLs das fotos:');
vehicle.photos.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url.substring(0, 80)}...`);
});

try {
  await setDoc(doc(db, 'veiculos', vehicle.vehicle_uuid), vehicle);
  console.log('\n✅ Veículo salvo com sucesso no Firestore!');
  console.log('   ID: TEST_IMPORT_001');
  console.log('\n🔍 Verifique no frontend se as fotos aparecem agora.');
} catch (error) {
  console.error('\n❌ Erro ao salvar:', error.message);
}