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
  titulo?: string;
  tipo?: string;
  ano: number;
  preco: number;
  km: number;
  cor: string;
  cambio: "Manual" | "Automática";
  combustivel: "Gasolina" | "Diesel" | "Flex" | "Elétrico";
  fotos: string[];
  descricao: string;
  destaque: boolean;
  slug: string;
  createdAt: Date;
}

// Returned when Firebase is not configured
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "1",
    marca: "BMW",
    modelo: "X5",
    tipo: "SUV",
    ano: 2023,
    preco: 350000,
    km: 5000,
    cor: "Preto",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: ["https://images.unsplash.com/photo-1553882900-d5160ca3fc10?w=800&q=80"],
    descricao: "BMW X5 2023 impecável, revisões em dia, único dono",
    destaque: true,
    slug: "bmw-x5-2023",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    marca: "Mercedes-Benz",
    modelo: "C300",
    tipo: "Sedan",
    ano: 2022,
    preco: 250000,
    km: 15000,
    cor: "Prata",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"],
    descricao: "Mercedes-Benz C300 2022, interior de luxo, pacote AMG",
    destaque: true,
    slug: "mercedes-c300-2022",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    marca: "Audi",
    modelo: "A4",
    tipo: "Sedan",
    ano: 2023,
    preco: 280000,
    km: 8000,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"],
    descricao: "Audi A4 2023 com tecnologia de ponta, teto panorâmico",
    destaque: true,
    slug: "audi-a4-2023",
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "4",
    marca: "Toyota",
    modelo: "Hilux",
    tipo: "Pickup",
    ano: 2022,
    preco: 220000,
    km: 28000,
    cor: "Branco",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: ["https://images.unsplash.com/photo-1571987502951-3b67e1780c41?w=800&q=80"],
    descricao: "Toyota Hilux SRX 2022, diesel, 4x4, cabine dupla",
    destaque: true,
    slug: "toyota-hilux-2022",
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "5",
    marca: "Jeep",
    modelo: "Compass",
    tipo: "SUV",
    ano: 2023,
    preco: 185000,
    km: 12000,
    cor: "Azul",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"],
    descricao: "Jeep Compass Limited 2023, teto solar, couro bege",
    destaque: true,
    slug: "jeep-compass-2023",
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "6",
    marca: "Honda",
    modelo: "Civic",
    tipo: "Sedan",
    ano: 2022,
    preco: 145000,
    km: 22000,
    cor: "Vermelho",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: ["https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80"],
    descricao: "Honda Civic Touring 2022, multimídia, sensores e câmera",
    destaque: false,
    slug: "honda-civic-2022",
    createdAt: new Date("2023-12-28"),
  },
  {
    id: "7",
    marca: "Volkswagen",
    modelo: "Golf GTI",
    tipo: "Hatch",
    ano: 2022,
    preco: 210000,
    km: 18000,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: ["https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80"],
    descricao: "Volkswagen Golf GTI 2022, esportivo, 245cv, impecável",
    destaque: false,
    slug: "vw-golf-gti-2022",
    createdAt: new Date("2023-12-20"),
  },
  {
    id: "8",
    marca: "Toyota",
    modelo: "Corolla",
    tipo: "Sedan",
    ano: 2023,
    preco: 165000,
    km: 9000,
    cor: "Prata",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80"],
    descricao: "Toyota Corolla XEi 2023, Toyota Safety Sense, LED",
    destaque: false,
    slug: "toyota-corolla-2023",
    createdAt: new Date("2023-12-15"),
  },
  {
    id: "9",
    marca: "Ford",
    modelo: "Ranger",
    tipo: "Pickup",
    ano: 2022,
    preco: 195000,
    km: 35000,
    cor: "Preto",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
    descricao: "Ford Ranger Limited 2022, diesel, 4x4, acessórios de fábrica",
    destaque: false,
    slug: "ford-ranger-2022",
    createdAt: new Date("2023-12-10"),
  },
];

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

  const constraints: QueryConstraint[] = [];
  if (filters?.marca) constraints.push(where("marca", "==", filters.marca));
  if (filters?.modelo) constraints.push(where("modelo", "==", filters.modelo));
  if (filters?.anoMin) constraints.push(where("ano", ">=", filters.anoMin));
  if (filters?.anoMax) constraints.push(where("ano", "<=", filters.anoMax));
  if (filters?.precoMin) constraints.push(where("preco", ">=", filters.precoMin));
  if (filters?.precoMax) constraints.push(where("preco", "<=", filters.precoMax));
  constraints.push(orderBy("createdAt", "desc"));

  const snap = await getDocs(query(collection(db, "vehicles"), ...constraints));
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Vehicle, "id">) }));
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!db) return MOCK_VEHICLES.find((v) => v.slug === slug) ?? null;

  const snap = await getDocs(
    query(collection(db, "vehicles"), where("slug", "==", slug))
  );
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<Vehicle, "id">) };
}

export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  if (!db) return MOCK_VEHICLES.filter((v) => v.destaque);

  const snap = await getDocs(
    query(
      collection(db, "vehicles"),
      where("destaque", "==", true),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Vehicle, "id">) }));
}
