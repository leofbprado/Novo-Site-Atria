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

  const payload: Record<string, unknown> = {
    event,
    currency: "BRL",
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
