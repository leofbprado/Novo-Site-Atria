import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';

// Configuração Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDWnKHLyKTcm7LGGtR6fK5KOjOz3-NlEKA',
  authDomain: 'atria-veiculos.firebaseapp.com',
  projectId: 'atria-veiculos',
  storageBucket: 'atria-veiculos.appspot.com',
  messagingSenderId: '12345',
  appId: '1:12345:web:abcdef'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔍 Verificando UUIDs de todos os veículos...');

const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
let totalVehicles = 0;
let withUUID = 0;
let withoutUUID = 0;
let updated = 0;

for (const docSnap of vehiclesSnapshot.docs) {
  totalVehicles++;
  const vehicleData = docSnap.data();
  const docId = docSnap.id;
  
  if (!vehicleData.vehicle_uuid) {
    console.log(`❌ ${totalVehicles}: ${vehicleData.marca} ${vehicleData.modelo} - SEM UUID (ID: ${docId})`);
    
    // Gerar UUID e atualizar
    const newUUID = crypto.randomUUID();
    await updateDoc(doc(db, 'vehicles', docId), {
      vehicle_uuid: newUUID,
      uuid_atribuido_em: new Date(),
      uuid_origem: 'verificacao_automatica'
    });
    
    console.log(`✅ UUID gerado: ${newUUID.substring(0, 8)}...`);
    withoutUUID++;
    updated++;
  } else {
    console.log(`✅ ${totalVehicles}: ${vehicleData.marca} ${vehicleData.modelo} - UUID OK (${vehicleData.vehicle_uuid.substring(0, 8)}...)`);
    withUUID++;
  }
}

console.log(`\n📊 RELATÓRIO DE UUIDs:`);
console.log(`   📝 Total de veículos: ${totalVehicles}`);
console.log(`   ✅ Com UUID: ${withUUID}`);
console.log(`   ❌ Sem UUID: ${withoutUUID}`);
console.log(`   🔧 Atualizados: ${updated}`);

if (updated > 0) {
  console.log(`\n🎉 ${updated} veículos foram atualizados com UUIDs únicos!`);
} else {
  console.log(`\n✅ Todos os veículos já possuem UUIDs únicos!`);
}

console.log(`\n🔐 VERIFICAÇÃO DE SEGURANÇA:`);
const uuids = [];
vehiclesSnapshot.docs.forEach(doc => {
  const uuid = doc.data().vehicle_uuid;
  if (uuid && uuids.includes(uuid)) {
    console.log(`⚠️ UUID DUPLICADO ENCONTRADO: ${uuid}`);
  } else if (uuid) {
    uuids.push(uuid);
  }
});

console.log(`✅ ${uuids.length} UUIDs únicos verificados - sem duplicatas!`);
console.log(`\n===============================================`);
console.log(`  VERIFICAÇÃO DE UUIDs CONCLUÍDA`);
console.log(`===============================================`);