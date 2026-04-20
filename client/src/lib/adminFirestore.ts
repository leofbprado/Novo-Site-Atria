import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
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
  status: "rascunho" | "publicado" | "despublicado";
  tags: string[];
  descricao_ia: string;
  slug: string;
  old_slug: string;
  data_importacao: Timestamp | null;
  data_publicacao: Timestamp | null;
  technical_specs?: Record<string, number>;
  disclaimer?: string;
  highlights?: string[];
  bloco_final?: string;
  descricao_final?: string;
  fotos_provisorias?: boolean;
  // Sances cross-check (cruzamento de preços com a API da Sances)
  sances_preco?: number | null;
  sances_status?: "ok" | "divergente" | "nao_encontrado" | "repasse" | null;
  sances_diff?: number | null;           // preco - sances_preco (em BRL, positivo se AutoConf > Sances)
  sances_checked_at?: Timestamp | null;
  sances_dias_patio?: number | null;     // diasEstoque da Sances (dias no pátio físico)
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORIA_MAP: Record<string, string> = {
  "suv": "suv", "suv/utilitário esportivo": "suv", "suv/utilitario esportivo": "suv", "utilitário esportivo": "suv",
  "hatchback": "hatch", "hatch": "hatch",
  "sedan": "sedan", "sedã": "sedan",
  "picape": "pickup", "pickup": "pickup", "caminhonete": "pickup",
  "minivan": "minivan", "monovolume": "minivan",
  "perua": "sw", "station wagon": "sw", "sw": "sw",
  "conversível": "conversivel", "conversivel": "conversivel", "cabriolet": "conversivel",
  "coupe": "coupe", "cupê": "coupe", "cupe": "coupe",
};

function normalizeCategoria(tipo: string): string {
  return CATEGORIA_MAP[tipo.toLowerCase().trim()] || slugify(tipo);
}

function deduplicateVersao(modelo: string, versao: string): string {
  const modeloSlug = slugify(modelo);
  const versaoSlug = slugify(versao);
  if (versaoSlug.startsWith(modeloSlug + "-")) {
    return versaoSlug.slice(modeloSlug.length + 1);
  }
  if (versaoSlug.startsWith(modeloSlug)) {
    return versaoSlug.slice(modeloSlug.length);
  }
  return versaoSlug;
}

function makeSeoSlug(
  v: { marca: string; modelo: string; versao: string; tipo: string; ano_fabricacao: number; autoconf_id: number },
  existingSlugs?: Set<string>,
): string {
  const parts = [v.marca, v.modelo];
  const cleanVersao = v.versao ? deduplicateVersao(v.modelo, v.versao) : "";
  if (cleanVersao) parts.push(cleanVersao);
  if (v.tipo) parts.push(normalizeCategoria(v.tipo));
  const base = `comprar-${slugify(parts.join("-"))}-${v.ano_fabricacao}-usado-seminovo`;
  if (!existingSlugs || !existingSlugs.has(base)) return base;
  return `${base}-${String(v.autoconf_id).slice(-4)}`;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

function normalizeVeiculoAdmin(raw: Record<string, unknown>): VeiculoAdmin {
  const fotos = normalizeFotos(raw.fotos);
  return {
    ...raw,
    marca: (raw.marca as string) || "",
    modelo: (raw.modelo as string) || "",
    versao: (raw.versao as string) || "",
    ano_fabricacao: Number(raw.ano_fabricacao) || 0,
    ano_modelo: Number(raw.ano_modelo) || 0,
    km: Number(raw.km) || 0,
    preco: Number(raw.preco) || 0,
    cor: (raw.cor as string) || "",
    cambio: (raw.cambio as string) || "",
    combustivel: (raw.combustivel as string) || "",
    tipo: (raw.tipo as string) || "",
    placa_final: (raw.placa_final as string) || "",
    observacao: (raw.observacao as string) || "",
    portas: Number(raw.portas) || 0,
    status: ((raw.status as string) === "vendido" ? "despublicado" : (raw.status as string)) || "rascunho",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    descricao_ia: (raw.descricao_ia as string) || "",
    slug: (raw.slug as string) || "",
    old_slug: (raw.old_slug as string) || "",
    fotos,
    acessorios: normalizeAcessorios(raw.acessorios),
    foto_principal: (raw.foto_principal as string) || fotos[0] || "",
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
  const id = Number(data.id);
  if (!id || !Number.isFinite(id)) {
    throw new Error(`upsertVeiculoFromAutoConf: data.id inválido (${data.id}) — provavelmente veículo removido do AutoConf`);
  }
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
  // AutoConf coloca "(Hibrido)" genérico no modelo_nome, mas o modelo_slug
  // às vezes tem "-hev-" ou "-phev-" delimitado — a gente refina a versão
  // pra mostrar HEV/PHEV explícito quando o slug indicar.
  const modeloNomeRaw = (data.modelo_nome as string) || (data.versao as string) || "";
  const modeloSlug = (data.modelo_slug as string) || "";
  const tipoHibrido = /(^|-)phev(-|$)/.test(modeloSlug.toLowerCase())
    ? "PHEV"
    : /(^|-)hev(-|$)/.test(modeloSlug.toLowerCase())
      ? "HEV"
      : null;
  const versaoRefinada = tipoHibrido && /\(h[íi]brido\)/i.test(modeloNomeRaw)
    ? modeloNomeRaw.replace(/\(h[íi]brido\)/i, `(${tipoHibrido})`)
    : modeloNomeRaw;

  const baseFields = {
    autoconf_id: id,
    marca: (data.marca_nome as string) || (data.marca as string) || "",
    modelo: (data.modelopai_nome as string) || (data.modelo as string) || "",
    versao: versaoRefinada,
    ano_fabricacao: Number(data.anofabricacao) || Number(data.ano_fabricacao) || 0,
    ano_modelo: Number(data.anomodelo) || Number(data.ano_modelo) || 0,
    km: Number(data.km) || 0,
    preco: parseFloat(String(
      data.valoranuncio ||
      data.valor_anuncio ||
      data.valorweb ||
      data.valor_web ||
      data.valorpublicado ||
      data.valor_publicado ||
      data.valornegociacao ||
      data.valor_negociacao ||
      data.valorvenda ||
      data.preco ||
      0
    )) || 0,
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
    // Update AutoConf fields but preserve admin fields.
    // Se detalhe falhou e fotosList veio vazio, NÃO sobrescrever galeria existente.
    const updateFields: Record<string, unknown> = { ...baseFields };
    if (fotosList.length === 0) {
      delete updateFields.fotos;
      delete updateFields.foto_principal;
    }
    // Se a placa que já está salva é completa (sem asterisco) e a nova vem mascarada,
    // preserva a completa — caso típico: Sances já autocompletou a placa em sync anterior.
    const novaPlaca = String(baseFields.placa_final || "");
    const placaSalva = String(existing.data().placa_final || "");
    if (novaPlaca.includes("*") && placaSalva && !placaSalva.includes("*")) {
      delete updateFields.placa_final;
    }
    await updateDoc(docRef, updateFields);
    return "updated";
  } else {
    // New vehicle — create with admin defaults
    const slug = makeSeoSlug({
      marca: baseFields.marca,
      modelo: baseFields.modelo,
      versao: baseFields.versao,
      tipo: baseFields.tipo,
      ano_fabricacao: baseFields.ano_fabricacao,
      autoconf_id: id,
    });
    await setDoc(docRef, {
      ...baseFields,
      status: "rascunho",
      tags: [],
      descricao_ia: "",
      slug,
      old_slug: "",
      data_importacao: serverTimestamp(),
      data_publicacao: null,
    });
    return "created";
  }
}

/**
 * Despublica veículos que existem no Firestore como "publicado"
 * mas não vieram na lista do AutoConf (provavelmente vendidos/removidos).
 * Retorna a lista dos veículos despublicados pra permitir logging/auditoria.
 */
export async function despublishOrphanVeiculos(autoconfIds: Set<string>): Promise<VeiculoAdmin[]> {
  const firestore = requireDb();
  const snap = await getDocs(collection(firestore, COLLECTION));
  const despublicados: VeiculoAdmin[] = [];
  for (const docSnap of snap.docs) {
    if (!autoconfIds.has(docSnap.id) && docSnap.data().status === "publicado") {
      await updateDoc(docSnap.ref, {
        status: "despublicado",
        data_remocao: serverTimestamp(),
      });
      despublicados.push(normalizeVeiculoAdmin(docSnap.data()));
    }
  }
  return despublicados;
}

// ── Log de despublicações (histórico pra auditoria) ───────────────────────

export interface DespublicacaoLog {
  id: string; // doc id do Firestore
  autoconf_id: number;
  marca: string;
  modelo: string;
  versao: string;
  placa_final: string;
  preco: number;
  data_despublicacao: Timestamp | null;
  origem: "sync_batch" | "individual_resync";
}

const DESPUB_COLLECTION = "despublicacoes";

export async function logDespublicacoes(
  veiculos: VeiculoAdmin[],
  origem: "sync_batch" | "individual_resync",
): Promise<void> {
  if (!veiculos.length) return;
  const firestore = requireDb();
  await Promise.all(
    veiculos.map((v) =>
      addDoc(collection(firestore, DESPUB_COLLECTION), {
        autoconf_id: v.autoconf_id,
        marca: v.marca,
        modelo: v.modelo,
        versao: v.versao,
        placa_final: v.placa_final,
        preco: v.preco,
        data_despublicacao: serverTimestamp(),
        origem,
      }),
    ),
  );
}

export async function getUltimasDespublicacoes(max = 30): Promise<DespublicacaoLog[]> {
  const firestore = requireDb();
  const q = query(
    collection(firestore, DESPUB_COLLECTION),
    orderBy("data_despublicacao", "desc"),
    firestoreLimit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DespublicacaoLog, "id">) }));
}

export async function reativarVeiculo(logId: string, autoconfId: number): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), {
    status: "rascunho",
  });
  await deleteDoc(doc(firestore, DESPUB_COLLECTION, logId));
}

export async function updateVeiculoFotosProvisórias(autoconfId: number, fotos_provisorias: boolean): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), { fotos_provisorias });
}

export async function updateVeiculoTags(autoconfId: number, tags: string[]): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), { tags });
}

export async function updateVeiculoDescricao(autoconfId: number, descricao_ia: string): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), { descricao_ia });
}

export async function updateVeiculoTechnicalSpecs(
  autoconfId: number,
  technical_specs: Record<string, string | number>,
): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), { technical_specs });
}

export async function updateVeiculoSances(
  autoconfId: number,
  data: {
    sances_preco: number | null;
    sances_status: "ok" | "divergente" | "nao_encontrado" | "repasse";
    sances_diff: number | null;
    sances_dias_patio?: number | null; // dias no pátio físico (diasEstoque da Sances)
    placa_final?: string; // opcional: autocompletar placa completa vinda da Sances (AutoConf só retorna mascarada "A**-***1")
  },
): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, COLLECTION, String(autoconfId)), {
    ...data,
    sances_checked_at: serverTimestamp(),
  });
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

export async function getAdminConfig(): Promise<{ openai_key: string; claude_key: string }> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, CONFIG_COLLECTION, "admin"));
  if (snap.exists()) {
    const data = snap.data();
    return { openai_key: (data.openai_key as string) || "", claude_key: (data.claude_key as string) || "" };
  }
  return { openai_key: "", claude_key: "" };
}

export async function saveAdminConfig(config: Partial<{ openai_key: string; claude_key: string }>): Promise<void> {
  const firestore = requireDb();
  await setDoc(doc(firestore, CONFIG_COLLECTION, "admin"), config, { merge: true });
}

// ── Sances Pendentes (veículos na Sances sem correspondente no AutoConf) ────
// Persiste em config/sances_pendentes pra não sumir quando usuário navega.

export interface SancesPendenteStored {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  estoque: string;
}

export async function saveSancesPendentes(list: SancesPendenteStored[]): Promise<void> {
  const firestore = requireDb();
  await setDoc(doc(firestore, CONFIG_COLLECTION, "sances_pendentes"), {
    list,
    updated_at: serverTimestamp(),
  });
}

export async function getSancesPendentes(): Promise<SancesPendenteStored[]> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, CONFIG_COLLECTION, "sances_pendentes"));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.list) ? data.list : [];
}

// ── Milestone Config ────────────────────────────────────────────────────────

export interface MilestoneConfig {
  dias: number[];
}

export async function getMilestoneConfig(): Promise<MilestoneConfig> {
  const firestore = requireDb();
  const snap = await getDoc(doc(firestore, CONFIG_COLLECTION, "milestones"));
  if (snap.exists()) return snap.data() as MilestoneConfig;
  return { dias: [7, 20, 40, 60] };
}

export async function saveMilestoneConfig(config: MilestoneConfig): Promise<void> {
  const firestore = requireDb();
  await setDoc(doc(firestore, CONFIG_COLLECTION, "milestones"), config, { merge: true });
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
  hypergestor_sent_at?: Timestamp | null;
  hypergestor_error?: string;
  hypergestor_error_at?: Timestamp | null;
  hypergestor_response?: string;
}

export async function getAllLeads(): Promise<LeadAdmin[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(collection(firestore, "leads"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeadAdmin));
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
  // Try new slug first
  let snap = await getDocs(
    query(
      collection(firestore, COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "publicado")
    )
  );
  // Fallback to old_slug for backward compat
  if (snap.empty) {
    snap = await getDocs(
      query(
        collection(firestore, COLLECTION),
        where("old_slug", "==", slug),
        where("status", "==", "publicado")
      )
    );
  }
  if (snap.empty) return null;
  return normalizeVeiculoAdmin(snap.docs[0].data());
}

/**
 * Migra todos os slugs existentes para o novo formato SEO.
 * Salva o slug antigo em old_slug para backward compat.
 */
export async function migrateAllSlugs(): Promise<{ migrated: number; skipped: number }> {
  const firestore = requireDb();
  const snap = await getDocs(collection(firestore, COLLECTION));

  // First pass: compute all new slugs to detect collisions
  const vehicles = snap.docs.map((d) => ({
    ref: d.ref,
    data: d.data(),
    id: Number(d.id),
  }));

  const newSlugs = new Set<string>();
  const updates: Array<{ ref: typeof vehicles[0]["ref"]; slug: string; oldSlug: string }> = [];

  for (const v of vehicles) {
    const marca = (v.data.marca as string) || "";
    const modelo = (v.data.modelo as string) || "";
    const versao = (v.data.versao as string) || "";
    const tipo = (v.data.tipo as string) || "";
    const ano = Number(v.data.ano_fabricacao) || 0;
    const currentSlug = (v.data.slug as string) || "";

    const newSlug = makeSeoSlug({ marca, modelo, versao, tipo, ano_fabricacao: ano, autoconf_id: v.id }, newSlugs);
    newSlugs.add(newSlug);

    if (currentSlug !== newSlug) {
      updates.push({ ref: v.ref, slug: newSlug, oldSlug: currentSlug });
    }
  }

  // Second pass: write updates
  let migrated = 0;
  for (const u of updates) {
    await updateDoc(u.ref, { slug: u.slug, old_slug: u.oldSlug });
    migrated++;
  }

  return { migrated, skipped: vehicles.length - migrated };
}

// ── Blog ─────────────────────────────────────────────────────────────────────

export type BlogCategoria = "comparativo" | "guia-preco" | "review" | "financiamento" | "guia-perfil";

export interface BlogPost {
  slug: string;
  titulo: string;
  capa: string;
  conteudo: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  status: "rascunho" | "publicado";
  data_criacao: Timestamp | null;
  data_publicacao: Timestamp | null;
  veiculos_relacionados: string[];
  categoria: BlogCategoria;
}

const BLOG_COLLECTION = "blog_posts";

function normalizeBlogPost(raw: Record<string, unknown>): BlogPost {
  return {
    slug: (raw.slug as string) || "",
    titulo: (raw.titulo as string) || "",
    capa: (raw.capa as string) || "",
    conteudo: (raw.conteudo as string) || "",
    meta_title: (raw.meta_title as string) || "",
    meta_description: (raw.meta_description as string) || "",
    keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
    status: ((raw.status as string) || "rascunho") as BlogPost["status"],
    data_criacao: (raw.data_criacao as Timestamp) || null,
    data_publicacao: (raw.data_publicacao as Timestamp) || null,
    veiculos_relacionados: Array.isArray(raw.veiculos_relacionados) ? raw.veiculos_relacionados : [],
    categoria: ((raw.categoria as string) || "guia-perfil") as BlogCategoria,
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(collection(firestore, BLOG_COLLECTION), orderBy("data_criacao", "desc"))
  );
  return snap.docs.map((d) => normalizeBlogPost(d.data()));
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(
      collection(firestore, BLOG_COLLECTION),
      where("status", "==", "publicado")
    )
  );
  return snap.docs
    .map((d) => normalizeBlogPost(d.data()))
    .sort((a, b) => {
      const da = (a.data_publicacao as any)?.toMillis?.() ?? 0;
      const db = (b.data_publicacao as any)?.toMillis?.() ?? 0;
      return db - da;
    });
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const firestore = requireDb();
  const snap = await getDocs(
    query(
      collection(firestore, BLOG_COLLECTION),
      where("slug", "==", slug),
      where("status", "==", "publicado")
    )
  );
  if (snap.empty) return null;
  return normalizeBlogPost(snap.docs[0].data());
}

export async function createBlogPost(post: Omit<BlogPost, "data_criacao" | "data_publicacao" | "status">): Promise<void> {
  const firestore = requireDb();
  await setDoc(doc(firestore, BLOG_COLLECTION, post.slug), {
    ...post,
    status: "rascunho",
    data_criacao: serverTimestamp(),
    data_publicacao: null,
  });
}

export async function updateBlogPost(slug: string, fields: Partial<BlogPost>): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, BLOG_COLLECTION, slug), fields);
}

export async function publishBlogPost(slug: string): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, BLOG_COLLECTION, slug), {
    status: "publicado",
    data_publicacao: serverTimestamp(),
  });
}

export async function unpublishBlogPost(slug: string): Promise<void> {
  const firestore = requireDb();
  await updateDoc(doc(firestore, BLOG_COLLECTION, slug), {
    status: "rascunho",
    data_publicacao: null,
  });
}
