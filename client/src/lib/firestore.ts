import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type { VeiculoAdmin } from "./adminFirestore";
import { track } from "./track";

// ─── Lead Capture ─────────────────────────────────────────────────────────────
export interface Lead {
  nome?: string;
  whatsapp: string;
  source: string;
  query?: string;
  dados?: Record<string, unknown>;
}

export async function saveLead(lead: Lead): Promise<void> {
  // Sempre dispara o evento de tracking, mesmo se Firestore falhar.
  // Google Ads precisa ouvir o sinal pra otimizar Smart Bidding.
  try {
    track("generate_lead", {
      source: lead.source,
      ...(lead.dados || {}),
    });
  } catch { /* não bloqueia o save */ }

  if (!db) {
    console.log("[mock] Lead salvo:", lead);
    return;
  }
  const ref = await addDoc(collection(db, "leads"), {
    ...lead,
    createdAt: serverTimestamp(),
  });

  // Só despacha pro CRM se houver contato real (DDD + número, mín. 10 dígitos).
  // Leads-placeholder tipo vehicle-agendar (só pra track GA/Ads) ficam
  // só no Firestore, não poluem o CRM.
  const digits = String(lead.whatsapp || "").replace(/\D/g, "");
  if (digits.length < 10) return;

  fetch("/api/hypergestor-send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ leadId: ref.id, lead }),
  }).catch(() => { /* ignora; erro vai no doc via server */ });
}

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  versao?: string;
  titulo?: string;
  tipo?: string;
  portas?: number;
  ano: number;
  preco: number;
  km: number;
  cor: string;
  cambio: "Manual" | "Automática" | "CVT";
  combustivel: "Gasolina" | "Diesel" | "Flex" | "Elétrico" | "Híbrido";
  fotos: string[];
  descricao: string;
  opcionais?: string[];
  destaque: boolean;
  slug: string;
  createdAt: Date;
  technical_specs?: Record<string, number>;
  disclaimer?: string;
  highlights?: string[];
  bloco_final?: string;
}

// ── Convert VeiculoAdmin → Vehicle ──────────────────────────────────────────
// Handle legacy data where fotos may be [{url:"..."}] objects instead of strings
function normalizeFotos(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((f: any) => (typeof f === "string" ? f : f?.url || "")).filter(Boolean);
}
function normalizeAcessorios(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((a: any) => (typeof a === "string" ? a : a?.nome || "")).filter(Boolean);
}

// Mapa de normalização: modelo → tipo correto. Sobrescreve tipos errados vindos do autoconf.
const MODELO_TIPO_MAP: Array<{ rx: RegExp; tipo: string }> = [
  { rx: /\b(jetta|civic|corolla|virtus|voyage|cobalt|prisma|onix plus|versa|sentra|cruze sedan|fluence|logan|cronos|fastback sedan|polo sedan|ka sedan|fiesta sedan|focus sedan|hb20s|grand siena|siena|linea|passat|fusion|altima|accord|camry)\b/i, tipo: "Sedan" },
  { rx: /\b(hr-v|hrv|wr-v|wrv|compass|renegade|tracker|kicks|creta|t-cross|tcross|nivus|taos|tiguan|kuga|ecosport|duster|captur|territory|pulse|fastback|2008|3008|5008|sw4|trailblazer|outlander|asx|rav4|cr-v|crv|tucson|santa fe|xv|forester|q3|q5|q7|q8|x1|x3|x5|x6|x7|h6|h2|jolion|dargo|f7|tiggo|song plus|yuan plus|seal|atto|cherokee|grand cherokee|wrangler|bronco|edge|explorer|pajero|eclipse cross|xc40|xc60|xc90|glc|gla|glb|gle|gls|macan|cayenne|nx|rx|ux)\b/i, tipo: "SUV" },
  { rx: /\b(toro|s10|hilux|ranger|amarok|saveiro|strada|frontier|l200|montana|maverick|gladiator|f-?250|silverado|ram)\b/i, tipo: "Pickup" },
  { rx: /\b(onix|hb20|polo|gol|ka|fiesta|fox|fit|march|sandero|i30|golf|up|argo|mobi|uno|palio|celta|punto|bravo|focus|astra|corsa|c3|208|clio|swift|yaris hatch)\b/i, tipo: "Hatch" },
];

function normalizeTipo(modelo: string, tipoOriginal: string): string {
  const m = (modelo || "").toLowerCase();
  for (const { rx, tipo } of MODELO_TIPO_MAP) {
    if (rx.test(m)) return tipo;
  }
  return tipoOriginal || "";
}

// Normaliza combustivel do AutoConf pros 5 rótulos do filtro do site.
// AutoConf retorna "Gasolina e Elétrico" pra HEVs — a gente mostra "Híbrido"
// no site; distinção HEV/PHEV/motorização fica na versão (modelo_nome).
function normalizeCombustivel(raw: string | undefined | null): Vehicle["combustivel"] {
  const s = (raw || "").toLowerCase();
  if (!s) return "Flex";
  if (s.includes("elétrico") || s.includes("eletrico")) {
    return s.includes("gasolina") || s.includes("flex") || s.includes("diesel")
      ? "Híbrido"
      : "Elétrico";
  }
  if (s.includes("diesel")) return "Diesel";
  if (s.includes("flex")) return "Flex";
  if (s.includes("gasolina")) return "Gasolina";
  return "Flex";
}

function adminToVehicle(v: VeiculoAdmin): Vehicle {
  const fotos = normalizeFotos(v.fotos);
  const fotoPrincipal = v.foto_principal || fotos[0] || "";
  return {
    id: String(v.autoconf_id),
    marca: v.marca || "",
    modelo: v.modelo || "",
    versao: v.versao || "",
    tipo: normalizeTipo(v.modelo || "", v.tipo || ""),
    portas: v.portas || 0,
    ano: v.ano_fabricacao || 0,
    preco: v.preco || 0,
    km: v.km || 0,
    cor: v.cor || "",
    cambio: (v.cambio || "Manual") as Vehicle["cambio"],
    combustivel: normalizeCombustivel(v.combustivel),
    fotos: fotos.length ? fotos : fotoPrincipal ? [fotoPrincipal] : [],
    descricao: v.descricao_ia || v.observacao || "",
    opcionais: normalizeAcessorios(v.acessorios),
    destaque: (v.tags || []).includes("destaque"),
    slug: v.slug || "",
    createdAt: v.data_importacao?.toDate?.() || new Date(),
    ...(v.technical_specs ? { technical_specs: v.technical_specs } : {}),
    ...(v.disclaimer ? { disclaimer: v.disclaimer } : {}),
    ...(v.highlights?.length ? { highlights: v.highlights } : {}),
    ...(v.bloco_final ? { bloco_final: v.bloco_final } : {}),
  };
}

// Generic interior shots reused across vehicles
const INT_A = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80";
const INT_B = "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&q=80";
const INT_C = "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&q=80";

// Returned when Firebase is not configured
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "1",
    marca: "BMW",
    modelo: "X5",
    versao: "xDrive30d M Sport",
    tipo: "SUV",
    portas: 4,
    ano: 2023,
    preco: 350000,
    km: 5000,
    cor: "Preto",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: [
      "https://images.unsplash.com/photo-1553882900-d5160ca3fc10?w=800&q=80",
      INT_A, INT_B, INT_C,
    ],
    descricao: "BMW X5 xDrive30d M Sport 2023 em estado impecável. Único dono, todas as revisões realizadas na concessionária BMW. Equipado com pacote M Sport completo, bancos em couro Merino, teto solar panorâmico duplo e sistema de som Harman Kardon. Rodas de liga leve 22\" originais BMW.",
    opcionais: [
      "Teto solar panorâmico duplo", "Banco elétrico com memória", "Ar-condicionado trizone",
      "Multifuncional no volante", "Tela iDrive 12.3\"", "Apple CarPlay", "Android Auto",
      "Câmera de ré 360°", "Sensor de estacionamento dianteiro e traseiro",
      "Airbag múltiplos (8)", "ABS + EBD", "Controle de estabilidade DSC",
      "Faróis LED adaptivos", "Rodas de liga leve 22\"", "Piloto automático adaptivo",
      "Bluetooth", "Som Harman Kardon", "Head-up display", "Vidros elétricos", "Travas elétricas",
    ],
    destaque: true,
    slug: "bmw-x5-2023",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    marca: "Mercedes-Benz",
    modelo: "C300",
    versao: "4MATIC AMG Line",
    tipo: "Sedan",
    portas: 4,
    ano: 2022,
    preco: 250000,
    km: 15000,
    cor: "Prata",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Mercedes-Benz C300 4MATIC AMG Line 2022 com interior de luxo e pacote AMG completo.",
    opcionais: [
      "Ar-condicionado bizone", "Banco elétrico aquecido", "Teto solar panorâmico",
      "Tela MBUX 10.25\"", "Apple CarPlay", "Android Auto", "Câmera de ré",
    ],
    destaque: true,
    slug: "mercedes-c300-2022",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    marca: "Audi",
    modelo: "A4",
    versao: "2.0 TFSI Prestige Plus S-tronic",
    tipo: "Sedan",
    portas: 4,
    ano: 2023,
    preco: 280000,
    km: 8000,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
      INT_A, INT_B, INT_C,
    ],
    descricao: "Audi A4 2.0 TFSI Prestige Plus 2023 com teto panorâmico, Virtual Cockpit e pacote S-Line.",
    opcionais: [
      "Teto solar panorâmico", "Virtual Cockpit 12.3\"", "Tela MMI 10.1\"",
      "Apple CarPlay", "Android Auto", "Câmera de ré",
    ],
    destaque: true,
    slug: "audi-a4-2023",
    createdAt: new Date("2024-01-05"),
  },
];

// ── Public queries ──────────────────────────────────────────────────────────

const ADMIN_COLLECTION = "veiculos_admin";

export async function getVehicles(
  filters?: Partial<{
    marca?: string;
    modelo?: string;
    anoMin?: number;
    anoMax?: number;
    precoMin?: number;
    precoMax?: number;
  }>
): Promise<Vehicle[]> {
  if (!db) return MOCK_VEHICLES;

  try {
    const constraints: QueryConstraint[] = [
      where("status", "==", "publicado"),
    ];
    if (filters?.marca) constraints.push(where("marca", "==", filters.marca));
    constraints.push(orderBy("data_importacao", "desc"));

    const snap = await getDocs(query(collection(db, ADMIN_COLLECTION), ...constraints));
    const results = snap.docs.map((d) => adminToVehicle(d.data() as VeiculoAdmin));

    // Client-side filters for fields that can't be combined in Firestore
    return results.filter((v) => {
      if (filters?.modelo && v.modelo !== filters.modelo) return false;
      if (filters?.anoMin && v.ano < filters.anoMin) return false;
      if (filters?.anoMax && v.ano > filters.anoMax) return false;
      if (filters?.precoMin && v.preco < filters.precoMin) return false;
      if (filters?.precoMax && v.preco > filters.precoMax) return false;
      return true;
    });
  } catch {
    return MOCK_VEHICLES;
  }
}

export function vehiclePath(v: Vehicle): string {
  return `/campinas-sp/${v.slug}`;
}

/**
 * Lookup direto pelo autoconf_id (que é o doc.id do Firestore).
 * Usado pelo redirect Motorleads — match exato em uma única leitura.
 */
export async function getVehicleByAutoconfId(autoconfId: string | number): Promise<Vehicle | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, ADMIN_COLLECTION, String(autoconfId)));
    if (!snap.exists()) return null;
    const data = snap.data() as VeiculoAdmin;
    if (data.status !== "publicado") return null;
    return adminToVehicle(data);
  } catch {
    return null;
  }
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!db) return MOCK_VEHICLES.find((v) => v.slug === slug) ?? null;

  try {
    // Try new slug first
    let snap = await getDocs(
      query(
        collection(db, ADMIN_COLLECTION),
        where("slug", "==", slug),
        where("status", "==", "publicado")
      )
    );
    // Fallback to old_slug for backward compat
    if (snap.empty) {
      snap = await getDocs(
        query(
          collection(db, ADMIN_COLLECTION),
          where("old_slug", "==", slug),
          where("status", "==", "publicado")
        )
      );
    }
    if (snap.empty) return null;
    return adminToVehicle(snap.docs[0].data() as VeiculoAdmin);
  } catch {
    return MOCK_VEHICLES.find((v) => v.slug === slug) ?? null;
  }
}

export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  if (!db) return MOCK_VEHICLES.filter((v) => v.destaque);

  try {
    const snap = await getDocs(
      query(
        collection(db, ADMIN_COLLECTION),
        where("status", "==", "publicado"),
        where("tags", "array-contains", "destaque")
      )
    );
    const vehicles = snap.docs
      .map((d) => d.data() as VeiculoAdmin)
      .sort((a, b) => {
        const da = (a as any).data_importacao?.toMillis?.() ?? 0;
        const db_ = (b as any).data_importacao?.toMillis?.() ?? 0;
        return db_ - da;
      })
      .map((d) => adminToVehicle(d));
    if (vehicles.length === 0) return MOCK_VEHICLES.filter((v) => v.destaque);
    return vehicles;
  } catch (e) {
    console.error("[getFeaturedVehicles] erro:", e);
    return MOCK_VEHICLES.filter((v) => v.destaque);
  }
}
