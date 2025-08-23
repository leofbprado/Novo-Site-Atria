import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function diagnoseBronco() {
  try {
    console.log('\n🔍 DIAGNÓSTICO COMPLETO DA FORD BRONCO\n');
    console.log('=' .repeat(50));
    
    // 1. Buscar TODOS os Ford Bronco (sem filtro ativo)
    const allBroncos = await db.collection('veiculos')
      .where('marca', '==', 'Ford')
      .get();
    
    console.log(`\n1️⃣ Total de Ford no banco: ${allBroncos.size}`);
    
    let broncoCount = 0;
    allBroncos.forEach(doc => {
      const data = doc.data();
      if (data.modelo && data.modelo.includes('Bronco')) {
        broncoCount++;
        console.log(`\n📌 Ford Bronco encontrada:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Modelo: ${data.modelo}`);
        console.log(`   Ativo: ${data.ativo}`);
        console.log(`   Tag: ${data.tag}`);
        console.log(`   Custom_tag: ${data.custom_tag}`);
        console.log(`   UUID: ${data.vehicle_uuid}`);
        
        // Verificar campo ativo
        if (data.ativo === false || data.ativo === undefined) {
          console.log(`   ⚠️ PROBLEMA: Campo 'ativo' = ${data.ativo}`);
        }
      }
    });
    
    console.log(`\n2️⃣ Total de Ford Bronco: ${broncoCount}`);
    
    // 2. Buscar apenas veículos ativos (como o código faz)
    const activeBroncos = await db.collection('veiculos')
      .where('marca', '==', 'Ford')
      .where('ativo', '==', true)
      .get();
    
    let activeBroncoCount = 0;
    activeBroncos.forEach(doc => {
      const data = doc.data();
      if (data.modelo && data.modelo.includes('Bronco')) {
        activeBroncoCount++;
      }
    });
    
    console.log(`\n3️⃣ Ford Bronco ATIVAS: ${activeBroncoCount}`);
    
    // 3. Diagnóstico final
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNÓSTICO FINAL:');
    if (broncoCount > 0 && activeBroncoCount === 0) {
      console.log('❌ A Ford Bronco existe mas NÃO está marcada como ativa!');
      console.log('   Solução: Definir campo "ativo" = true no Firestore');
    } else if (broncoCount === 0) {
      console.log('❌ Não existe Ford Bronco no banco de dados');
    } else {
      console.log('✅ Ford Bronco está ativa e deveria aparecer no grid');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit();
  }
}

diagnoseBronco();
