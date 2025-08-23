import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an automotive expert for the Brazilian market. Always respond in Portuguese and provide accurate vehicle information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return res.status(200).json({
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}