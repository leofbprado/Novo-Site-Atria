// Servidor simples para receber webhooks do Credere
import express from 'express';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Middleware para processar JSON
app.use(express.json());

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCng1gtGC16C8NoYoc-B1fSk22q_bkhv0c",
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.firebasestorage.app",
  messagingSenderId: "1073104197604",
  appId: "1:1073104197604:web:67ee785a7a8f54ca0319f1"
};

// Inicializar Firebase
let firebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}
const db = getFirestore(firebaseApp);

// Endpoint principal do webhook
app.post('/api/webhook/credere', async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('🔔 Webhook Credere recebido:', {
      event: webhookData.event,
      timestamp: new Date().toISOString()
    });
    
    // Log completo para debug
    console.log('📋 Payload completo:', JSON.stringify(webhookData, null, 2));
    
    // Processar simulação processada
    if (webhookData.event === 'processed_simulation' && webhookData.simulation) {
      const simulation = webhookData.simulation;
      
      // Extrair CPF limpo
      const cpfClean = (simulation.lead?.cpf_cnpj || '').replace(/\D/g, '');
      const simulacaoId = `${cpfClean}-${simulation.uuid || Date.now()}`;
      
      // Preparar dados do lead
      const leadData = {
        simulacao_id: simulacaoId,
        nome: simulation.lead?.name || '',
        cpf: cpfClean,
        telefone: simulation.lead?.phone_number || '',
        email: simulation.lead?.email || '',
        entrada: simulation.conditions?.[0]?.down_payment || 0,
        parcelas: simulation.conditions?.[0]?.installments || 0,
        valor_veiculo: simulation.vehicle?.asset_value || simulation.assets_value || 0,
        status_interacao: 'simulado',
        data_criacao: new Date().toISOString(),
        origem: 'webhook_credere',
        
        veiculo: {
          nome: `${simulation.vehicle?.vehicle_model?.brand || ''} ${simulation.vehicle?.vehicle_model?.model_name || ''} ${simulation.vehicle?.vehicle_model?.version || ''}`.trim(),
          ano_fabricacao: simulation.vehicle?.manufacture_year || '',
          ano_modelo: simulation.vehicle?.model_year || '',
          valor: simulation.vehicle?.asset_value || 0,
          fipe_code: simulation.vehicle?.vehicle_model?.fipe_code || '',
          molicar_code: simulation.vehicle?.vehicle_model?.molicar_code || ''
        },
        
        loja: {
          id: simulation.store?.id || '',
          nome: simulation.store?.name || '',
          cnpj: simulation.store?.cnpj || ''
        },
        
        vendedor: {
          id: simulation.seller?.id || '',
          nome: simulation.seller?.name || '',
          cpf: simulation.seller?.cpf || ''
        },
        
        eventos: [{
          tipo: 'webhook_recebido',
          timestamp: new Date().toISOString(),
          dados: webhookData
        }]
      };
      
      // Verificar se já existe o documento
      const docRef = doc(db, 'leads_simulacao', simulacaoId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Criar novo documento
        await setDoc(docRef, leadData);
        console.log('✅ Lead de simulação salvo via webhook:', simulacaoId);
      } else {
        // Atualizar documento existente
        await updateDoc(docRef, {
          status_interacao: 'simulado_novamente',
          eventos: arrayUnion({
            tipo: 'webhook_atualizado',
            timestamp: new Date().toISOString()
          })
        });
        console.log('✅ Lead de simulação atualizado via webhook:', simulacaoId);
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: `Webhook ${webhookData.event} processado com sucesso`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Erro ao processar webhook Credere:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'webhook-server',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de webhook rodando na porta ${PORT}`);
  console.log(`📍 Endpoint disponível em: http://localhost:${PORT}/api/webhook/credere`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});