// Debug script para verificar estrutura dos dados dos veículos e filtro de categoria
// Executa: node debug-category-filter.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAjQx_YXEaUhFNIgwZELRsBWU7Z3Ou8-Ms",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "atria-veiculos.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "atria-veiculos",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "atria-veiculos.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1079046587249",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:1079046587249:web:39d3c5b8b3c88b4ea73b8f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugCategoryData() {
  try {
    console.log('🔍 Carregando veículos para debug de categorias...');
    
    // Buscar alguns veículos para análise
    const vehiclesCollection = collection(db, 'veiculos');
    const q = query(vehiclesCollection, limit(20));
    const vehiclesSnapshot = await getDocs(q);
    
    const vehicles = [];
    vehiclesSnapshot.forEach((doc) => {
      vehicles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`\n📋 Total de veículos analisados: ${vehicles.length}`);
    
    // Analisar campos de categoria disponíveis
    const categoryFields = {};
    const allCategoryValues = new Set();
    
    vehicles.forEach(vehicle => {
      // Verificar todos os possíveis campos de categoria
      ['categoria', 'tipo_veiculo', 'tipo', 'category'].forEach(field => {
        if (vehicle[field]) {
          if (!categoryFields[field]) {
            categoryFields[field] = new Set();
          }
          categoryFields[field].add(vehicle[field]);
          allCategoryValues.add(vehicle[field]);
        }
      });
    });
    
    console.log('\n🔍 CAMPOS DE CATEGORIA ENCONTRADOS:');
    Object.keys(categoryFields).forEach(field => {
      console.log(`\n${field}:`);
      console.log(Array.from(categoryFields[field]).sort());
    });
    
    console.log('\n📝 TODOS OS VALORES DE CATEGORIA ÚNICOS:');
    console.log(Array.from(allCategoryValues).sort());
    
    // Testar filtro pick-up especificamente
    console.log('\n🧪 TESTE DE FILTRO PICK-UP:');
    const pickupFilter = ['pick-up'];
    const filteredVehicles = vehicles.filter(vehicle => {
      const vehicleType = vehicle.categoria || vehicle.tipo_veiculo || vehicle.tipo || vehicle.category || '';
      
      const matches = pickupFilter.some(filterType => {
        const lowerFilterType = filterType.toLowerCase().trim();
        const lowerVehicleType = vehicleType.toLowerCase().trim();
        
        const typeMatches = 
          lowerVehicleType.includes(lowerFilterType) ||
          lowerFilterType.includes(lowerVehicleType) ||
          (lowerFilterType === 'pickup' && (lowerVehicleType.includes('pick-up') || lowerVehicleType.includes('picape'))) ||
          (lowerFilterType === 'pick-up' && lowerVehicleType.includes('pickup'));
        
        return typeMatches;
      });
      
      return matches;
    });
    
    console.log(`Veículos encontrados com filtro 'pick-up': ${filteredVehicles.length}`);
    if (filteredVehicles.length > 0) {
      console.log('Exemplos encontrados:');
      filteredVehicles.slice(0, 3).forEach(v => {
        console.log(`- ${v.marca} ${v.modelo} (${v.categoria || v.tipo_veiculo || v.tipo || v.category})`);
      });
    }
    
    // Mostrar alguns exemplos de veículos e suas categorias
    console.log('\n📋 EXEMPLOS DE VEÍCULOS E SUAS CATEGORIAS:');
    vehicles.slice(0, 10).forEach(vehicle => {
      console.log(`${vehicle.marca} ${vehicle.modelo}:`);
      console.log(`  - categoria: ${vehicle.categoria || 'N/A'}`);
      console.log(`  - tipo_veiculo: ${vehicle.tipo_veiculo || 'N/A'}`);
      console.log(`  - tipo: ${vehicle.tipo || 'N/A'}`);
      console.log(`  - category: ${vehicle.category || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao debugar dados de categoria:', error);
  }
}

debugCategoryData();