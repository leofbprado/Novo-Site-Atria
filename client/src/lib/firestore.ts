import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import type { VeiculoAdmin } from "./adminFirestore";

// ─── Lead Capture ─────────────────────────────────────────────────────────────
export interface Lead {
  nome?: string;
  whatsapp: string;
  source: string;
  query?: string;
  dados?: Record<string, unknown>;
}

export async function saveLead(lead: Lead): Promise<void> {
  if (!db) {
    console.log("[mock] Lead salvo:", lead);
    return;
  }
  await addDoc(collection(db, "leads"), {
    ...lead,
    createdAt: serverTimestamp(),
  });
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
}

// ── Convert VeiculoAdmin → Vehicle ──────────────────────────────────────────
function adminToVehicle(v: VeiculoAdmin): Vehicle {
  return {
    id: String(v.autoconf_id),
    marca: v.marca,
    modelo: v.modelo,
    versao: v.versao,
    tipo: v.tipo,
    portas: v.portas,
    ano: v.ano_fabricacao,
    preco: v.preco,
    km: v.km,
    cor: v.cor,
    cambio: v.cambio as Vehicle["cambio"],
    combustivel: v.combustivel as Vehicle["combustivel"],
    fotos: v.fotos?.length ? v.fotos : v.foto_principal ? [v.foto_principal] : [],
    descricao: v.descricao_ia || v.observacao || "",
    opcionais: v.acessorios,
    destaque: (v.tags || []).includes("destaque"),
    slug: v.slug,
    createdAt: v.data_importacao?.toDate?.() || new Date(),
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

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!db) return MOCK_VEHICLES.find((v) => v.slug === slug) ?? null;

  try {
    const snap = await getDocs(
      query(
        collection(db, ADMIN_COLLECTION),
        where("slug", "==", slug),
        where("status", "==", "publicado")
      )
    );
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
        where("tags", "array-contains", "destaque"),
        orderBy("data_importacao", "desc")
      )
    );
    return snap.docs.map((d) => adminToVehicle(d.data() as VeiculoAdmin));
  } catch {
    return MOCK_VEHICLES.filter((v) => v.destaque);
  }
}
