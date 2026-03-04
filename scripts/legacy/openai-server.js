import express from 'express';

const app = express();
const PORT = 8000;

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

app.use(express.json());

// Endpoint OpenAI
app.post('/openai', async (req, res) => {
  console.log('🤖 OpenAI endpoint recebido');
  
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório' });
  }

  try {
    // Para teste - simular resposta da IA
    const mockResponse = {
      "marca_corrigida": "Honda",
      "modelo_corrigido": "Civic",
      "versao_corrigida": "LX 1.8",
      "tipo_veiculo_corrigido": "Sedan",
      "combustivel_corrigido": "Flex",
      "cambio_corrigido": "Automático",
      "descricao_corrigida": "Honda Civic LX 1.8 em excelente estado de conservação. Veículo com baixa quilometragem, ideal para quem busca conforto e economia. Mantido sempre em garagem, com revisões em dia.",
      "opcionais_corrigidos": {
        "INTERIOR": ["Ar-condicionado", "Direção hidráulica", "Vidros elétricos", "Travas elétricas"],
        "EXTERIOR": ["Faróis de neblina", "Rodas de liga leve", "Para-choques na cor do veículo", "Retrovisores elétricos"],
        "SEGURANÇA": ["Airbag duplo", "Freios ABS", "Alarme", "Travamento automático"],
        "CONFORTO": ["Som com MP3", "Banco do motorista regulável", "Computador de bordo", "Limpador traseiro"]
      },
      "especificacoes_tecnicas": {
        "comprimento": "4540 mm",
        "largura": "1755 mm",
        "altura": "1465 mm",
        "porta_malas": "519 litros",
        "capacidade": "5 lugares",
        "peso": "1295 kg"
      },
      "sugestoes_correcao": ["Versão padronizada", "Combustível corrigido para Flex", "Transmissão padronizada", "Especificações técnicas adicionadas"]
    };

    return res.json({
      content: JSON.stringify(mockResponse, null, 2)
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OpenAI Server em http://0.0.0.0:${PORT}`);
});