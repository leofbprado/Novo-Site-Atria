// Helper único pra decidir como exibir o preço de um veículo.
// Regra da Oferta: só vira oferta se OS DOIS campos de preço estão preenchidos
// (preco e preco_promocao), preco_promocao < preco E o admin não desmarcou
// `em_oferta` no painel. Qualquer outro caso NÃO é oferta — exibe o número
// disponível sem badge nem de/por.
//
// Default de `em_oferta`: undefined é tratado como true (retrocompat com
// estoque já cadastrado antes da feature). Só fica fora da oferta quando
// o admin explicitamente marca false.

export interface PrecoExibicao {
  precoFinal: number;          // o número grande do card (o que o cliente paga)
  precoCheio: number | null;   // só preenchido quando vale mostrar de/por (cheio > final)
  emPromocao: boolean;         // true só se preços formam oferta E em_oferta !== false
}

export function getPrecoExibicao(v: { preco: number; preco_promocao?: number | null; em_oferta?: boolean }): PrecoExibicao {
  const p = Number(v.preco) || 0;
  const promo = Number(v.preco_promocao ?? 0) || 0;
  const ofertaOk = v.em_oferta !== false;
  if (ofertaOk && p > 0 && promo > 0 && promo < p) {
    return { precoFinal: promo, precoCheio: p, emPromocao: true };
  }
  return { precoFinal: promo > 0 ? promo : p, precoCheio: null, emPromocao: false };
}

export function precoEfetivo(v: { preco: number; preco_promocao?: number | null }): number {
  return getPrecoExibicao(v).precoFinal;
}
