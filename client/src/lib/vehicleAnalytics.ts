import {
  doc, setDoc, getDocs, collection, increment, serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  | "pageview"
  | "clique_whatsapp"
  | "clique_financiamento"
  | "clique_telefone"
  | "lead"
  | "clique_interesse_header"
  | "clique_simular_credere_header"
  | "clique_whatsapp_header"
  | "vehicle_interesse_lead"
  | "gallery_swipe"
  | "gallery_lightbox_open"
  | "clique_interesse_sticky";

export interface VehicleAnalytics {
  slug: string;
  pageviews: number;
  cliques_whatsapp: number;
  cliques_financiamento: number;
  cliques_telefone: number;
  leads: number;
  data_publicacao: Timestamp | null;
}

export interface DailyRecord {
  date: string;
  pageviews: number;
  cliques_whatsapp: number;
  cliques_financiamento: number;
  cliques_telefone: number;
  leads: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLLECTION = "veiculos_analytics";

const EVENT_FIELD: Record<AnalyticsEvent, string> = {
  pageview: "pageviews",
  clique_whatsapp: "cliques_whatsapp",
  clique_financiamento: "cliques_financiamento",
  clique_telefone: "cliques_telefone",
  lead: "leads",
  clique_interesse_header: "cliques_interesse_header",
  clique_simular_credere_header: "cliques_simular_credere_header",
  clique_whatsapp_header: "cliques_whatsapp_header",
  vehicle_interesse_lead: "leads_interesse",
  gallery_swipe: "gallery_swipes",
  gallery_lightbox_open: "gallery_lightbox_opens",
  clique_interesse_sticky: "cliques_interesse_sticky",
};

// ─── Track Event ─────────────────────────────────────────────────────────────

// Adia o trabalho pra fora do main thread no momento do clique. INP da PDP
// estava em 550ms (Clarity, abr/2026) — handlers chamavam até 2x essa função
// e o setup sync dos setDocs entrava no critical path. requestIdleCallback
// move tudo pra ociosidade do browser sem quebrar fire-and-forget existente.
function deferIdle(fn: () => void): void {
  if (typeof window === "undefined") { fn(); return; }
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined;
  if (ric) ric(fn, { timeout: 2000 });
  else setTimeout(fn, 0);
}

export async function trackVehicleEvent(
  slug: string,
  event: AnalyticsEvent,
  dataPub?: Timestamp | null,
): Promise<void> {
  if (!db) return;
  const field = EVENT_FIELD[event];
  const today = new Date().toISOString().slice(0, 10);

  deferIdle(() => {
    // Aggregate counter (creates doc if missing)
    setDoc(
      doc(db!, COLLECTION, slug),
      {
        slug,
        [field]: increment(1),
        ...(dataPub ? { data_publicacao: dataPub } : {}),
        lastEvent: serverTimestamp(),
      },
      { merge: true },
    ).catch(() => {});

    // Daily counter
    setDoc(
      doc(db!, COLLECTION, slug, "historico_diario", today),
      { [field]: increment(1) },
      { merge: true },
    ).catch(() => {});
  });
}

// ─── Read All Analytics (Admin) ──────────────────────────────────────────────

const EMPTY: VehicleAnalytics = {
  slug: "",
  pageviews: 0,
  cliques_whatsapp: 0,
  cliques_financiamento: 0,
  cliques_telefone: 0,
  leads: 0,
  data_publicacao: null,
};

export async function getAllVehicleAnalytics(): Promise<Map<string, VehicleAnalytics>> {
  const map = new Map<string, VehicleAnalytics>();
  if (!db) return map;
  const snap = await getDocs(collection(db, COLLECTION));
  snap.forEach((d) => {
    const data = d.data();
    map.set(d.id, {
      ...EMPTY,
      ...data,
      slug: d.id,
    } as VehicleAnalytics);
  });
  return map;
}

// ─── Read Daily History (single vehicle) ─────────────────────────────────────

export async function getVehicleDailyHistory(
  slug: string,
  days = 30,
): Promise<DailyRecord[]> {
  if (!db) return [];
  const snap = await getDocs(
    collection(db, COLLECTION, slug, "historico_diario"),
  );
  const records: DailyRecord[] = [];
  snap.forEach((d) => {
    records.push({
      date: d.id,
      pageviews: d.data().pageviews ?? 0,
      cliques_whatsapp: d.data().cliques_whatsapp ?? 0,
      cliques_financiamento: d.data().cliques_financiamento ?? 0,
      cliques_telefone: d.data().cliques_telefone ?? 0,
      leads: d.data().leads ?? 0,
    });
  });
  return records
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days);
}

// ─── Diagnostic Types ───────────────────────────────────────────────────────

export type TendenciaDir = "subindo" | "estavel" | "caindo";

export type DiagnosticoTexto =
  | "Demanda forte — segurar preço"
  | "Preço pode estar acima do mercado"
  | "Sem exposição — verificar fotos/título/posição"
  | "Nicho específico — manter"
  | "Sem dados";

export interface VehicleDiagnostic {
  views7d: number;
  contatos7d: number;
  conversao: number;          // contatos/views em %, 0 se views=0
  tendenciaDir: TendenciaDir;
  tendenciaPct: number;       // variação % (positivo = subindo)
  diagnostico: DiagnosticoTexto;
}

// ─── Batch Daily History (all vehicles, last N days) ────────────────────────

export async function getAllVehicleDailyHistory(
  slugs: string[],
  days = 14,
): Promise<Map<string, DailyRecord[]>> {
  const map = new Map<string, DailyRecord[]>();
  if (!db || slugs.length === 0) return map;

  // Parallel fetch — one query per vehicle (Firestore subcollections
  // can't be queried across parents, so this is the only option)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const promises = slugs.map(async (slug) => {
    const snap = await getDocs(
      collection(db!, COLLECTION, slug, "historico_diario"),
    );
    const records: DailyRecord[] = [];
    snap.forEach((d) => {
      if (d.id >= cutoffStr) {
        records.push({
          date: d.id,
          pageviews: d.data().pageviews ?? 0,
          cliques_whatsapp: d.data().cliques_whatsapp ?? 0,
          cliques_financiamento: d.data().cliques_financiamento ?? 0,
          cliques_telefone: d.data().cliques_telefone ?? 0,
          leads: d.data().leads ?? 0,
        });
      }
    });
    records.sort((a, b) => b.date.localeCompare(a.date));
    map.set(slug, records);
  });

  await Promise.all(promises);
  return map;
}

// ─── Calculate Diagnostic (per vehicle) ─────────────────────────────────────

function sumPeriod(records: DailyRecord[], startDate: string, endDate: string) {
  let views = 0, contatos = 0;
  for (const r of records) {
    if (r.date >= startDate && r.date <= endDate) {
      views += r.pageviews;
      contatos += r.cliques_whatsapp + r.cliques_telefone + r.leads;
    }
  }
  return { views, contatos };
}

export function calcDiagnostic(
  records: DailyRecord[],
  medianaViews: number,
  medianaContatos: number,
): VehicleDiagnostic {
  if (!records.length) {
    return {
      views7d: 0, contatos7d: 0, conversao: 0,
      tendenciaDir: "estavel", tendenciaPct: 0,
      diagnostico: "Sem dados",
    };
  }

  const today = new Date();
  const d7ago = new Date(today);
  d7ago.setDate(d7ago.getDate() - 7);
  const d14ago = new Date(today);
  d14ago.setDate(d14ago.getDate() - 14);

  const todayStr = today.toISOString().slice(0, 10);
  const d7agoStr = d7ago.toISOString().slice(0, 10);
  const d14agoStr = d14ago.toISOString().slice(0, 10);

  // Últimos 7 dias
  const curr = sumPeriod(records, d7agoStr, todayStr);
  // 7 dias anteriores
  const prev = sumPeriod(records, d14agoStr, d7agoStr);

  const views7d = curr.views;
  const contatos7d = curr.contatos;
  const conversao = views7d > 0 ? (contatos7d / views7d) * 100 : 0;

  // Tendência: comparar atividade total (views + contatos) entre os dois períodos
  const currTotal = curr.views + curr.contatos;
  const prevTotal = prev.views + prev.contatos;
  let tendenciaPct = 0;
  if (prevTotal > 0) {
    tendenciaPct = ((currTotal - prevTotal) / prevTotal) * 100;
  } else if (currTotal > 0) {
    tendenciaPct = 100;
  }
  const tendenciaDir: TendenciaDir =
    tendenciaPct > 10 ? "subindo" :
    tendenciaPct < -10 ? "caindo" :
    "estavel";

  // Diagnóstico: views e contatos altos/baixos relativos à mediana da frota
  const viewsAlta = views7d >= medianaViews && medianaViews > 0;
  const contatosAlto = contatos7d >= medianaContatos && medianaContatos > 0;

  let diagnostico: DiagnosticoTexto;
  if (medianaViews === 0 && medianaContatos === 0) {
    diagnostico = "Sem dados";
  } else if (viewsAlta && contatosAlto) {
    diagnostico = "Demanda forte — segurar preço";
  } else if (viewsAlta && !contatosAlto) {
    diagnostico = "Preço pode estar acima do mercado";
  } else if (!viewsAlta && contatosAlto) {
    diagnostico = "Nicho específico — manter";
  } else {
    diagnostico = "Sem exposição — verificar fotos/título/posição";
  }

  return { views7d, contatos7d, conversao, tendenciaDir, tendenciaPct, diagnostico };
}

// ─── Mediana helper ─────────────────────────────────────────────────────────

export function calcMediana(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
