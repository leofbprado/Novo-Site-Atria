import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';

// Configuração do banco ANTIGO (origem)
const oldFirebaseConfig = {
  apiKey: "AIzaSyBJV4aXIX1dxcaA1TfP5Mft7m8LICakhxo",
  authDomain: "atria-veiculos-96787.firebaseapp.com",
  projectId: "atria-veiculos-96787",
  storageBucket: "atria-veiculos-96787.firebasestorage.app",
  messagingSenderId: "454661638104",
  appId: "1:454661638104:web:c1b039f7d4c3cf59c9bd13"
};

// Configuração do banco NOVO (destino)
const newFirebaseConfig = {
  apiKey: "AIzaSyCng1gtGC16C8NoYoc-B1fSk22q_bkhv0c",
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.firebasestorage.app",
  messagingSenderId: "1073104197604",
  appId: "1:1073104197604:web:67ee785a7a8f54ca0319f1"
};

// Inicializar ambos os bancos
const oldApp = initializeApp(oldFirebaseConfig, 'old');
const newApp = initializeApp(newFirebaseConfig, 'new');

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);

async function migrateVehicles() {
  console.log('🚀 Iniciando migração de veículos...\n');
  
  try {
    // 1. Buscar todos os veículos do banco antigo
    console.log('📥 Buscando veículos do banco antigo (atria-veiculos-96787)...');
    const oldVehiclesRef = collection(oldDb, 'veiculos');
    const oldSnapshot = await getDocs(oldVehiclesRef);
    
    console.log(`✅ Encontrados ${oldSnapshot.size} veículos no banco antigo\n`);
    
    if (oldSnapshot.size === 0) {
      console.log('⚠️  Nenhum veículo encontrado no banco antigo!');
      process.exit(0);
    }
    
    // 2. Migrar veículos em lotes
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    const vehicles = [];
    
    oldSnapshot.forEach((doc) => {
      vehicles.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    console.log('📤 Iniciando migração para o novo banco (novo-site-atria)...\n');
    
    for (let i = 0; i < vehicles.length; i += batchSize) {
      const batch = vehicles.slice(i, i + batchSize);
      console.log(`📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(vehicles.length/batchSize)}`);
      
      const promises = batch.map(async (vehicle) => {
        try {
          // Usar o mesmo ID do documento original
          await setDoc(doc(newDb, 'veiculos', vehicle.id), vehicle.data);
          successCount++;
          
          const vehicleInfo = vehicle.data.marca && vehicle.data.modelo 
            ? `${vehicle.data.marca} ${vehicle.data.modelo}` 
            : vehicle.id;
          console.log(`   ✅ ${vehicleInfo}`);
          return true;
        } catch (error) {
          errorCount++;
          console.error(`   ❌ Erro ao migrar ${vehicle.id}: ${error.message}`);
          return false;
        }
      });
      
      await Promise.all(promises);
      
      // Pequena pausa entre lotes para evitar sobrecarga
      if (i + batchSize < vehicles.length) {
        console.log('   ⏳ Aguardando 1 segundo...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n🎉 MIGRAÇÃO FINALIZADA!');
    console.log(`   ✅ Sucesso: ${successCount} veículos`);
    console.log(`   ❌ Erros: ${errorCount} veículos`);
    console.log(`   📊 Total processado: ${successCount + errorCount}/${vehicles.length}`);
    
    // 3. Verificar o novo banco
    console.log('\n🔍 Verificando o novo banco...');
    const newVehiclesRef = collection(newDb, 'veiculos');
    const newSnapshot = await getDocs(newVehiclesRef);
    console.log(`✅ Total de veículos no novo banco: ${newSnapshot.size}`);
    
    // Mostrar amostra
    console.log('\n📋 Amostra dos primeiros 3 veículos migrados:');
    let count = 0;
    newSnapshot.forEach((doc) => {
      if (count < 3) {
        const data = doc.data();
        console.log(`\n${count + 1}. ${data.marca} ${data.modelo}`);
        console.log(`   - UUID: ${data.vehicle_uuid}`);
        console.log(`   - Fotos: ${data.photos?.length || 0}`);
        count++;
      }
    });
    
  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
  }
  
  process.exit(0);
}

migrateVehicles();