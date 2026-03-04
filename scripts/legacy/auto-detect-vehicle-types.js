const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const OpenAI = require('openai');

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBw3f7jKOk5ApzGsls45IQqhUCAA8jcFqQ",
  authDomain: "atria-veiculos.firebaseapp.com",
  projectId: "atria-veiculos",
  storageBucket: "atria-veiculos.firebasestorage.app",
  messagingSenderId: "863589438788",
  appId: "1:863589438788:web:63829cc90d759bc9abe1bc"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function detectAllVehicleTypes() {
  try {
    console.log('🔍 Buscando veículos sem tipo definido...');
    
    // Buscar todos os veículos
    const vehiclesSnapshot = await getDocs(collection(db, 'veiculos'));
    const allVehicles = [];
    
    vehiclesSnapshot.forEach((doc) => {
      const vehicle = { id: doc.id, ...doc.data() };
      allVehicles.push(vehicle);
    });
    
    // Filtrar veículos que não têm tipo_veiculo definido
    const vehiclesWithoutType = allVehicles.filter(vehicle => 
      !vehicle.tipo_veiculo || vehicle.tipo_veiculo === '' || vehicle.tipo_veiculo === null
    );
    
    console.log(`📊 Total de veículos: ${allVehicles.length}`);
    console.log(`🔧 Veículos sem tipo: ${vehiclesWithoutType.length}`);
    
    if (vehiclesWithoutType.length === 0) {
      console.log('✅ Todos os veículos já têm tipo definido!');
      return;
    }
    
    // Preparar dados para o GPT
    const vehiclesList = vehiclesWithoutType.map((vehicle, index) => {
      return `${index + 1}. ID: ${vehicle.vehicle_uuid || vehicle.id} | Marca: ${vehicle.marca || 'N/A'} | Modelo: ${vehicle.modelo || 'N/A'} | Versão: ${vehicle.versao || 'N/A'} | Ano: ${vehicle.ano || 'N/A'}`;
    }).join('\n');
    
    console.log('🤖 Enviando lista para análise do GPT...');
    
    // Fazer análise em lote com GPT
    const prompt = `Analise os seguintes veículos brasileiros e determine o tipo correto para cada um.

VEÍCULOS PARA ANÁLISE:
${vehiclesList}

TIPOS DISPONÍVEIS:
- Hatch: carros compactos de 2 ou 4 portas, traseira curta
- Sedan: carros de 4 portas com porta-malas separado e três volumes  
- SUV: veículos utilitários esportivos, mais altos, tração nas 4 rodas
- Pick-up: caminhonetes com caçamba de carga
- Crossover: mistura de SUV com hatch, mais baixo que SUV
- Coupé: carros esportivos de 2 portas
- Conversível: carros com capota retrátil
- Perua/SW: carros com traseira estendida tipo station wagon
- Minivan: vans para famílias com múltiplas fileiras de bancos
- Outros: se não se encaixar em nenhuma categoria

INSTRUÇÕES:
1. Para cada veículo, analise marca, modelo e versão
2. Considere o mercado brasileiro
3. Determine o tipo mais apropriado
4. Se houver dúvida, escolha o mais comum

RESPONDA EM JSON com este formato exato:
{
  "vehicles": [
    {
      "id": "ID_DO_VEICULO",
      "tipo_veiculo": "Tipo_Detectado"
    }
  ]
}

Importante: Use exatamente os IDs fornecidos e apenas os tipos da lista.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // usando o modelo mais avançado para melhor precisão
      messages: [
        {
          role: "system",
          content: "Você é um especialista automotivo brasileiro. Analise os veículos e determine o tipo correto baseado no mercado brasileiro. Responda sempre em JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.1, // baixa temperatura para respostas mais consistentes
    });

    const aiContent = response.choices[0].message.content;
    console.log('📝 Resposta do GPT recebida');
    
    // Parse da resposta
    let aiData;
    try {
      // Limpar resposta se necessário
      const cleanJson = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta do GPT:', parseError);
      console.log('Resposta original:', aiContent);
      return;
    }
    
    if (!aiData.vehicles || !Array.isArray(aiData.vehicles)) {
      console.error('❌ Formato de resposta inválido do GPT');
      return;
    }
    
    console.log(`🎯 GPT analisou ${aiData.vehicles.length} veículos`);
    
    // Atualizar veículos no Firestore
    let updatedCount = 0;
    const validTypes = ['Hatch', 'Sedan', 'SUV', 'Pick-up', 'Crossover', 'Coupé', 'Conversível', 'Perua/SW', 'Minivan', 'Outros'];
    
    for (const vehicleUpdate of aiData.vehicles) {
      try {
        // Validar tipo
        const detectedType = validTypes.includes(vehicleUpdate.tipo_veiculo) ? vehicleUpdate.tipo_veiculo : 'Outros';
        
        // Encontrar veículo correspondente
        const targetVehicle = vehiclesWithoutType.find(v => 
          (v.vehicle_uuid && v.vehicle_uuid === vehicleUpdate.id) || 
          v.id === vehicleUpdate.id
        );
        
        if (targetVehicle) {
          const docId = targetVehicle.vehicle_uuid || targetVehicle.id;
          
          await updateDoc(doc(db, 'veiculos', docId), {
            tipo_veiculo: detectedType,
            ai_detected_type: true, // flag para indicar que foi detectado por IA
            ai_detection_date: new Date().toISOString()
          });
          
          console.log(`✅ ${targetVehicle.marca} ${targetVehicle.modelo} → ${detectedType}`);
          updatedCount++;
        }
      } catch (updateError) {
        console.error(`❌ Erro ao atualizar veículo ${vehicleUpdate.id}:`, updateError);
      }
    }
    
    console.log(`\n🎉 CONCLUÍDO!`);
    console.log(`📊 Veículos analisados: ${vehiclesWithoutType.length}`);
    console.log(`✅ Veículos atualizados: ${updatedCount}`);
    console.log(`💰 Tokens GPT utilizados: 1 chamada única (economia máxima)`);
    
  } catch (error) {
    console.error('❌ Erro na detecção automática:', error);
  }
}

// Executar script
detectAllVehicleTypes();