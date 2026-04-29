import { getAttribution } from "./attribution";

/**
 * Tracking helper centralizado.
 *
 * Dispara eventos pro GTM dataLayer (que distribui pra GA4, Google Ads, Meta Pixel,
 * Hotjar, etc). Usar SEMPRE essa função, nunca chamar dataLayer direto.
 *
 * Convenção de nomes (alinhada com Google Ads / GA4 / Meta):
 *   - generate_lead       — qualquer form submetido com sucesso
 *   - whatsapp_click      — clique em qualquer botão WhatsApp
 *   - phone_click         — clique em telefone
 *   - simulator_complete  — completou simulação de financiamento
 *   - view_inventory      — abriu lista do estoque
 *   - view_vehicle        — abriu página individual de veículo
 *
 * Cada evento aceita props customizadas (source, valor, marca, etc).
 *
 * IMPORTANTE: window.dataLayer é injetado pelo GTM (snippet em index.html).
 * Se GTM não carregar (adblock, navegador antigo), os pushes vão pra fila e
 * são processados quando GTM carregar.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    // Microsoft Clarity é injetado como tag dentro do GTM (não no HTML diretamente).
    // Pode não existir se o GTM ainda não carregou ou adblock bloqueou.
    clarity?: (method: string, ...args: unknown[]) => void;
  }
}

export type TrackEvent =
  | "generate_lead"
  | "whatsapp_click"
  | "phone_click"
  | "simulator_complete"
  | "view_inventory"
  | "view_vehicle"
  | "cta_click";

export interface TrackProps {
  source?: string;          // ex: "hero-search", "venda-seu-carro-form"
  vehicle_id?: string | number;
  vehicle_marca?: string;
  vehicle_modelo?: string;
  vehicle_ano?: number;
  vehicle_preco?: number;
  value?: number;            // valor monetário pra Smart Bidding (preco do carro, etc)
  currency?: string;         // default BRL
  [key: string]: unknown;
}

/**
 * Dispara um evento pro dataLayer. GTM se vira pra distribuir.
 */
export function track(event: TrackEvent, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;

  // Inicializa dataLayer se ainda não existe (caso GTM tenha falhado)
  window.dataLayer = window.dataLayer || [];

  // Atribuição (gclid/utm_*) sai PRIMEIRO pra props específicas do evento
  // poderem sobrescrever (ex: source override). Sem isso o Ads não consegue
  // costurar conversão com clique pago.
  const payload: Record<string, unknown> = {
    event,
    currency: "BRL",
    ...getAttribution(),
    ...props,
  };

  // Limpa undefined pra não poluir o relatório
  for (const k of Object.keys(payload)) {
    if (payload[k] === undefined || payload[k] === null) {
      delete payload[k];
    }
  }

  window.dataLayer.push(payload);

  // Log em dev pra debugar
  if (typeof window !== "undefined" && (window as any).location?.hostname === "localhost") {
    // eslint-disable-next-line no-console
    console.log("[track]", event, payload);
  }
}

// ─── Clarity-specific lead tracking ─────────────────────────────────────────
// GTM events (generate_lead, whatsapp_click, etc) alimentam Ads/Meta/GA4.
// Clarity precisa de eventos nomeados descritivamente pra virar SmartEvents
// distintos — senão tudo colapsa num "Enviar formulário" genérico e contamina
// conversão com busca. trackLead() dispara os dois de uma vez.

export type ClarityLeadEvent =
  | "lead_tenho_interesse_ficha"
  | "lead_tenho_interesse_aberto"
  | "lead_whatsapp_ficha"
  | "lead_whatsapp_floating"
  | "lead_whatsapp_floating_aberto"
  | "lead_simular_credere_ficha"
  | "lead_agendar_visita"
  | "lead_clickbait_home"
  | "lead_simulador_home"
  | "lead_vender_carro"
  | "lead_contato_generico"
  | "busca_realizada";

export type LeadOrigin = "ficha" | "home" | "credere" | "floating" | "header";

export interface TrackLeadProps {
  clarityEvent: ClarityLeadEvent;
  gtmEvent?: TrackEvent; // default "generate_lead"
  origem: LeadOrigin;
  modelo?: string;
  marca?: string;
  preco?: number;
  ano?: number;
  termoBusca?: string;
  source?: string;
  [key: string]: unknown;
}

function faixaDePreco(preco: number): string {
  if (preco < 40_000) return "ate_40k";
  if (preco < 70_000) return "40k_70k";
  if (preco < 100_000) return "70k_100k";
  if (preco < 150_000) return "100k_150k";
  return "acima_150k";
}

// Chamar depois da confirmação real (saveLead resolve, fetch 200).
// Pra links <a href="wa.me"> disparar no onClick (clique é commitment suficiente).
export function trackLead(props: TrackLeadProps): void {
  if (typeof window === "undefined") return;

  // GTM pipeline
  track(props.gtmEvent || "generate_lead", {
    source: props.source || `${props.origem}-${props.clarityEvent}`,
    vehicle_marca: props.marca,
    vehicle_modelo: props.modelo,
    vehicle_ano: props.ano,
    vehicle_preco: props.preco,
    value: props.preco,
    termo_busca: props.termoBusca,
  });

  // Clarity — tags agregáveis + evento nomeado
  if (!window.clarity) return;
  try {
    if (props.modelo) window.clarity("set", "modelo_interesse", props.modelo);
    if (props.marca) window.clarity("set", "marca_interesse", props.marca);
    if (props.preco) window.clarity("set", "faixa_preco", faixaDePreco(props.preco));
    window.clarity("set", "origem_lead", props.origem);
    window.clarity("event", props.clarityEvent);
  } catch (err) {
    // Nunca bloqueia UX por falha de analytics
    console.warn("[track] Clarity call falhou:", err);
  }
}

// Intent-only: dispara apenas no Clarity (funil de fricção).
// NÃO vai pro GTM/Ads/Meta porque "abriu drawer" não é conversão — Smart Bidding
// otimizaria pra intent em vez de lead real. Usar pra eventos *_aberto.
export interface TrackIntentProps {
  origem: LeadOrigin;
  modelo?: string;
  marca?: string;
  preco?: number;
}

export function trackIntent(clarityEvent: ClarityLeadEvent, props: TrackIntentProps): void {
  if (typeof window === "undefined" || !window.clarity) return;
  try {
    if (props.modelo) window.clarity("set", "modelo_interesse", props.modelo);
    if (props.marca) window.clarity("set", "marca_interesse", props.marca);
    if (props.preco) window.clarity("set", "faixa_preco", faixaDePreco(props.preco));
    window.clarity("set", "origem_lead", props.origem);
    window.clarity("event", clarityEvent);
  } catch (err) {
    console.warn("[track] Clarity intent falhou:", err);
  }
}

// ─── Clarity event genérico (não-conversão) ─────────────────────────────────
// Pra eventos de UX/diagnóstico: rage_click, swipe excessivo, dead_click etc.
// NÃO vai pro GTM/Ads (não é conversão). Diferente de trackLead que dispara
// nos dois lugares e de trackIntent que é só Clarity mas pra funil de fricção.
export function trackClarityEvent(
  name: string,
  tags?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined" || !window.clarity) return;
  try {
    if (tags) {
      for (const [k, v] of Object.entries(tags)) {
        window.clarity("set", k, String(v));
      }
    }
    window.clarity("event", name);
  } catch (err) {
    console.warn("[track] Clarity event falhou:", err);
  }
}

// ─── Clarity identify (admin/equipe vs público) ─────────────────────────────
// Sem isso, sessões do Leo/equipe contaminam todas as métricas (heatmaps,
// scroll médio, tempo ativo). Após chamar identify, no painel do Clarity dá
// pra filtrar `tipo_usuario != admin` e ver só tráfego real.
//
// O Clarity é injetado via GTM e pode demorar pra carregar — fazemos retry
// curto (até 10s). É um one-shot, não tem custo deixar em background.
export function identifyClarityUser(
  user: { uid: string; email?: string | null } | null,
): void {
  if (typeof window === "undefined") return;

  let attempts = 0;
  const apply = () => {
    if (!window.clarity) {
      if (attempts++ < 20) {
        setTimeout(apply, 500);
      }
      return;
    }
    try {
      if (user) {
        window.clarity("identify", user.uid, undefined, undefined, user.email || user.uid);
        window.clarity("set", "tipo_usuario", "admin");
      } else {
        window.clarity("set", "tipo_usuario", "publico");
      }
    } catch (err) {
      console.warn("[track] Clarity identify falhou:", err);
    }
  };

  apply();
}
