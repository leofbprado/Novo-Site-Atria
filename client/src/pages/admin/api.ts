// Admin API client — calls server-side proxies (no credentials in browser)

// ── AutoConf types ───────────────────────────────────────────────────────────

export interface AutoConfVeiculo {
  id: number;
  // Real AutoConf API field names
  marca_nome: string;
  modelopai_nome: string;
  modelo_nome: string;
  anofabricacao: string;  // "2019" — string, not number
  anomodelo: string;      // "2019" — string, not number
  km: number;
  valorvenda: string;     // "50990.00" — string, not number
  cor_nome: string;
  cambio_nome: string;
  combustivel_nome: string;
  carroceria_nome: string;
  tipo_nome: string;
  placa: string;
  foto: string;
  portas: number;
  fotos?: Array<{ url: string; photo_url?: string | null }>;
  acessorios?: Array<{ nome: string; id: number; categoria: string }>;
  acessorios_destaque?: Array<{ nome: string; id: number; categoria: string }>;
  descricao?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface AutoConfResponse {
  sucesso: boolean;
  dados: AutoConfVeiculo[];
  paginacao?: {
    pagina_atual: number;
    total_paginas: number;
    total_registros: number;
    registros_por_pagina: number;
  };
}

// ── AutoConf API calls (via server proxy) ────────────────────────────────────

export async function fetchAutoConfVeiculos(params?: {
  pagina?: number;
  registros_por_pagina?: number;
}): Promise<AutoConfResponse> {
  const res = await fetch("/api/autoconf/veiculos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params || {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const raw = await res.json();
  return {
    sucesso: true,
    dados: raw.veiculos || [],
    paginacao: {
      pagina_atual: raw.pagina_atual || 1,
      total_paginas: raw.ultima_pagina || 1,
      total_registros: raw.count || 0,
      registros_por_pagina: Number(raw.registros_por_pagina) || 18,
    },
  };
}

export async function fetchAutoConfVeiculo(id: number): Promise<{
  sucesso: boolean;
  dados: AutoConfVeiculo;
}> {
  const res = await fetch("/api/autoconf/veiculo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${res.status}`);
  }
  const raw = await res.json();
  return { sucesso: true, dados: raw };
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

export async function generateDescription(
  openaiKey: string,
  veiculo: {
    marca: string;
    modelo: string;
    versao: string;
    ano_fabricacao: number;
    ano_modelo: number;
    km: number;
    cor: string;
    cambio: string;
    combustivel: string;
    acessorios: string[];
  }
): Promise<string> {
  const prompt = `Voce e um especialista em vendas de veiculos seminovos premium. Gere uma descricao de venda atraente e profissional para o seguinte veiculo:

Marca: ${veiculo.marca}
Modelo: ${veiculo.modelo}
Versao: ${veiculo.versao}
Ano: ${veiculo.ano_fabricacao}/${veiculo.ano_modelo}
KM: ${veiculo.km.toLocaleString("pt-BR")} km
Cor: ${veiculo.cor}
Cambio: ${veiculo.cambio}
Combustivel: ${veiculo.combustivel}
Acessorios: ${veiculo.acessorios.join(", ")}

A descricao deve:
- Ter entre 3 e 5 frases
- Destacar os principais diferenciais do veiculo
- Usar linguagem persuasiva mas profissional
- Mencionar estado de conservacao e principais equipamentos
- NAO incluir preco
- Ser em portugues do Brasil`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// ── Blog AI ─────────────────────────────────────────────────────────────────

export interface BlogVehicleInfo {
  marca: string;
  modelo: string;
  versao: string;
  ano: number;
  km: number;
  preco: number;
  cambio: string;
  combustivel: string;
  slug: string;
  foto: string;
}

// ── Claude API helper ───────────────────────────────────────────────────────

async function callClaude(claudeKey: string, prompt: string, maxTokens = 4096): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": claudeKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "";
}

// ── Blog generation ─────────────────────────────────────────────────────────

export async function generateBlogPost(
  claudeKey: string,
  params: {
    categoria: string;
    tema: string;
    veiculos: BlogVehicleInfo[];
    keywords: string[];
  }
): Promise<{
  titulo: string;
  capa: string;
  conteudo: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  veiculos_slugs: string[];
}> {
  const veiculosList = params.veiculos
    .map((v) => `${v.marca} ${v.modelo} ${v.versao} ${v.ano} | ${v.km.toLocaleString("pt-BR")} km | ${v.cambio} | ${v.combustivel} | R$${v.preco.toLocaleString("pt-BR")} | foto: ${v.foto} | link: /campinas-sp/${v.slug}`)
    .join("\n");

  const prompt = `Voce e um jornalista automotivo experiente escrevendo pro blog da Atria Veiculos, revenda de seminovos em Campinas-SP (atriaveiculos.com). Seu objetivo: educar o leitor e gerar confianca na loja. O artigo NAO e um catalogo — e conteudo util que posiciona a Atria como autoridade.

TEMA: ${params.tema}
CATEGORIA: ${params.categoria}
KEYWORDS SEO: ${params.keywords.join(", ")}

VEICULOS DO ESTOQUE (use apenas como referencia contextual, NAO liste todos):
${veiculosList}

ESTRUTURA DO ARTIGO (80% educacao, 20% estoque):

1. INTRODUCAO (2-3 linhas): vai direto ao problema/duvida do leitor. Sem "neste artigo vamos". Ex: "Quem procura SUV usado em Campinas enfrenta um dilema: conforto vs preco. Vamos descomplicar."

2. CORPO EDUCATIVO (o conteudo principal):
   - Explique O QUE o leitor precisa saber sobre o tema (o que avaliar, cuidados, diferencas entre versoes, quando vale a pena, pra quem serve)
   - Use conhecimento automotivo real: diferenca entre tracao 4x2 e 4x4, vantagens de cambio CVT vs torque converter, quando diesel compensa, o que verificar na carroceria de uma picape usada, etc
   - Organize por TOPICOS UTEIS (ex: "O que verificar antes de comprar", "Diesel ou flex?", "Qual versao oferece melhor custo-beneficio") — NAO por veiculo
   - Tom: consultor explicando pra um amigo. Direto, com opiniao (mas sem falar mal de nenhum modelo)

3. MENCOES AO ESTOQUE (naturais, dentro do contexto):
   - Mencione 2-4 veiculos do estoque como EXEMPLOS dentro do texto educativo
   - Formato: "Aqui na Atria, temos uma [Toro Ranch 4x4 diesel 2021 com 101 mil km por R$125.890](/campinas-sp/slug) — um bom exemplo de versao pra quem roda em estrada de terra."
   - Inclua a foto quando mencionar: ![Fiat Toro Ranch 2021](url_foto)
   - NAO faca uma secao separada por veiculo — mencione dentro do fluxo do texto

4. SE FOR COMPARATIVO: inclua tabela markdown comparando os modelos (preco, km, ano, ponto forte de cada)

5. CTA FINAL: "Quer ver essas opcoes de perto? Visite a Atria Veiculos em Campinas ou fale com a gente pelo WhatsApp: (19) 99652-5211"

REGRAS:
- Use APENAS dados fornecidos na lista de veiculos. NUNCA invente consumo, FIPE, custo de manutencao ou especificacoes
- NUNCA fale mal de nenhum veiculo — todos sao boas opcoes pra perfis diferentes
- PROIBIDO frases genericas: "excelente opcao", "nao pode ser ignorado", "ideal para quem busca", "e uma otima escolha", "merece destaque"
- Se o estoque NAO tem um modelo mencionado no tema, NAO invente dados — foque nos que tem
- Tamanho: 1000-1500 palavras
- Formato: markdown com ## pra subtitulos
- Links: path relativo /campinas-sp/slug (sem dominio)
- Em portugues do Brasil

RESPONDA EM JSON:
{
  "titulo": "Titulo do artigo (chamativo, com Campinas)",
  "capa": "URL da foto do veiculo mais relevante do artigo (escolha da lista acima)",
  "conteudo": "Artigo completo em markdown",
  "meta_title": "Title tag SEO (max 60 chars)",
  "meta_description": "Meta description (max 155 chars, com dado real)",
  "keywords": ["keyword1", "keyword2"]
}`;

  const raw = await callClaude(claudeKey, prompt);
  const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(jsonStr);
  return {
    titulo: parsed.titulo || params.tema,
    capa: parsed.capa || params.veiculos[0]?.foto || "",
    conteudo: parsed.conteudo || "",
    meta_title: parsed.meta_title || "",
    meta_description: parsed.meta_description || "",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : params.keywords,
    veiculos_slugs: params.veiculos.map((v) => v.slug),
  };
}
