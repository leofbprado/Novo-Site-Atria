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
  ano: number;
  preco: number;
  slug: string;
}

export async function generateBlogPost(
  openaiKey: string,
  params: {
    categoria: string;
    tema: string;
    veiculos: BlogVehicleInfo[];
    keywords: string[];
  }
): Promise<{
  titulo: string;
  conteudo: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
}> {
  const veiculosList = params.veiculos
    .map((v) => `- ${v.marca} ${v.modelo} ${v.ano} (R$${v.preco.toLocaleString("pt-BR")}) [link: /campinas-sp/${v.slug}]`)
    .join("\n");

  const prompt = `Voce e um redator SEO especializado em carros usados e seminovos. Escreva um artigo de blog para a Atria Veiculos, revenda de seminovos em Campinas-SP.

TEMA: ${params.tema}
CATEGORIA: ${params.categoria}
KEYWORDS PARA INCLUIR NATURALMENTE: ${params.keywords.join(", ")}

VEICULOS DISPONIVEIS NO ESTOQUE (mencione-os no artigo com links):
${veiculosList}

REGRAS CRITICAS:
- NUNCA fale mal de nenhum veiculo, marca ou modelo
- NUNCA posicione um como "melhor" ou "pior" — todos sao boas opcoes
- Comparativos devem destacar os PONTOS FORTES de cada um
- Tom: "cada um atende um perfil diferente" — ajude o leitor a escolher
- Exemplo bom: "O Tracker se destaca no espaco interno, enquanto o Creta brilha no acabamento"
- Exemplo ruim: "O Tracker tem acabamento inferior ao Creta"

FORMATO:
- 800-1200 palavras
- Use subtitulos com ## (markdown)
- Inclua links pros veiculos no formato [texto](/campinas-sp/slug)
- Termine com CTA: "Visite a Atria Veiculos em Campinas ou fale com a gente pelo WhatsApp"
- Tom profissional mas acessivel, direto, sem enrolacao
- Em portugues do Brasil

RESPONDA EM JSON com esta estrutura exata:
{
  "titulo": "Titulo do artigo",
  "conteudo": "Conteudo completo em markdown",
  "meta_title": "Title tag SEO (max 60 chars)",
  "meta_description": "Meta description (max 155 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "{}";
  const parsed = JSON.parse(raw);
  return {
    titulo: parsed.titulo || params.tema,
    conteudo: parsed.conteudo || "",
    meta_title: parsed.meta_title || "",
    meta_description: parsed.meta_description || "",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : params.keywords,
  };
}

export async function suggestBlogTopics(
  openaiKey: string,
  veiculos: Array<{ marca: string; modelo: string; tipo: string; preco: number }>
): Promise<Array<{ tema: string; categoria: string; keywords: string[] }>> {
  const summary = veiculos
    .reduce((acc, v) => {
      const key = `${v.marca} ${v.modelo}`;
      if (!acc[key]) acc[key] = { count: 0, tipo: v.tipo, preco: v.preco };
      acc[key].count++;
      return acc;
    }, {} as Record<string, { count: number; tipo: string; preco: number }>);

  const topModels = Object.entries(summary)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15)
    .map(([name, info]) => `${name} (${info.tipo}, ~R$${info.preco.toLocaleString("pt-BR")})`)
    .join(", ");

  const prompt = `Voce e um estrategista de conteudo SEO para a Atria Veiculos, revenda de seminovos em Campinas-SP.

Modelos mais presentes no estoque: ${topModels}

Sugira 8 temas de artigos de blog focados em SEO local (Campinas-SP). Cada tema deve:
- Ter potencial de busca (pessoas realmente pesquisam isso)
- Mencionar modelos do estoque
- Incluir "Campinas" naturalmente

Categorias disponiveis: comparativo, guia-preco, review, financiamento, guia-perfil

RESPONDA EM JSON com array:
[{"tema": "...", "categoria": "...", "keywords": ["...", "..."]}]`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "[]";
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : parsed.temas || parsed.topics || [];
}
