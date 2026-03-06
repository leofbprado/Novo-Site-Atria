// Admin API client - calls AutoConf API directly from the browser

const AUTOCONF_API = "https://api.autoconf.com.br";
const AUTOCONF_BEARER = "5mHbswJ9CEHh18iHhEnkl8nZdVXXq0bNPYh1t9CqyNNqhp5NxlD8s68oCghqMbagDSsUOvqyXSsNp0Q7Euv7hSYEmHahQOlwfaHNgDvjqIaGTu7aXeIWwG8Y8HNxsrvfgqOjLqAFjwJ5JhZ8ZRA6zvBBxHXSNCb5SXKICvLzvr0mWuYDycTuQKCspl1mVCvkyoXdAp1ZGP1u8sbGScrkONASHrEAjl9QXb0klFuDgk8f1kgL5oabZqubnoqaHfyL";
const AUTOCONF_TOKEN = "N0y5JfzY5nTQcNGOQ5D5G0dPXSnG2ngseaALptDS";

// Admin credentials (client-side validation)
const ADMIN_USER = "admin";
const ADMIN_PASS = "atria2024";

async function autoconfPost(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${AUTOCONF_API}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTOCONF_BEARER}`,
    },
    body: JSON.stringify({ token: AUTOCONF_TOKEN, ...body }),
  });
  return res.json();
}

export function adminLogin(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
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
  return autoconfPost("/api/v1/veiculos", params);
}

export async function fetchVeiculosHome(): Promise<VeiculosResponse> {
  return autoconfPost("/api/v1/veiculos-home", {});
}

export async function fetchVeiculo(id: number): Promise<{ sucesso: boolean; dados: VeiculoDetalhe }> {
  return autoconfPost("/api/v1/veiculo", { id });
}
