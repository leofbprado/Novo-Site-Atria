import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VeiculoAdmin {
  autoconf_id: number;
  marca: string;
  modelo: string;
  versao: string;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  preco: number;
  cor: string;
  cambio: string;
  combustivel: string;
  tipo: string;
  placa_final: string;
  foto_principal: string;
  fotos: string[];
  acessorios: string[];
  observacao: string;
  portas: number;
  // Admin fields
  status: "rascunho" | "publicado";
  tags: string[];
  descricao_ia: string;
  slug: string;
  data_importacao: Timestamp | null;
  data_publicacao: Timestamp | null;
}

const COLLECTION = "veiculos_admin";
const CONFIG_COLLECTION = "config";

// ── Normalization helpers (handle legacy data where fotos/acessorios are objects) ─
function normalizeFotos(fotos: unknown): string[] {
  if (!Array.isArray(fotos)) return [];
  return fotos.map((f: any) => (typeof f === "string" ? f : f?.url || "")).filter(Boolean);
}

function normalizeAcessorios(acessorios: unknown): string[] {
  if (!Array.isArray(acessorios)) return [];
  return acessorios.map((a: any) => (typeof a === "string" ? a : a?.nome || "")).filter(Boolean);
}

// ── Guard ────────────────────────────────────────────────────────────────────

function requireDb() {
  if (!db) throw new Error("Firebase nao configurado. Adicione VITE_FIREBASE_* ao .env");
  return db;
}

// ── Slug helper ──────────────────────────────────────────────────────────────

function makeSlug(v: { marca: string; modelo: string; ano_fabricacao: number; autoconf_id: number }) {
  const base = `${v.marca}-${v.modelo}-${v.ano_fabricacao}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${v.autoconf_id}`;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

function normalizeVeiculoAdmin(raw: Record<string, unknown>): VeiculoAdmin {
  return {
    ...raw,
    fotos: normalizeFotos(raw.fotos),
    acessorios: normalizeAcessorios(raw.acessorios),
    foto_principal: (raw.foto_principal as string) || normalizeFotos(raw.fotos)[0] || "",
  } as VeiculoAdmin;
}

export async function getAllAdminVeiculos(
  statusFilter?: "rascunho" | "publicado"
): Promise<VeiculoAdmin[]> {
  const firestore = requireDb();
  const constraints = [];
  if (statusFilter) constraints.push(where("status", "==", statusFilter));
  constraints.push(orderBy("data_importacao", "desc"));

  const snap = await getDocs(query(collection(firestore, COLLECTION), ...constraints));
  return snap.docs.map((d) => normalizeVeiculoAdmin(d.data()));
}

export async function getAdminVeiculo(autoconfId: number): Promise<VeiculoAdmin | null> {
  const firestore = requireDb();
  const docRef = doc(firestore, COLLECTION, String(autoconfId));
  const snap = await getDoc(docRef);
  return snap.exists() ? normalizeVeiculoAdmin(snap.data()) : null;
}

export async function upsertVeiculoFromAutoConf(
  data: Record<string, unknown>,
  fotos: unknown[],
  acessorios: unknown[]
): Promise<"created" | "updated"> {
  const firestore = requireDb();
  const id = data.id as number;
  const docRef = doc(firestore, COLLECTION, String(id));
  const existing = await getDoc(docRef);

  // Map AutoConf field names to our schema
  // AutoConf returns: fotos as [{url:"..."}], acessorios as [{nome:"..."}]
  const fotosList = normalizeFotos(fotos);
  const acessoriosList = normalizeAcessorios(acessorios);

  // AutoConf API fields:
  //   marca_nome     = "Chevrolet"
  //   modelopai_nome = "ONIX"                                    ← modelo
  //   modelo_nome    = "ONIX HATCH Joy 1.0 8V Flex 5p Mec."     ← versao completa
  //   anofabricacao  = "2019" (string!)
  //   anomodelo      = "2019" (string!)
  //   valorvenda     = "50990.00" (string!)
  //   carroceria_nome = "Hatch"  (tipo real — tipo_nome é sempre "Carros")
  //   foto           = url da foto principal
  //   fotos          = [{url: "..."}]
  //   acessorios     = [{nome: "..."}]
  const baseFields = {
    autoconf_id: id,
    marca: (data.marca_nome as string) || (data.marca as string) || "",
    modelo: (data.modelopai_nome as string) || (data.modelo as string) || "",
    versao: (data.modelo_nome as string) || (data.versao as string) || "",
    ano_fabricacao: Number(data.anofabricacao) || Number(data.ano_fabricacao) || 0,
    ano_modelo: Number(data.anomodelo) || Number(data.ano_modelo) || 0,
    km: Number(data.km) || 0,
    preco: parseFloat(String(data.valorvenda || data.preco || 0)) || 0,
    cor: (data.cor_nome as string) || (data.cor as string) || "",
    cambio: (data.cambio_nome as string) || (data.cambio as string) || "",
    combustivel: (data.combustivel_nome as string) || (data.combustivel as string) || "",
    tipo: (data.carroceria_nome as string) || (data.tipo_nome as string) || (data.tipo as string) || "",
    placa_final: (data.placa as string) || (data.final_placa as string) || (data.placa_final as string) || "",
    foto_principal: (data.foto as string) || (data.foto_principal as string) || (fotosList[0] || ""),
    fotos: fotosList.length ? fotosList : (data.foto ? [data.foto as string] : []),
    acessorios: acessoriosList,
    observacao: (data.descricao as string) || (data.observacao as string) || "",
    portas: Number(data.portas) || 0,
  };

  if (existing.exists()) {
    // Update AutoConf fields but preserve admin fields
    await updateDoc(docRef, baseFields);
    return "updated";
  } else {
    // New vehicle — create with admin defaults
    const slug = makeSlug({
      marca: baseFields.marca,
      modelo: baseFields.modelo,
      ano_fabricacao: baseFields.ano_fabricacao,
      autoconf_id: id,
    });
    await setDoc(docRef, {
      ...baseFields,
      status: "rascunho",
      tags: [],
      descricao_ia: "",
      slug,
      data_importacao: serverTimestamp(),
      data_publicacao: null,
    });
    return "created";
  }
}

export async function updateVeiculoTags(autoconfId: number, tags: string[]): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), { tags });
}

export async function updateVeiculoDescricao(autoconfId: number, descricao_ia: string): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), { descricao_ia });
}

export async function publishVeiculo(autoconfId: number): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), {
    status: "publicado",
    data_publicacao: serverTimestamp(),
  });
}

export async function unpublishVeiculo(autoconfId: number): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), {
    status: "rascunho",
    data_publicacao: null,
  });
}

// ── Config (OpenAI key etc) ──────────────────────────────────────────────────

export async function getAdminConfig(): Promise<{ openai_key: string }> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, CONFIG_COLLECTION, "admin"));
  if (snap.exists()) return snap.data() as { openai_key: string };
  return { openai_key: "" };
}

export async function saveAdminConfig(config: { openai_key: string }): Promise<void> {
  const firestore = requireDb();
  await setDoc(doc(firestore, CONFIG_COLLECTION, "admin"), config, { merge: true });
}

// ── Leads ───────────────────────────────────────────────────────────────────

export interface LeadAdmin {
  id: string;
  nome?: string;
  whatsapp: string;
  email?: string;
  source: string;
  query?: string;
  dados?: Record<string, unknown>;
  createdAt: Timestamp | null;
  status?: "novo" | "contatado" | "convertido";
}

export async function getAllLeads(): Promise<LeadAdmin[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(collection(firestore, "leads"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadAdmin));
}

export async function updateLeadStatus(
  leadId: string,
  status: "novo" | "contatado" | "convertido"
): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, "leads", leadId), { status });
}

// ── WhatsApp Clicks ─────────────────────────────────────────────────────────

export interface WhatsAppClick {
  id: string;
  veiculo?: string;
  slug?: string;
  page?: string;
  createdAt: Timestamp | null;
}

export async function getAllWhatsAppClicks(): Promise<WhatsAppClick[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(collection(firestore, "whatsapp_clicks"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WhatsAppClick));
}

export async function logWhatsAppClick(data: {
  veiculo?: string;
  slug?: string;
  page?: string;
}): Promise<void> {
  const firestore = requireDb();
  const { addDoc: firestoreAddDoc } = await import("firebase/firestore");
  await firestoreAddDoc(collection(firestore, "whatsapp_clicks"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// ── Public queries (for the website) ─────────────────────────────────────────

export async function getPublishedVeiculos(): Promise<VeiculoAdmin[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTION),
      where("status", "==", "publicado"),
      orderBy("data_importacao", "desc")
    )
  );
  return snap.docs.map((d) => normalizeVeiculoAdmin(d.data()));
}

export async function getFeaturedPublishedVeiculos(): Promise<VeiculoAdmin[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTION),
      where("status", "==", "publicado"),
      where("tags", "array-contains", "destaque"),
      orderBy("data_importacao", "desc")
    )
  );
  return snap.docs.map((d) => normalizeVeiculoAdmin(d.data()));
}

export async function getPublishedVeiculoBySlug(slug: string): Promise<VeiculoAdmin | null> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "publicado")
    )
  );
  if (snap.empty) return null;
  return normalizeVeiculoAdmin(snap.docs[0].data());
}
