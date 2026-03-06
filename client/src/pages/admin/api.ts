// Admin API client — AutoConf via server proxy + OpenAI direct

// Admin credentials (client-side)
const ADMIN_USER = "admin";
const ADMIN_PASS = "atria2024";

// Uses /api/autoconf/* proxy routes:
// - Dev: Express server proxy (server/routes.ts)
// - Prod: Firebase Hosting rewrites to Cloud Function (firebase.json)
async function proxyPost(path: string, body: Record<string, unknown>) {
  const url = `/api/autoconf/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Proxy error ${res.status}: ${text}`);
  }
  return res.json();
}

export function adminLogin(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

// ── AutoConf types ───────────────────────────────────────────────────────────

export interface AutoConfVeiculo {
  id: number;
  marca: string;
  modelo: string;
  versao: string;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  preco: number;
  cor: string;
  cambio: string;
  combustivel: string;
  tipo: string;
  placa_final: string;
  foto_principal: string;
  destaque: boolean;
  status: string;
  fotos?: string[];
  acessorios?: string[];
  observacao?: string;
  portas?: number;
  final_placa?: string;
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

// ── AutoConf API calls (via proxy) ──────────────────────────────────────────

export async function fetchAutoConfVeiculos(params?: {
  pagina?: number;
  registros_por_pagina?: number;
}): Promise<AutoConfResponse> {
  return proxyPost("veiculos", params || {});
}

export async function fetchAutoConfVeiculo(id: number): Promise<{
  sucesso: boolean;
  dados: AutoConfVeiculo;
}> {
  return proxyPost("veiculo", { id });
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
