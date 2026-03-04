// Script para verificar estrutura completa dos veículos existentes
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.firebasestorage.app",
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkVehicleStructure() {
  try {
    console.log("📋 Verificando estrutura dos veículos existentes...");
    const vehiclesRef = collection(db, 'veiculos');
    const q = query(vehiclesRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("❌ Nenhum veículo encontrado no banco");
      return;
    }
    
    const doc = snapshot.docs[0];
    const vehicleData = doc.data();
    
    console.log("✅ Estrutura do veículo existente:");
    console.log(JSON.stringify(vehicleData, null, 2));
    
    console.log("\n📊 Campos disponíveis:");
    Object.keys(vehicleData).forEach(key => {
      console.log(`- ${key}: ${typeof vehicleData[key]}`);
    });
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

checkVehicleStructure();