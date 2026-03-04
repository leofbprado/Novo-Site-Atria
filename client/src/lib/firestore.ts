import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// Vehicle type definition
export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
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

/**
 * Fetch vehicles with optional filters
 * @param filters - Optional filters (marca, modelo, anoMin, anoMax, precoMin, precoMax)
 * @returns Array of vehicles
 */
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
  const constraints: QueryConstraint[] = [];

  if (filters?.marca) {
    constraints.push(where("marca", "==", filters.marca));
  }

  if (filters?.modelo) {
    constraints.push(where("modelo", "==", filters.modelo));
  }

  if (filters?.anoMin) {
    constraints.push(where("ano", ">=", filters.anoMin));
  }

  if (filters?.anoMax) {
    constraints.push(where("ano", "<=", filters.anoMax));
  }

  if (filters?.precoMin) {
    constraints.push(where("preco", ">=", filters.precoMin));
  }

  if (filters?.precoMax) {
    constraints.push(where("preco", "<=", filters.precoMax));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(collection(db, "vehicles"), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Vehicle, "id">),
  }));
}

/**
 * Fetch a single vehicle by slug
 * @param slug - Vehicle slug
 * @returns Vehicle or null
 */
export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const q = query(
    collection(db, "vehicles"),
    where("slug", "==", slug)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...(doc.data() as Omit<Vehicle, "id">),
  };
}

/**
 * Fetch featured vehicles
 * @returns Array of featured vehicles
 */
export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  const q = query(
    collection(db, "vehicles"),
    where("destaque", "==", true),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Vehicle, "id">),
  }));
}
