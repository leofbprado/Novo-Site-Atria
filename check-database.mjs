import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJV4aXIX1dxcaA1TfP5Mft7m8LICakhxo",
  authDomain: "atria-veiculos-96787.firebaseapp.com",
  projectId: "atria-veiculos-96787",
  storageBucket: "atria-veiculos-96787.firebasestorage.app",
  messagingSenderId: "454661638104",
  appId: "1:454661638104:web:c1b039f7d4c3cf59c9bd13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabase() {
  console.log('🔍 Verificando banco de dados Firestore...\n');
  
  try {
    // 1. Check total vehicles
    const vehiclesRef = collection(db, 'veiculos');
    const allVehiclesSnapshot = await getDocs(vehiclesRef);
    console.log(`📊 Total de veículos no banco: ${allVehiclesSnapshot.size}`);
    
    // 2. Check active vehicles
    const activeQuery = query(vehiclesRef, where('ativo', '==', true));
    const activeSnapshot = await getDocs(activeQuery);
    console.log(`✅ Veículos ativos: ${activeSnapshot.size}`);
    
    // 3. Check "Mais Vendidos" vehicles
    const maisVendidosQuery = query(vehiclesRef, where('mais_vendidos', '==', true));
    const maisVendidosSnapshot = await getDocs(maisVendidosQuery);
    console.log(`⭐ Veículos "Mais Vendidos": ${maisVendidosSnapshot.size}`);
    
    // 4. Show first 3 vehicles as sample
    console.log('\n📋 Amostra dos primeiros 3 veículos:');
    let count = 0;
    allVehiclesSnapshot.forEach((doc) => {
      if (count < 3) {
        const data = doc.data();
        console.log(`\n${count + 1}. ${data.marca} ${data.modelo}`);
        console.log(`   - UUID: ${data.vehicle_uuid}`);
        console.log(`   - Preço: R$ ${data.preco?.toLocaleString('pt-BR')}`);
        console.log(`   - Ativo: ${data.ativo ? '✅' : '❌'}`);
        console.log(`   - Mais Vendido: ${data.mais_vendidos ? '⭐' : '❌'}`);
        console.log(`   - Fotos: ${data.photos?.length || 0}`);
        count++;
      }
    });
    
    // 5. Check for specific fields
    console.log('\n🔍 Verificando campos importantes:');
    let withUUID = 0;
    let withPhotos = 0;
    let withPrice = 0;
    
    allVehiclesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.vehicle_uuid) withUUID++;
      if (data.photos && data.photos.length > 0) withPhotos++;
      if (data.preco && data.preco > 0) withPrice++;
    });
    
    console.log(`   - Com UUID: ${withUUID}/${allVehiclesSnapshot.size}`);
    console.log(`   - Com fotos: ${withPhotos}/${allVehiclesSnapshot.size}`);
    console.log(`   - Com preço válido: ${withPrice}/${allVehiclesSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
  }
  
  process.exit(0);
}

checkDatabase();