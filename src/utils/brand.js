import { BRAND_REGISTRY } from "../data/brandRegistry.js";

const CLEAN = (s) =>
  s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function normalizeBrand(input) {
  if (!input) return null;
  const cleaned = CLEAN(input);

  // 1) Slug exato
  let found = BRAND_REGISTRY.find(b => b.slug === cleaned);
  if (found) return found;

  // 2) Nome exato
  found = BRAND_REGISTRY.find(b => CLEAN(b.name) === cleaned);
  if (found) return found;

  // 3) Sinônimos exatos
  for (const b of BRAND_REGISTRY) {
    if (b.synonyms?.some(s => CLEAN(s) === cleaned)) return b;
  }

  // 4) Slug sem hífens/espaços (para "caoa chery" → "caoa-chery")
  const cleanedNoSpaces = cleaned.replace(/\s+/g, "-");
  found = BRAND_REGISTRY.find(b => b.slug === cleanedNoSpaces);
  if (found) return found;

  // 5) Busca parcial mais flexível
  found = BRAND_REGISTRY.find(b => {
    const brandCleaned = CLEAN(b.name);
    return brandCleaned.includes(cleaned) || cleaned.includes(brandCleaned);
  });
  if (found) return found;

  // 6) Tentativa com sinônimos parciais
  for (const b of BRAND_REGISTRY) {
    const match = b.synonyms?.find(s => {
      const synCleaned = CLEAN(s);
      return synCleaned.includes(cleaned) || cleaned.includes(synCleaned);
    });
    if (match) return b;
  }

  // 7) StartsWith como último recurso
  found = BRAND_REGISTRY.find(b => CLEAN(b.name).startsWith(cleaned));
  if (found) return found;

  return null;
}

export function brandLogoUrl(input) {
  const b = normalizeBrand(input);
  return b?.logo ?? null;
}

export function brandDisplayName(input) {
  const b = normalizeBrand(input);
  return b?.name ?? (input || "");
}