import { useEffect, useState } from "react";

// --- Sanitização e formatação ---
export function sanitizeNumber(value) {
  if (value == null) return null;
  // remove tudo que não for dígito (evita "0M/1I/2N/3P" etc)
  const onlyDigits = String(value).replace(/[^\d]/g, "");
  if (!onlyDigits) return null;
  return Number(onlyDigits);
}

export function formatNumberBR(value) {
  if (value == null || value === "" || isNaN(Number(value))) return "";
  return Number(value).toLocaleString("pt-BR");
}

export function rangeLabel(min, max) {
  const hasMin = min != null && !isNaN(Number(min));
  const hasMax = max != null && !isNaN(Number(max));
  if (hasMin && hasMax) return `${formatNumberBR(min)} – ${formatNumberBR(max)}`;
  if (hasMin) return `≥ ${formatNumberBR(min)}`;
  if (hasMax) return `≤ ${formatNumberBR(max)}`;
  return null;
}

// --- Compactação de anos ---
export function compressYears(years = []) {
  const arr = Array.isArray(years) ? years : []; // evita iterar string
  const ys = [...new Set(arr.map((y) => Number(y)).filter((y) => !isNaN(y)))].sort((a, b) => a - b);
  const ranges = [];
  let start = null, prev = null;
  
  for (const y of ys) {
    if (start == null) { 
      start = y; 
      prev = y; 
      continue; 
    }
    if (y === prev + 1) { 
      prev = y; 
      continue; 
    }
    // fecha faixa anterior
    ranges.push([start, prev]);
    start = y; 
    prev = y;
  }
  
  if (start != null) ranges.push([start, prev]);
  return ranges; // array de [ini, fim], onde ini===fim significa ano isolado
}

// --- Inventário e contagem ---
export function filterInventoryBasic(inventory = [], filters = {}) {
  const safe = (v) => (v == null || v === "" ? null : Number(v));
  const {
    priceMin, priceMax, kmMin, kmMax, yearMin, yearMax,
    years = [], brands = [], types = [], fuels = [], transmissions = []
  } = filters;
  
  const minP = safe(sanitizeNumber(priceMin)), maxP = safe(sanitizeNumber(priceMax));
  const minKm = safe(sanitizeNumber(kmMin)), maxKm = safe(sanitizeNumber(kmMax));
  const minY = safe(yearMin), maxY = safe(yearMax);
  const yearSet = new Set((Array.isArray(years) ? years : []).map(Number).filter((y) => !isNaN(y)));
  
  return (Array.isArray(inventory) ? inventory : []).filter((car) => {
    // Mapear campos corretos do veículo
    const carPrice = car.preco || car.price || 0;
    const carKm = car.km || 0;
    const carYear = car.ano || car.year || 0;
    const carBrand = car.marca || car.brand || '';
    const carType = car.categoria || car.type || '';
    const carFuel = car.combustivel || car.fuel || '';
    const carTransmission = car.cambio || car.transmission || '';
    
    if (minP != null && carPrice < minP) return false;
    if (maxP != null && carPrice > maxP) return false;
    if (minKm != null && carKm < minKm) return false;
    if (maxKm != null && carKm > maxKm) return false;
    
    // ano por faixa OU lista solta
    if (yearSet.size > 0) {
      if (!yearSet.has(carYear)) return false;
    } else {
      if (minY != null && carYear < minY) return false;
      if (maxY != null && carYear > maxY) return false;
    }
    
    if (Array.isArray(brands) && brands.length && !brands.includes(carBrand)) return false;
    if (Array.isArray(types) && types.length && !types.includes(carType)) return false;
    if (Array.isArray(fuels) && fuels.length && !fuels.includes(carFuel)) return false;
    if (Array.isArray(transmissions) && transmissions.length && !transmissions.includes(carTransmission)) return false;
    
    return true;
  });
}

export function computeCount({ filters, inventory, computeResultCount }) {
  if (typeof computeResultCount === "function") {
    try { 
      return Number(computeResultCount(filters)) || 0; 
    } catch { 
      /* ignore */ 
    }
  }
  if (Array.isArray(inventory)) {
    return filterInventoryBasic(inventory, filters).length;
  }
  return 0;
}

// --- Chips ativos ---
// Regra: preço e km geram APENAS 1 chip por intervalo (ou min, ou max). Anos podem ter múltiplos chips compactados.
export function buildActiveChips(filters = {}, clearFns = {}, options = {}) {
  const chips = [];
  const {
    priceMin, priceMax, kmMin, kmMax,
    yearMin, yearMax, years = [],
    brands = [], types = [], fuels = [], transmissions = []
  } = filters;
  
  const maxVisible = options.maxVisible ?? 6; // limite de exibição antes de "+N"
  
  // PREÇO — único chip
  const pmin = sanitizeNumber(priceMin);
  const pmax = sanitizeNumber(priceMax);
  const price = rangeLabel(pmin, pmax);
  if (price) {
    chips.push({ key: "price", label: `Preço: ${price}`, onClear: clearFns?.price });
  }
  
  // KM — único chip
  const kmin = sanitizeNumber(kmMin);
  const kmax = sanitizeNumber(kmMax);
  const km = rangeLabel(kmin, kmax);
  if (km) {
    chips.push({ key: "km", label: `KM: ${km}`, onClear: clearFns?.km });
  }
  
  // ANO — pode vir por faixa OU lista solta (compactada)
  const yrChips = [];
  const yearRange = rangeLabel(yearMin, yearMax);
  
  if (yearRange) {
    yrChips.push({ key: "year:range", label: `Ano: ${yearRange}`, onClear: clearFns?.yearRange });
  } else if (Array.isArray(years) && years.length) {
    const ranges = compressYears(years);
    for (const [a, b] of ranges) {
      if (a === b) {
        yrChips.push({ 
          key: `year:${a}`, 
          label: `Ano: ${a}`, 
          onClear: () => clearFns?.yearSingle?.(a) 
        });
      } else {
        yrChips.push({ 
          key: `year:${a}-${b}`, 
          label: `Ano: ${a}–${b}`, 
          onClear: () => clearFns?.yearSeq?.(a, b) 
        });
      }
    }
  }
  
  // Limitar quantidade visível e "+N"
  if (yrChips.length) {
    const visible = yrChips.slice(0, Math.max(0, maxVisible - chips.length));
    const hidden = yrChips.length - visible.length;
    chips.push(...visible);
    if (hidden > 0) {
      chips.push({ key: "years:more", label: `+${hidden}`, onClear: clearFns?.yearsAll });
    }
  }
  
  // Demais categorias (multi) - protegendo contra strings
  (Array.isArray(brands) ? brands : []).forEach((b) => {
    chips.push({ key: `brand:${b}`, label: b, onClear: () => clearFns?.brand?.(b) });
  });
  
  (Array.isArray(types) ? types : []).forEach((t) => {
    chips.push({ key: `type:${t}`, label: t, onClear: () => clearFns?.type?.(t) });
  });
  
  (Array.isArray(fuels) ? fuels : []).forEach((f) => {
    chips.push({ key: `fuel:${f}`, label: f, onClear: () => clearFns?.fuel?.(f) });
  });
  
  (Array.isArray(transmissions) ? transmissions : []).forEach((tr) => {
    chips.push({ key: `trans:${tr}`, label: tr, onClear: () => clearFns?.trans?.(tr) });
  });
  
  return dedupeChips(chips);
}

// Garante que não haja chips duplicados por key
export function dedupeChips(list = []) {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).filter((c) => {
    if (!c || !c.key) return false;
    if (seen.has(c.key)) return false;
    seen.add(c.key);
    return true;
  });
}

// Hook para contagem ao vivo (aceita função sync ou async)
export function useLiveResultCount({ filters, inventory, computeResultCount }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        if (typeof computeResultCount === "function") {
          const v = computeResultCount(filters);
          const n = (v && typeof v.then === "function") ? await v : v; // suporta Promise
          if (!cancelled) setCount(Number(n) || 0);
        } else if (Array.isArray(inventory)) {
          const n = filterInventoryBasic(inventory, filters).length;
          if (!cancelled) setCount(n);
        } else {
          if (!cancelled) setCount(0);
        }
      } catch {
        if (!cancelled) setCount(0);
      }
    })();
    
    return () => { cancelled = true; };
  }, [JSON.stringify(filters), Array.isArray(inventory) ? inventory.length : "noinv", computeResultCount]);
  
  return count;
}