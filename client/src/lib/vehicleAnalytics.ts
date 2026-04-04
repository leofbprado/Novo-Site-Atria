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
  | "lead";

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
};

// ─── Track Event ─────────────────────────────────────────────────────────────

export async function trackVehicleEvent(
  slug: string,
  event: AnalyticsEvent,
  dataPub?: Timestamp | null,
): Promise<void> {
  if (!db) return;
  const field = EVENT_FIELD[event];
  const today = new Date().toISOString().slice(0, 10);

  // Aggregate counter (creates doc if missing)
  await setDoc(
    doc(db, COLLECTION, slug),
    {
      slug,
      [field]: increment(1),
      ...(dataPub ? { data_publicacao: dataPub } : {}),
      lastEvent: serverTimestamp(),
    },
    { merge: true },
  );

  // Daily counter
  await setDoc(
    doc(db, COLLECTION, slug, "historico_diario", today),
    { [field]: increment(1) },
    { merge: true },
  );
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
