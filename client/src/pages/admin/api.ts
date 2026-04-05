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
      model: "claude-opus-4-20250514",
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
  // Build context about what models exist (for relevance, not for listing)
  const modelosNoEstoque = [...new Set(params.veiculos.map((v) => `${v.marca} ${v.modelo}`))].join(", ");

  const prompt = `Voce e um jornalista automotivo experiente escrevendo pro blog da Atria Veiculos, revenda de seminovos em Campinas-SP (atriaveiculos.com). Seu objetivo e EDUCAR o leitor — gerar confianca e autoridade. O blog NAO e vitrine de carros.

${params.tema ? `TEMA: ${params.tema}` : "TEMA: Escolha voce o melhor tema baseado nos modelos do estoque e no que as pessoas pesquisam sobre carros usados em Campinas. Pense em duvidas reais de quem esta comprando."}
${params.categoria ? `CATEGORIA: ${params.categoria}` : "CATEGORIA: Escolha a mais adequada entre: comparativo, guia-preco, review, financiamento, guia-perfil"}
${params.keywords.length ? `KEYWORDS SEO: ${params.keywords.join(", ")}` : "KEYWORDS SEO: Escolha 3-5 keywords com potencial de busca local (inclua 'Campinas' em pelo menos 2)"}
MODELOS QUE EXISTEM NO ESTOQUE (pra voce saber do que falar, NAO pra anunciar): ${modelosNoEstoque}

REGRAS ABSOLUTAS:
1. O artigo e 100% CONTEUDO EDUCATIVO. NAO e catalogo, NAO e anuncio
2. NUNCA insira links pra veiculos do estoque no meio do texto
3. NUNCA liste veiculos com preco, km ou ficha tecnica — isso e trabalho da pagina de estoque
4. NUNCA insira fotos de veiculos do estoque no corpo do artigo
5. No MAXIMO, no final do artigo, uma unica frase: "Confira nosso estoque se quiser ver algum desses modelos de perto."
6. O nome da loja e "Atria Veiculos" (com acento: Átria)
7. NUNCA invente dados tecnicos (consumo, FIPE, custo de manutencao). Se nao sabe o numero exato, nao coloque
8. NUNCA fale mal de nenhum veiculo, marca ou modelo
9. PROIBIDO frases genericas: "excelente opcao", "nao pode ser ignorado", "ideal para quem busca", "merece destaque"

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

RESPONDA EM JSON:
{
  "titulo": "Titulo chamativo com Campinas",
  "categoria": "comparativo ou guia-preco ou review ou financiamento ou guia-perfil",
  "conteudo": "Artigo completo em markdown — SEM links, SEM fotos, SEM fichas de veiculos",
  "meta_title": "Title tag SEO (max 60 chars)",
  "meta_description": "Meta description (max 155 chars)",
  "keywords": ["keyword1", "keyword2"]
}`;

  const raw = await callClaude(claudeKey, prompt, 6000);
  const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(jsonStr);
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
