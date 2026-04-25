// Helper único pra decidir como exibir o preço de um veículo.
// Centralizado pra evoluir num lugar só quando a operação AutoConf for
// corrigida (hoje preenchem valorvenda == valorpromocao; quando arrumarem,
// valorvenda passa a ser o preço cheio e valorpromocao o promocional).

export interface PrecoExibicao {
  precoFinal: number;          // o número grande do card (o que o cliente paga)
  precoCheio: number | null;   // só preenchido quando vale mostrar de/por (cheio > final)
  emPromocao: boolean;         // true se valorpromocao > 0 — usado pra tag e filtro
}

export function getPrecoExibicao(v: { preco: number; preco_promocao?: number | null }): PrecoExibicao {
  const p = Number(v.preco) || 0;
  const promo = Number(v.preco_promocao ?? 0) || 0;
  if (promo > 0) {
    if (p > promo) {
      return { precoFinal: promo, precoCheio: p, emPromocao: true };
    }
    return { precoFinal: promo, precoCheio: null, emPromocao: true };
  }
  return { precoFinal: p, precoCheio: null, emPromocao: false };
}

export function precoEfetivo(v: { preco: number; preco_promocao?: number | null }): number {
  return getPrecoExibicao(v).precoFinal;
}
