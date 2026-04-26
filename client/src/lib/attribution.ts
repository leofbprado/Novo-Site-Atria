/**
 * Captura e persiste parâmetros de atribuição (gclid + utm_*) da URL.
 *
 * Por que existe: Google Ads precisa do `gclid` no evento de conversão pra
 * stitchar clique pago → lead. Sem isso, conversões viram "cookie-based" e
 * se perdem quando o cookie do Google falha (iOS Safari ITP, adblock,
 * navegação cross-domain via WhatsApp). Antes desse módulo, ~98% das
 * conversões reais não chegavam no Ads.
 *
 * Estratégia:
 *   1. captureAttribution() roda no boot. Se a URL atual tem gclid/utm,
 *      sobrescreve o que estava salvo (last-click attribution).
 *   2. Persiste em localStorage com TTL de 90 dias (janela padrão do Ads).
 *   3. getAttribution() retorna o objeto pra ser spreadado em todo evento
 *      de tracking e em todo lead salvo no Firestore.
 *
 * Não usa cookie pra evitar fricção de banner LGPD — localStorage 1st-party
 * não conta como cookie de tracking.
 */

const STORAGE_KEY = "atria_attribution";
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 dias

const ATTRIBUTION_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

type AttributionKey = typeof ATTRIBUTION_PARAMS[number];

export interface Attribution {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  capturedAt?: number;
  landingPath?: string;
}

interface StoredAttribution extends Attribution {
  capturedAt: number;
}

function readStored(): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (!parsed.capturedAt || Date.now() - parsed.capturedAt > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(data: StoredAttribution): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota cheia ou modo privado — silencia */
  }
}

/**
 * Lê parâmetros da URL atual. Se algum parâmetro de atribuição estiver
 * presente, sobrescreve o que está em localStorage (last-click). Se não
 * houver, mantém o que já estava (preserva atribuição original do user que
 * navega entre páginas).
 *
 * Chamar uma vez no boot do app (main.tsx) — antes do React renderizar.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const fresh: Partial<Attribution> = {};
  let hasAny = false;
  for (const key of ATTRIBUTION_PARAMS) {
    const value = params.get(key);
    if (value) {
      fresh[key as AttributionKey] = value;
      hasAny = true;
    }
  }
  if (!hasAny) return;
  writeStored({
    ...fresh,
    capturedAt: Date.now(),
    landingPath: window.location.pathname,
  });
}

/**
 * Retorna o objeto de atribuição persistido, sem `capturedAt` (que é interno).
 * Pode retornar {} se o user nunca veio via campanha rastreada.
 *
 * Use spread operator pra mergir em payloads:
 *   dataLayer.push({ event: "generate_lead", ...getAttribution() })
 */
export function getAttribution(): Attribution {
  const stored = readStored();
  if (!stored) return {};
  // capturedAt é metadata interna, não vai pra payload
  const { capturedAt: _ts, ...rest } = stored;
  void _ts;
  return rest;
}

/**
 * Anexa gclid (se existir) como query param na URL alvo. Útil pra propagar
 * atribuição em links externos onde o Conversion Linker do GTM não alcança
 * (wa.me, parceiros como Credere). Não anexa se a URL já tem gclid.
 *
 * NOTE: gbraid/wbraid também são propagados quando presentes — esses são os
 * substitutos do gclid em campanhas de iOS App / Web-to-App.
 */
export function withGclid(url: string): string {
  if (typeof window === "undefined" || !url) return url;
  const attr = getAttribution();
  const id = attr.gclid || attr.gbraid || attr.wbraid;
  if (!id) return url;
  try {
    const u = new URL(url, window.location.origin);
    if (u.searchParams.has("gclid") || u.searchParams.has("gbraid") || u.searchParams.has("wbraid")) {
      return url;
    }
    if (attr.gclid) u.searchParams.set("gclid", attr.gclid);
    else if (attr.gbraid) u.searchParams.set("gbraid", attr.gbraid);
    else if (attr.wbraid) u.searchParams.set("wbraid", attr.wbraid);
    return u.toString();
  } catch {
    return url;
  }
}
