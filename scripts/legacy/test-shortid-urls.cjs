const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  projectId: 'novo-site-atria'
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para normalizar texto (mesma do vehiclePaths.js)
function normalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Função para gerar URL canônica (mesma do vehiclePaths.js)
function buildVehicleCanonicalPath(vehicle) {
  if (!vehicle) return null;
  
  const marca = normalize(vehicle.marca);
  const modelo = normalize(vehicle.modelo);
  const ano = vehicle.ano_modelo || vehicle.ano_fabricacao || '';
  const id = vehicle.shortId || vehicle.codigo;
  
  if (!marca || !modelo || !ano || !id) {
    return null;
  }
  
  return `/carros/${marca}/${modelo}/${ano}-${id}`;
}

// Função principal para testar URLs com shortId
async function testShortIdUrls() {
  console.log('🔍 TESTANDO URLS COM SHORTID\n');
  
  let totalVehicles = 0;
  let vehiclesWithShortId = 0;
  let vehiclesWithValidUrls = 0;
  let vehiclesWithLegacyUuid = 0;
  let examples = [];
  
  try {
    // Buscar todos os veículos
    console.log('📥 Buscando todos os veículos do Firestore...');
    const vehiclesRef = collection(db, 'veiculos');
    const snapshot = await getDocs(vehiclesRef);
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}\n`);
    
    // Analisar cada veículo
    for (const docSnap of snapshot.docs) {
      const vehicle = { id: docSnap.id, ...docSnap.data() };
      totalVehicles++;
      
      const placa = vehicle.placa || 'N/A';
      const shortId = vehicle.shortId;
      const hasLegacyUuid = !!(vehicle.legacy_uuid || vehicle.vehicle_uuid);
      
      if (hasLegacyUuid) {
        vehiclesWithLegacyUuid++;
      }
      
      if (shortId && typeof shortId === 'string' && shortId.length === 5) {
        vehiclesWithShortId++;
        
        // Tentar gerar URL canônica
        const canonicalUrl = buildVehicleCanonicalPath(vehicle);
        
        if (canonicalUrl) {
          vehiclesWithValidUrls++;
          
          // Adicionar exemplos
          if (examples.length < 10) {
            examples.push({
              placa: placa,
              marca: vehicle.marca || 'N/A',
              modelo: vehicle.modelo || 'N/A',
              ano: vehicle.ano_modelo || vehicle.ano_fabricacao || 'N/A',
              shortId: shortId,
              url: canonicalUrl,
              hasLegacyUuid: hasLegacyUuid
            });
          }
          
          console.log(`✅ [${totalVehicles}] ${placa} → ${canonicalUrl}`);
        } else {
          console.log(`❌ [${totalVehicles}] ${placa} → Dados insuficientes para URL`);
        }
      } else {
        console.log(`⚠️  [${totalVehicles}] ${placa} → Sem shortId válido (${shortId})`);
      }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RELATÓRIO FINAL DOS TESTES DE URL');
    console.log('='.repeat(70));
    console.log(`📝 Total de veículos: ${totalVehicles}`);
    console.log(`🆔 Veículos com shortId válido (5 chars): ${vehiclesWithShortId}`);
    console.log(`🔗 Veículos com URLs válidas: ${vehiclesWithValidUrls}`);
    console.log(`🏷️  Veículos ainda com legacy_uuid: ${vehiclesWithLegacyUuid}`);
    console.log(`🎯 Taxa de sucesso URL: ${totalVehicles > 0 ? ((vehiclesWithValidUrls / totalVehicles) * 100).toFixed(1) : 0}%`);
    console.log(`🔧 Taxa shortId: ${totalVehicles > 0 ? ((vehiclesWithShortId / totalVehicles) * 100).toFixed(1) : 0}%`);
    
    console.log('\n📋 EXEMPLOS DE URLS GERADAS:');
    console.log('| Placa | Marca | Modelo | Ano | ShortId | URL Gerada |');
    console.log('|-------|-------|--------|-----|---------|------------|');
    
    examples.forEach(example => {
      const marca = example.marca.substring(0, 8).padEnd(8);
      const modelo = example.modelo.substring(0, 10).padEnd(10);
      const ano = String(example.ano).padEnd(4);
      const url = example.url.length > 40 ? example.url.substring(0, 37) + '...' : example.url;
      console.log(`| ${example.placa.padEnd(8)} | ${marca} | ${modelo} | ${ano} | ${example.shortId} | ${url} |`);
    });
    
    if (vehiclesWithValidUrls === totalVehicles) {
      console.log('\n🎉 SUCESSO! Todos os veículos têm URLs válidas com shortId!');
    } else {
      console.log(`\n⚠️  ${totalVehicles - vehiclesWithValidUrls} veículos ainda precisam de ajustes.`);
    }
    
    console.log('\n🔄 FORMATO DAS NOVAS URLS:');
    console.log('   Antes: /veiculo/a40580a7-9f12-449c-b181-73e0ba727fca');
    console.log('   Depois: /carros/volvo/xc40/2022-6WG9D');
    console.log('\n✅ URLs mais limpas, SEO-friendly e fáceis de compartilhar!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    throw error;
  }
}

// Executar o teste
testShortIdUrls()
  .then(() => {
    console.log('\n🎯 Teste finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });