import express from 'express';
import { OpenAI } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.json());

// CORS middleware
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

// Endpoint OpenAI
app.post('/openai', async (req, res) => {
  console.log('🤖 Requisição OpenAI recebida no express-server');
  
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
    console.log('✅ Enviando para OpenAI:', prompt.substring(0, 100) + '...');
    
    const completion = await openai.chat.completions.create({
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
    });

    console.log('✅ OpenAI respondeu com sucesso');
    
    return res.json({
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('❌ Erro OpenAI:', error.message);
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Limite de uso atingido' });
    }
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'Chave da API inválida' });
    }

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Átria Veículos OpenAI API Server',
    status: 'running',
    endpoints: ['/openai', '/health']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Express OpenAI Server rodando em http://0.0.0.0:${PORT}`);
  console.log(`✅ API OpenAI ${process.env.OPENAI_API_KEY ? 'configurada' : 'NÃO configurada'}`);
});