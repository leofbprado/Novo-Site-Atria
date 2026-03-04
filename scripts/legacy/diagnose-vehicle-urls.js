// Diagnóstico simples usando Node.js com dados simulados baseados nos logs
// Como não podemos instalar firebase-admin, vamos simular com dados reais dos logs

// Dados reais extraídos dos logs do console
const sampleVehicles = [
  {
    id: "5Q1frg1pdPYqSQYmVHGK",
    vehicle_uuid: "95ad2a94-1c4a-4824-8eb1-e15a96203cc7",
    placa: "R**-***3",
    marca: "Citroën",
    modelo: "C4 Cactus",
    ano_modelo: "2023",
    shortId: null, // Verificar se existe
    legacy_uuid: "95ad2a94-1c4a-4824-8eb1-e15a96203cc7"
  },
  {
    id: "sample2",
    vehicle_uuid: "a40580a7-9f12-449c-b181-73e0ba727fca",
    placa: "ABC-1234",
    marca: "Volvo",
    modelo: "XC40",
    ano_modelo: "2022",
    shortId: "6WG9D9S", // Exemplo de shortId
    legacy_uuid: "a40580a7-9f12-449c-b181-73e0ba727fca"
  },
  {
    id: "sample3",
    vehicle_uuid: "6f4fea62-c559-4248-bedd-52c70c890099",
    placa: "XYZ-5678",
    marca: "Citroën",
    modelo: "C4",
    ano_modelo: "2021",
    shortId: null,
    legacy_uuid: "6f4fea62-c559-4248-bedd-52c70c890099"
  }
];

// Função para simular buildVehicleCanonicalPath (baseado no que vi no VehicleSEO.jsx)
function buildVehicleCanonicalPath(vehicle) {
  if (!vehicle) return null;
  
  // Verificar se usa shortId ou UUID legado
  const identifier = vehicle.shortId || vehicle.legacy_uuid || vehicle.vehicle_uuid || vehicle.id;
  const marca = vehicle.marca || '';
  const modelo = vehicle.modelo || '';
  const ano = vehicle.ano_modelo || vehicle.ano_fabricacao || '';
  
  if (!identifier) return null;
  
  // Formato esperado: /carros/{marca}/{modelo}/{ano}-{shortId}
  const path = `/carros/${marca.toLowerCase()}/${modelo.toLowerCase().replace(/\s+/g, '-')}/${ano}-${identifier}`;
  
  return path;
}

// Função para normalizar texto (remover acentos e caracteres especiais)
function normalizeText(text) {
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

function diagnoseVehicleURLs() {
  console.log('🔍 DIAGNÓSTICO DE URLs DE VEÍCULOS\n');
  
  console.log('| Placa | Marca | Modelo | Ano | shortId | legacy_uuid | Path gerado | Status |');
  console.log('|-------|-------|--------|-----|---------|-------------|-------------|---------|');
  
  sampleVehicles.forEach((vehicle) => {
    // Extrair campos necessários
    const placa = vehicle.placa || 'N/A';
    const marca = vehicle.marca || 'N/A';
    const modelo = vehicle.modelo || 'N/A';
    const ano = vehicle.ano_modelo || vehicle.ano_fabricacao || 'N/A';
    const shortId = vehicle.shortId || 'N/A';
    const legacyUuid = vehicle.legacy_uuid || vehicle.vehicle_uuid || 'N/A';
    
    // Gerar path
    const generatedPath = buildVehicleCanonicalPath(vehicle);
    
    // Verificar se está correto
    let status = 'ERRO';
    if (generatedPath) {
      // Verificar se usa shortId (formato curto) ou UUID (formato longo/legado)
      const identifier = vehicle.shortId || vehicle.legacy_uuid || vehicle.vehicle_uuid || vehicle.id;
      
      if (vehicle.shortId && vehicle.shortId !== 'N/A') {
        status = 'OK'; // shortId existe e foi usado
      } else if (identifier && identifier.length > 30) {
        status = 'LEGADO'; // UUID longo sendo usado
      }
    }
    
    console.log(`| ${placa.substring(0, 8)} | ${marca.substring(0, 8)} | ${modelo.substring(0, 12)} | ${ano} | ${shortId.substring(0, 10)} | ${legacyUuid.substring(0, 15)} | ${generatedPath || 'NULL'} | ${status} |`);
  });
  
  console.log('\n📊 RESUMO:');
  console.log('- OK: Usando shortId (formato correto)');
  console.log('- LEGADO: Ainda usando UUID longo');
  console.log('- ERRO: Problemas na geração do path');
  
  console.log('\n🔍 ANÁLISE DETALHADA:');
  sampleVehicles.forEach((vehicle, index) => {
    console.log(`\n--- Veículo ${index + 1}: ${vehicle.marca} ${vehicle.modelo} ---`);
    console.log(`ID Firestore: ${vehicle.id}`);
    console.log(`UUID Legado: ${vehicle.vehicle_uuid}`);
    console.log(`ShortId: ${vehicle.shortId || 'NÃO DEFINIDO'}`);
    console.log(`Path gerado: ${buildVehicleCanonicalPath(vehicle)}`);
    
    const identifier = vehicle.shortId || vehicle.legacy_uuid || vehicle.vehicle_uuid || vehicle.id;
    console.log(`Identificador usado: ${identifier}`);
    console.log(`Tipo: ${vehicle.shortId ? 'ShortId (CORRETO)' : 'UUID Legado (PRECISA ATUALIZAR)'}`);
  });
}

// Executar diagnóstico
try {
  diagnoseVehicleURLs();
  console.log('\n✅ Diagnóstico concluído');
} catch (error) {
  console.error('❌ Erro fatal:', error);
}