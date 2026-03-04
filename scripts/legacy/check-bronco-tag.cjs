const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkBroncoTag() {
  try {
    // Buscar o Ford Bronco
    const vehiclesRef = db.collection('veiculos');
    const broncoQuery = await vehiclesRef
      .where('marca', '==', 'Ford')
      .where('modelo', '==', 'Bronco')
      .get();
    
    console.log(`\n🔍 Encontrados ${broncoQuery.size} Ford Bronco(s)\n`);
    
    broncoQuery.forEach(doc => {
      const data = doc.data();
      console.log('📋 Veículo:', {
        id: doc.id,
        marca: data.marca,
        modelo: data.modelo,
        versao: data.versao,
        tag: data.tag,
        custom_tag: data.custom_tag,
        preco: data.preco
      });
      
      // Verificar estrutura da tag
      if (data.tag) {
        console.log('\n🏷️ Estrutura da tag:');
        console.log('  Tipo:', typeof data.tag);
        if (typeof data.tag === 'object') {
          console.log('  Conteúdo:', JSON.stringify(data.tag, null, 2));
        } else {
          console.log('  Valor:', data.tag);
        }
      }
      
      if (data.custom_tag) {
        console.log('\n🏷️ Estrutura da custom_tag:');
        console.log('  Tipo:', typeof data.custom_tag);
        if (typeof data.custom_tag === 'object') {
          console.log('  Conteúdo:', JSON.stringify(data.custom_tag, null, 2));
        } else {
          console.log('  Valor:', data.custom_tag);
        }
      }
      
      console.log('\n----------------------------\n');
    });
    
    // Também verificar as tags disponíveis
    console.log('📦 Tags personalizadas disponíveis no sistema:');
    const tagsSnapshot = await db.collection('tags_customizadas').get();
    tagsSnapshot.forEach(doc => {
      const tag = doc.data();
      console.log(`  - ${tag.nome} (${tag.cor})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit();
  }
}

checkBroncoTag();
