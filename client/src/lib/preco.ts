// Helper único pra decidir como exibir o preço de um veículo.
// Regra da Oferta: só vira oferta se OS DOIS campos estão preenchidos
// (preco e preco_promocao) E preco_promocao < preco. Qualquer outro caso
// (só promo, só preço, promo >= preço) NÃO é oferta — exibe o número
// disponível sem badge nem de/por.

export interface PrecoExibicao {
  precoFinal: number;          // o número grande do card (o que o cliente paga)
  precoCheio: number | null;   // só preenchido quando vale mostrar de/por (cheio > final)
  emPromocao: boolean;         // true só se preco e preco_promocao preenchidos e promo < preco
}

export function getPrecoExibicao(v: { preco: number; preco_promocao?: number | null }): PrecoExibicao {
  const p = Number(v.preco) || 0;
  const promo = Number(v.preco_promocao ?? 0) || 0;
  if (p > 0 && promo > 0 && promo < p) {
    return { precoFinal: promo, precoCheio: p, emPromocao: true };
  }
  return { precoFinal: promo > 0 ? promo : p, precoCheio: null, emPromocao: false };
}

export function precoEfetivo(v: { preco: number; preco_promocao?: number | null }): number {
  return getPrecoExibicao(v).precoFinal;
}
