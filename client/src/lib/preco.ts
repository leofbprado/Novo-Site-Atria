// Helper único pra decidir como exibir o preço de um veículo.
// Regra da Oferta: só vira oferta se OS DOIS campos de preço estão preenchidos
// (preco e preco_promocao), preco_promocao < preco E o admin não desmarcou
// `em_oferta` no painel. Qualquer outro caso NÃO é oferta — exibe o número
// disponível sem badge nem de/por.
//
// Default de `em_oferta`: opt-in. Só vira oferta quando o admin
// explicitamente liga o toggle (em_oferta === true). undefined ou false
// = sem badge.

export interface PrecoExibicao {
  precoFinal: number;          // o número grande do card (o que o cliente paga)
  precoCheio: number | null;   // só preenchido quando vale mostrar de/por (cheio > final)
  emPromocao: boolean;         // true só se preços formam oferta E em_oferta !== false
}

export function getPrecoExibicao(v: { preco: number; preco_promocao?: number | null; em_oferta?: boolean }): PrecoExibicao {
  const p = Number(v.preco) || 0;
  const promo = Number(v.preco_promocao ?? 0) || 0;
  const ofertaOk = v.em_oferta === true;
  if (ofertaOk && p > 0 && promo > 0 && promo < p) {
    return { precoFinal: promo, precoCheio: p, emPromocao: true };
  }
  return { precoFinal: promo > 0 ? promo : p, precoCheio: null, emPromocao: false };
}

export function precoEfetivo(v: { preco: number; preco_promocao?: number | null }): number {
  return getPrecoExibicao(v).precoFinal;
}

// ── Simulação de parcela → faixa de preço ──────────────────────────────────
// Mesma fórmula usada nos simuladores da Home e do Financiamento. PV (preço)
// = entrada + parcela / coef, onde coef ≈ 0.035 é uma média de prestação
// fixa pra 48 meses no perfil que a Átria opera. Faixa ±FAIXA_DELTA dá
// folga pra mostrar carros próximos ao alvo.
export const SIM_PRAZO = 48;
export const SIM_COEF_PARCELA = 0.035;
export const SIM_FAIXA_DELTA = 7500;

export function calcularFaixaParcela(entrada: number, parcela: number): {
  valorBase: number; precoMin: number; precoMax: number;
} {
  const valorBase = Math.round((entrada + parcela / SIM_COEF_PARCELA) / 1000) * 1000;
  const precoMin = Math.max(0, valorBase - SIM_FAIXA_DELTA);
  const precoMax = valorBase + SIM_FAIXA_DELTA;
  return { valorBase, precoMin, precoMax };
}

// Inverso da fórmula acima — pra inicializar a aba Parcela do filtro de
// preço a partir do precoFinal já selecionado, mantendo entrada padrão.
export function parcelaParaPreco(preco: number, entrada: number): number {
  const aFinanciar = Math.max(0, preco - entrada);
  return Math.max(500, Math.round((aFinanciar * SIM_COEF_PARCELA) / 50) * 50);
}
