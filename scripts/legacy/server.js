import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware CORS manual
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Serve static files from dist directory for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
}

// Endpoint para OpenAI
app.post('/openai', async (req, res) => {
  console.log('🚀 Requisição OpenAI recebida no servidor backend');
  
  const { prompt } = req.body;
  
  if (!prompt) {
    console.log('❌ Prompt vazio');
    return res.status(400).json({ error: 'Prompt é obrigatório' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ Chave OpenAI não configurada');
    return res.status(500).json({ error: 'Chave OpenAI não configurada' });
  }

  try {
    console.log('📤 Enviando requisição para OpenAI...');
    
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
      console.log(`❌ Erro OpenAI HTTP ${response.status}`);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'Limite de uso atingido' });
      }
      
      if (response.status === 401) {
        return res.status(401).json({ error: 'Chave da API inválida' });
      }
      
      return res.status(500).json({ error: 'Erro na API OpenAI' });
    }

    const data = await response.json();
    console.log('✅ OpenAI respondeu com sucesso');
    
    return res.json({
      content: data.choices[0].message.content
    });

  } catch (error) {
    console.error('💥 Erro no servidor:', error.message);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Servidor OpenAI rodando em http://0.0.0.0:${PORT}`);
  console.log(`✅ Chave OpenAI: ${process.env.OPENAI_API_KEY ? 'configurada' : 'não configurada'}`);
  console.log('🔗 Endpoints disponíveis: /openai, /health');
});