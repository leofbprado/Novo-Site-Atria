import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 80;
const DIST_PATH = join(__dirname, 'dist');

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = createServer(async (req, res) => {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // CSP headers removidos temporariamente para debugging

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle OpenAI API endpoint
  if (req.url === '/openai' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { prompt } = JSON.parse(body);
        
        if (!prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Prompt é obrigatório' }));
          return;
        }

        if (!process.env.OPENAI_API_KEY) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Chave OpenAI não configurada' }));
          return;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "Você é um especialista automotivo brasileiro. Sempre responda em português e forneça informações precisas sobre veículos do mercado brasileiro. Responda sempre em JSON válido."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 1500,
            temperature: 0.7,
          })
        });

        if (!response.ok) {
          if (response.status === 429) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Limite de uso atingido' }));
            return;
          }
          
          if (response.status === 401) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Chave da API inválida' }));
            return;
          }
          
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Erro na API OpenAI' }));
          return;
        }

        const data = await response.json();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          content: data.choices[0].message.content
        }));

      } catch (error) {
        console.error('💥 Erro no servidor:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        }));
      }
    });
    return;
  }

  // Handle lead capture endpoint
  if (req.url === '/api/lead' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { nome, email, telefone, mensagem, modelo, canal } = JSON.parse(body);
        
        // Validação dos campos obrigatórios
        if (!nome || !email || !telefone || !mensagem) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Campos obrigatórios: nome, email, telefone, mensagem' }));
          return;
        }

        // Configuração do Firebase usando as configurações existentes do projeto
        const { initializeApp, getApps } = await import('firebase/app');
        const { getFirestore, collection, addDoc, updateDoc, doc } = await import('firebase/firestore');
        
        const firebaseConfig = {
          apiKey: "AIzaSyCng1gtGC16C8NoYoc-B1fSk22q_bkhv0c",
          authDomain: "novo-site-atria.firebaseapp.com",
          projectId: "novo-site-atria",
          storageBucket: "novo-site-atria.firebasestorage.app",
          messagingSenderId: "1073104197604",
          appId: "1:1073104197604:web:67ee785a7a8f54ca0319f1"
        };

        // Verificar se o app já foi inicializado
        let app;
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }
        
        const db = getFirestore(app);

        // 1. Salvar no Firestore
        const leadData = {
          nome,
          email,
          telefone,
          mensagem,
          modelo: modelo || '',
          canal: canal || 'Orgânico',
          timestamp: new Date(),
          enviado: false
        };

        const docRef = await addDoc(collection(db, 'leads_site'), leadData);
        console.log('📝 Lead salvo no Firestore com ID:', docRef.id);

        // 2. Enviar para CRM Autopop360
        const crmPayload = {
          "Rota": "lead-novo",
          "Empresa": "TFQMKVULUG",
          "Objeto": {
            "nome": nome,
            "email": email,
            "whatsapp": telefone,
            "telefone": telefone,
            "mensagem": mensagem,
            "modelo": modelo || '',
            "receber_email": "SIM",
            "receber_whatsapp": "SIM",
            "receber_telefone": "SIM",
            "veiculo_na_troca": "NÃO",
            "placa": "",
            "unidade": "KJPE8E67TY",
            "ano_modelo": "",
            "kilometragem": "",
            "data_agenda": "",
            "servico": "",
            "departamento": "Veículos",
            "numeroUnico_segmentos_de_lead": "fUyQVHGfrD86SYPFAKCZNuZvXRkk13",
            "numeroUnico_departamentos_de_lead": "NyDjUMSiGuEbCn8SnPpUPa7YB1DjV4",
            "numeroUnico_canais_de_lead": "nisimqUwyFN6xK81xafsiIVHx4lQ6f",
            "numeroUnico_fontes_de_lead": "z3uaM6VEQCbtYlTVZ3vYysirJZgMlM",
            "data": new Date().toISOString().split('T')[0]
          }
        };

        const crmResponse = await fetch('https://api.autopop360.com/lead-novo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(crmPayload)
        });

        console.log('🔄 Enviando lead para CRM...');
        console.log('📤 URL do CRM:', 'https://api.autopop360.com/lead-novo');
        console.log('📦 Payload do CRM:', JSON.stringify(crmPayload, null, 2));
        
        if (crmResponse.ok) {
          const crmResponseText = await crmResponse.text();
          console.log('✅ Resposta do CRM:', crmResponseText);
          
          // Atualizar o status no Firestore para enviado: true
          await updateDoc(doc(db, 'leads_site', docRef.id), {
            enviado: true,
            crm_response: crmResponseText
          });
          console.log('✅ Lead enviado com sucesso para o CRM');
        } else {
          const errorText = await crmResponse.text();
          console.error('❌ Erro do CRM:', crmResponse.status, errorText);
          
          // Salvar erro no Firestore
          await updateDoc(doc(db, 'leads_site', docRef.id), {
            enviado: false,
            crm_error: `${crmResponse.status}: ${errorText}`
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Lead capturado e enviado com sucesso',
          leadId: docRef.id
        }));

      } catch (error) {
        console.error('💥 Erro ao processar lead:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        }));
      }
    });
    return;
  }

  // Handle Credere webhook
  if (req.url === '/api/webhook/credere' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const webhookData = JSON.parse(body);
        
        console.log('🔔 Webhook Credere recebido:', {
          event: webhookData.event,
          timestamp: new Date().toISOString()
        });
        
        // Log completo para debug
        console.log('📋 Payload completo:', JSON.stringify(webhookData, null, 2));
        
        // Processar simulação processada
        if (webhookData.event === 'processed_simulation' && webhookData.simulation) {
          const simulation = webhookData.simulation;
          
          // Configuração do Firebase
          const { initializeApp, getApps } = await import('firebase/app');
          const { getFirestore, setDoc, doc, getDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
          
          const firebaseConfig = {
            apiKey: "AIzaSyCng1gtGC16C8NoYoc-B1fSk22q_bkhv0c",
            authDomain: "novo-site-atria.firebaseapp.com",
            projectId: "novo-site-atria",
            storageBucket: "novo-site-atria.firebasestorage.app",
            messagingSenderId: "1073104197604",
            appId: "1:1073104197604:web:67ee785a7a8f54ca0319f1"
          };

          let app;
          if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
          } else {
            app = getApps()[0];
          }
          
          const db = getFirestore(app);
          
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
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: `Webhook ${webhookData.event} processado com sucesso`,
          timestamp: new Date().toISOString()
        }));
        
      } catch (error) {
        console.error('💥 Erro ao processar webhook Credere:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Erro interno do servidor', 
          details: error.message 
        }));
      }
    });
    return;
  }

  // Handle health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Serve static files
  let filePath = req.url === '/' ? join(DIST_PATH, 'index.html') : join(DIST_PATH, req.url);
  
  // Clean path and remove query strings
  filePath = filePath.split('?')[0];

  // Check if file exists
  if (!existsSync(filePath)) {
    // For SPA routing, serve index.html for non-API routes
    if (!req.url.startsWith('/api') && !req.url.includes('.')) {
      filePath = join(DIST_PATH, 'index.html');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
  }

  // Check if it's a directory
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  try {
    const ext = extname(filePath);
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    const content = readFileSync(filePath);
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(content);
  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`✅ Servindo arquivos de: ${DIST_PATH}`);
  console.log(`🔗 Endpoints disponíveis: /openai, /health, /api/lead, /api/webhook/credere`);
  console.log(`🌐 OpenAI configurado: ${!!process.env.OPENAI_API_KEY ? 'Sim' : 'Não'}`);
});