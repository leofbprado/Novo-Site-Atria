// Admin API client - proxies through Express server to AutoConf

export async function adminLogin(user: string, pass: string): Promise<boolean> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, pass }),
  });
  const data = await res.json();
  return data.ok === true;
}

export interface VeiculoResumo {
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
  [key: string]: unknown;
}

export interface VeiculosResponse {
  sucesso: boolean;
  dados: VeiculoResumo[];
  paginacao?: {
    pagina_atual: number;
    total_paginas: number;
    total_registros: number;
    registros_por_pagina: number;
  };
  [key: string]: unknown;
}

export interface VeiculoDetalhe extends VeiculoResumo {
  fotos: string[];
  acessorios: string[];
  observacao: string;
  descricao: string;
  portas: number;
  final_placa: string;
  [key: string]: unknown;
}

export async function fetchVeiculos(params: {
  pagina?: number;
  registros_por_pagina?: number;
  marca?: string;
  tipo?: string;
  preco_de?: number;
  preco_ate?: number;
  ordenacao?: string;
}): Promise<VeiculosResponse> {
  const res = await fetch("/api/admin/veiculos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function fetchVeiculosHome(): Promise<VeiculosResponse> {
  const res = await fetch("/api/admin/veiculos-home", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export async function fetchVeiculo(id: number): Promise<{ sucesso: boolean; dados: VeiculoDetalhe }> {
  const res = await fetch("/api/admin/veiculo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function getOpenAIKey(): Promise<string> {
  const res = await fetch("/api/admin/openai-key");
  const data = await res.json();
  return data.key || "";
}

export async function saveOpenAIKey(key: string): Promise<void> {
  await fetch("/api/admin/openai-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
}
