// Testar o novo sistema de detecção inteligente

const existingVehicles = {};

// Dados existentes (Ford Bronco Sport)
const existingData = [
  {
    id: 'doc1',
    placa: 'ABC1234',
    modelo: 'Bronco Sport',
    ano: 2021,
    marca: 'Ford'
  }
];

// Indexar com nova lógica
existingData.forEach((data) => {
  const placaNormalizada = data.placa.replace(/[-\s]/g, '').toLowerCase();
  const modeloNormalizado = data.modelo.toLowerCase();
  const anoNormalizado = data.ano.toString();
  
  // Chave principal
  const key = `${placaNormalizada}_${modeloNormalizado}_${anoNormalizado}`;
  existingVehicles[key] = { id: data.id, data };
  
  // Chave placa+ano
  const keyPlacaAno = `${placaNormalizada}_${anoNormalizado}`;
  existingVehicles[keyPlacaAno] = { id: data.id, data };
  
  // Chave modelo simplificado
  const modeloSimplificado = modeloNormalizado.replace(/\s+(sport|plus|life|comfort|style|trend|titanium|sel|se)\b/g, '').trim();
  if (modeloSimplificado !== modeloNormalizado) {
    const keySimplificada = `${placaNormalizada}_${modeloSimplificado}_${anoNormalizado}`;
    existingVehicles[keySimplificada] = { id: data.id, data };
  }
});

console.log('📋 CHAVES INDEXADAS:');
Object.keys(existingVehicles).forEach(key => {
  console.log(`  "${key}"`);
});

// Testar entrada problemática da planilha
const planilhaEntry = {
  Placa: 'ABC1234',
  Modelo: 'Bronco',  // SEM "Sport"
  'Ano Modelo': '2021'
};

const placa = planilhaEntry.Placa;
const modelo = planilhaEntry.Modelo;  
const ano = planilhaEntry['Ano Modelo'];

const placaNormalizada = placa.replace(/[-\s]/g, '').toLowerCase();
const modeloNormalizado = modelo.toLowerCase();
const anoNormalizado = ano.toString();

let existingVehicle = null;
let matchStrategy = '';

// Estratégia 1: Exata
const chaveExata = `${placaNormalizada}_${modeloNormalizado}_${anoNormalizado}`;
existingVehicle = existingVehicles[chaveExata];
if (existingVehicle) matchStrategy = 'exata';

// Estratégia 2: Placa+Ano  
if (!existingVehicle) {
  const chavePlacaAno = `${placaNormalizada}_${anoNormalizado}`;
  existingVehicle = existingVehicles[chavePlacaAno];
  if (existingVehicle) matchStrategy = 'placa+ano';
}

// Estratégia 3: Modelo simplificado
if (!existingVehicle) {
  const modeloSimplificado = modeloNormalizado.replace(/\s+(sport|plus|life|comfort|style|trend|titanium|sel|se)\b/g, '').trim();
  const chaveSimplificada = `${placaNormalizada}_${modeloSimplificado}_${anoNormalizado}`;
  existingVehicle = existingVehicles[chaveSimplificada];
  if (existingVehicle) matchStrategy = 'modelo_simplificado';
}

console.log('\n🔍 TESTE FORD BRONCO:');
console.log(`Entrada: ${placa} - ${modelo} ${ano}`);
console.log(`Chave buscada: "${chaveExata}"`);
console.log(`Encontrado: ${!!existingVehicle}`);
console.log(`Estratégia: ${matchStrategy}`);

if (existingVehicle) {
  console.log(`✅ SUCESSO: Detectou "${existingVehicle.data.modelo}" existente`);
  console.log(`🔄 AÇÃO: ATUALIZAR (não duplicar)`);
} else {
  console.log(`❌ FALHA: Não detectou, criaria duplicata`);
}