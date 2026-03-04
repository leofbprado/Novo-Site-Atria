import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

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
    ano: 2023,
    preco: 350000,
    km: 5000,
    cor: "Preto",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: ["https://images.unsplash.com/photo-1553882900-d5160ca3fc10?w=600&q=80"],
    descricao: "BMW X5 2023 impecável, revisões em dia, único dono",
    destaque: true,
    slug: "bmw-x5-2023",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    marca: "Mercedes-Benz",
    modelo: "C300",
    ano: 2022,
    preco: 250000,
    km: 15000,
    cor: "Prata",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80"],
    descricao: "Mercedes-Benz C300 2022, interior de luxo, pacote AMG",
    destaque: true,
    slug: "mercedes-c300-2022",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    marca: "Audi",
    modelo: "A4",
    ano: 2023,
    preco: 280000,
    km: 8000,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80"],
    descricao: "Audi A4 2023 com tecnologia de ponta, teto panorâmico",
    destaque: true,
    slug: "audi-a4-2023",
    createdAt: new Date("2024-01-05"),
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
