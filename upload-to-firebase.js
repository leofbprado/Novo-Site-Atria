import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

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

console.log('🚀 SCRIPT DE UPLOAD PARA FIREBASE');
console.log('==================================\n');

// Verificar arquivo local
if (!fs.existsSync('vehicle_data.json')) {
  console.error('❌ Arquivo vehicle_data.json não encontrado!');
  console.log('   Execute primeiro: node save-vehicles-locally.js');
  process.exit(1);
}

const vehicleData = JSON.parse(fs.readFileSync('vehicle_data.json', 'utf8'));

console.log(`📊 ${vehicleData.length} veículos prontos para upload`);
console.log('\n⚠️  IMPORTANTE:');
console.log('   1. Verifique as regras de segurança no Firebase Console');
console.log('   2. Certifique-se que as quotas foram resetadas');
console.log('   3. Confirme que o projeto está ativo\n');

// Função para fazer upload de um único veículo
async function uploadVehicle(vehicle) {
  try {
    await setDoc(doc(db, 'veiculos', vehicle.vehicle_uuid), vehicle);
    return { success: true, vehicle };
  } catch (error) {
    return { success: false, vehicle, error: error.message };
  }
}

// Função principal
async function main() {
  console.log('📤 Iniciando upload...\n');
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  // Upload sequencial para melhor controle
  for (let i = 0; i < vehicleData.length; i++) {
    const vehicle = vehicleData[i];
    const result = await uploadVehicle(vehicle);
    
    if (result.success) {
      results.success++;
      console.log(`✅ [${i+1}/${vehicleData.length}] ${vehicle.marca} ${vehicle.modelo}`);
    } else {
      results.failed++;
      results.errors.push(result);
      console.error(`❌ [${i+1}/${vehicleData.length}] ${vehicle.marca} ${vehicle.modelo}: ${result.error}`);
      
      // Se houver muitos erros consecutivos, parar
      if (results.failed > 5 && results.success === 0) {
        console.error('\n🛑 Muitos erros consecutivos. Verifique as permissões do Firebase.');
        break;
      }
    }
    
    // Pequena pausa a cada 50 veículos
    if ((i + 1) % 50 === 0) {
      console.log('\n⏳ Pausa de 3 segundos...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL:');
  console.log(`   ✅ Sucesso: ${results.success} veículos`);
  console.log(`   ❌ Falhas: ${results.failed} veículos`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ VEÍCULOS COM ERRO:');
    results.errors.slice(0, 5).forEach(err => {
      console.log(`   - ${err.vehicle.marca} ${err.vehicle.modelo}: ${err.error}`);
    });
    if (results.errors.length > 5) {
      console.log(`   ... e mais ${results.errors.length - 5} erros`);
    }
  }
  
  if (results.success === vehicleData.length) {
    console.log('\n🎉 TODOS OS VEÍCULOS FORAM IMPORTADOS COM SUCESSO!');
  }
}

// Executar
main().catch(console.error);