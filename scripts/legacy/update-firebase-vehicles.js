import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

// Configuração Firebase - novo-site-atria
const firebaseConfig = {
  apiKey: "AIzaSyCng1gtGC16C8NoYoc-B1fSk22q_bkhv0c",
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.firebasestorage.app",
  messagingSenderId: "1073104197604",
  appId: "1:1073104197604:web:67ee785a7a8f54ca0319f1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🚀 ATUALIZANDO VEÍCULOS NO FIREBASE');
console.log('====================================\n');

// Ler arquivo JSON local
const vehicleData = JSON.parse(fs.readFileSync('vehicle_data.json', 'utf8'));

console.log(`📊 Total de veículos para importar: ${vehicleData.length}`);

let successCount = 0;
let errorCount = 0;

// Importar em lotes pequenos para evitar sobrecarga
const batchSize = 10;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

for (let i = 0; i < vehicleData.length; i += batchSize) {
  const batch = vehicleData.slice(i, i + batchSize);
  
  console.log(`\n📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(vehicleData.length/batchSize)}`);
  
  const promises = batch.map(async (vehicle) => {
    try {
      await setDoc(doc(db, 'veiculos', vehicle.vehicle_uuid), vehicle);
      successCount++;
      console.log(`✅ ${vehicle.marca} ${vehicle.modelo} - ${vehicle.photos.length} fotos`);
      return true;
    } catch (error) {
      errorCount++;
      console.error(`❌ Erro: ${vehicle.marca} ${vehicle.modelo} - ${error.message}`);
      return false;
    }
  });
  
  await Promise.all(promises);
  
  // Pequena pausa entre lotes
  if (i + batchSize < vehicleData.length) {
    console.log('⏳ Aguardando 2 segundos antes do próximo lote...');
    await delay(2000);
  }
}

console.log('\n🎉 IMPORTAÇÃO FINALIZADA!');
console.log(`   ✅ Sucesso: ${successCount} veículos`);
console.log(`   ❌ Erros: ${errorCount} veículos`);
console.log(`   📊 Total processado: ${successCount + errorCount}/${vehicleData.length}`);

if (errorCount > 0) {
  console.log('\n⚠️  ATENÇÃO: Alguns veículos falharam.');
  console.log('   Execute novamente o script para tentar importar os faltantes.');
}