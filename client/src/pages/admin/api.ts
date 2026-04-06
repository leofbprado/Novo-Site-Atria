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

// ── Claude API helpers ──────────────────────────────────────────────────────

// Opus — writes articles (no web_search, fast)
async function callClaude(claudeKey: string, prompt: string, maxTokens = 4096): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": claudeKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-opus-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "";
}

// Sonnet + web_search — researches technical data
async function researchTechnicalData(claudeKey: string, modelos: string, tema: string): Promise<string> {
  const prompt = `Pesquise dados tecnicos reais dos seguintes modelos de carros: ${modelos}

Tema do artigo: ${tema || "carros usados em Campinas"}

Para cada modelo encontrado, busque:
- Consumo cidade e estrada (km/l, gasolina e etanol)
- Porta-malas (litros)
- Potencia (cv)
- Torque (kgfm)
- Dimensoes principais (comprimento, entre-eixos)
- Peso (kg)
- Tipo de cambio e tracao

Fontes prioritarias: CarrosNaWeb (carrosnaweb.com.br), iCarros, Quatro Rodas, Inmetro/PBE Veicular.

RESPONDA APENAS com um JSON assim, sem texto antes ou depois:
{
  "dados": [
    {
      "modelo": "Marca Modelo Versao Ano",
      "consumo_cidade_gasolina": "XX km/l",
      "consumo_estrada_gasolina": "XX km/l",
      "consumo_cidade_etanol": "XX km/l",
      "consumo_estrada_etanol": "XX km/l",
      "porta_malas": "XXX litros",
      "potencia": "XXX cv",
      "torque": "XX kgfm",
      "comprimento": "X.XXX mm",
      "entre_eixos": "X.XXX mm",
      "peso": "X.XXX kg",
      "cambio": "tipo",
      "tracao": "tipo"
    }
  ],
  "fontes": ["nome da fonte 1", "nome da fonte 2"]
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": claudeKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  const blocks = Array.isArray(data.content) ? data.content : [];
  return blocks.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
}

// ── Cover images (Unsplash, permanent URLs) ────────────────────────────────

const COVER_IMAGES: Record<string, string[]> = {
  comparativo: [
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80",
  ],
  "guia-preco": [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=1200&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&q=80",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80",
  ],
  review: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80",
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&q=80",
  ],
  financiamento: [
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
  ],
  "guia-perfil": [
    "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80",
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80",
  ],
};

function pickCover(categoria: string): string {
  const images = COVER_IMAGES[categoria] || COVER_IMAGES["guia-perfil"];
  return images[Math.floor(Math.random() * images.length)];
}

// ── Blog generation ─────────────────────────────────────────────────────────

export async function generateBlogPost(
  claudeKey: string,
  params: {
    categoria: string;
    tema: string;
    veiculos: BlogVehicleInfo[];
    keywords: string[];
    titulosExistentes: string[];
  }
): Promise<{
  titulo: string;
  capa: string;
  conteudo: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  categoria: string;
  veiculos_slugs: string[];
}> {
  const modelosNoEstoque = [...new Set(params.veiculos.map((v) => `${v.marca} ${v.modelo}`))].join(", ");

  // Step 1: Research technical data with Sonnet + web_search
  console.log("[BLOG] Step 1: Researching technical data with Sonnet...");
  let technicalData = "";
  let fontes = "";
  try {
    const researchRaw = await researchTechnicalData(claudeKey, modelosNoEstoque, params.tema);
    const firstB = researchRaw.indexOf("{");
    const lastB = researchRaw.lastIndexOf("}");
    if (firstB !== -1 && lastB > firstB) {
      const researchJson = JSON.parse(researchRaw.slice(firstB, lastB + 1));
      technicalData = JSON.stringify(researchJson.dados || [], null, 2);
      fontes = (researchJson.fontes || []).join(", ");
      console.log("[BLOG] Research OK:", (researchJson.dados || []).length, "models, fontes:", fontes);
    }
  } catch (e) {
    console.warn("[BLOG] Research failed, continuing without technical data:", e);
  }

  // Step 2: Write article with Opus (no web_search)
  console.log("[BLOG] Step 2: Writing article with Opus...");

  const prompt = `Voce e um jornalista automotivo experiente escrevendo pro blog da Atria Veiculos, revenda de seminovos em Campinas-SP (atriaveiculos.com). Seu objetivo e EDUCAR o leitor — gerar confianca e autoridade. O blog NAO e vitrine de carros.

${params.tema ? `TEMA: ${params.tema}` : "TEMA: Escolha voce o melhor tema baseado nos modelos do estoque e no que as pessoas pesquisam sobre carros usados em Campinas. Pense em duvidas reais de quem esta comprando. VARIE entre sedans, hatches, SUVs, picapes, financiamento, manutencao, etc."}
CATEGORIA: Escolha a mais adequada entre: comparativo, guia-preco, review, financiamento, guia-perfil. ALTERNE entre elas — nao repita a mesma categoria dos artigos anteriores.
${params.keywords.length ? `KEYWORDS SEO: ${params.keywords.join(", ")}` : "KEYWORDS SEO: Escolha 3-5 keywords com potencial de busca local (inclua 'Campinas' em pelo menos 2)"}
MODELOS QUE EXISTEM NO ESTOQUE (pra voce saber do que falar, NAO pra anunciar): ${modelosNoEstoque}
${params.titulosExistentes.length ? `\nARTIGOS JA PUBLICADOS (NAO repita esses temas, escreva sobre algo DIFERENTE):\n${params.titulosExistentes.map(t => `- ${t}`).join("\n")}` : ""}
${technicalData ? `\nDADOS TECNICOS PESQUISADOS (use estes dados, sao reais e verificados):\n${technicalData}\nFontes: ${fontes}` : ""}

REGRAS ABSOLUTAS:
1. O artigo e 100% CONTEUDO EDUCATIVO. NAO e catalogo, NAO e anuncio
2. NUNCA insira links pra veiculos do estoque no meio do texto
3. NUNCA liste veiculos com preco, km ou ficha tecnica — isso e trabalho da pagina de estoque
4. NUNCA insira fotos de veiculos do estoque no corpo do artigo
5. No MAXIMO, no final do artigo, uma unica frase: "Confira nosso estoque se quiser ver algum desses modelos de perto."
6. O nome da loja e "Atria Veiculos" (com acento: Átria)
7. NUNCA fale mal de nenhum veiculo, marca ou modelo
8. PROIBIDO frases genericas: "excelente opcao", "nao pode ser ignorado", "ideal para quem busca", "merece destaque"
9. Use os DADOS TECNICOS PESQUISADOS fornecidos acima. Eles ja foram verificados em fontes confiaveis
10. No final do artigo, antes do CTA, inclua: "Dados tecnicos: ${fontes || "fontes especializadas"}"
11. Se um dado tecnico NAO esta na lista pesquisada, NAO invente — omita ou diga "varia conforme a versao"

ESTRUTURA:
1. INTRODUCAO (2-3 linhas): direto ao problema/duvida do leitor. Sem "neste artigo vamos explorar"
2. CORPO com 4-6 secoes ## organizadas por TOPICO (NAO por veiculo):
   - O que avaliar, cuidados, diferencas entre versoes, quando vale a pena, pra quem serve
   - Conhecimento automotivo real: diferenca entre tracao 4x2 e 4x4, cambio CVT vs torque converter, quando diesel compensa, etc
   - Tom: consultor explicando pra um amigo. Direto, com opiniao
   - Pode citar modelos pelo nome (ex: "o Compass tem entre-eixos maior que o T-Cross") mas sem linkar nem anunciar
3. Se for comparativo: tabela markdown comparando caracteristicas GERAIS dos modelos (NAO dados do nosso estoque)
4. CONCLUSAO curta + "Confira nosso estoque se quiser ver algum desses modelos de perto. Átria Veículos, Campinas-SP. WhatsApp: (19) 99652-5211"

TAMANHO: 1000-1500 palavras
FORMATO: markdown com ## pra subtitulos
IDIOMA: portugues do Brasil

RESPONDA EXCLUSIVAMENTE com o JSON abaixo. NENHUM texto antes ou depois do JSON. Sem explicacoes, sem comentarios, sem markdown fences. Apenas o objeto JSON puro:
{
  "titulo": "Titulo chamativo com Campinas",
  "categoria": "comparativo ou guia-preco ou review ou financiamento ou guia-perfil",
  "conteudo": "Artigo completo em markdown — SEM links, SEM fotos, SEM fichas de veiculos",
  "meta_title": "Title tag SEO (max 60 chars)",
  "meta_description": "Meta description (max 155 chars)",
  "keywords": ["keyword1", "keyword2"]
}`;

  let raw: string;
  try {
    raw = await callClaude(claudeKey, prompt, 8000);
  } catch (e) {
    console.error("[BLOG] callClaude failed:", e);
    throw new Error("Erro na chamada Claude API: " + (e as Error).message);
  }

  console.log("[BLOG] Raw response length:", raw.length, "First 200:", raw.slice(0, 200));

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Claude nao retornou JSON valido. Response (" + raw.length + " chars): " + raw.slice(0, 500));
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
  } catch (e) {
    console.error("[BLOG] JSON parse failed:", raw.slice(firstBrace, firstBrace + 500));
    throw new Error("JSON invalido: " + (e as Error).message);
  }

  for (const key of ["conteudo", "titulo", "meta_title", "meta_description"]) {
    if (parsed[key]) parsed[key] = parsed[key].replace(/<cite[^>]*>|<\/cite>/g, "");
  }

  console.log("[BLOG] Parse OK. Titulo:", parsed.titulo?.slice(0, 80));

  const categoria = parsed.categoria || params.categoria || "guia-perfil";

  return {
    titulo: parsed.titulo || params.tema,
    capa: pickCover(categoria),
    conteudo: parsed.conteudo || "",
    meta_title: parsed.meta_title || "",
    meta_description: parsed.meta_description || "",
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : params.keywords,
    categoria,
    veiculos_slugs: params.veiculos.map((v) => v.slug),
  };
}
