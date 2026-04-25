import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Car, Users, MessageCircle, Settings, LogOut, BookOpen,
  RefreshCw, CheckCircle2, Search, Filter, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, Eye, EyeOff, Sparkles, X, Tag, Save, ExternalLink,
  Phone, Mail, Calendar, Clock, TrendingUp, AlertCircle, Menu, Plus, Trash2, Camera, Share2,
  ArrowDown, ArrowUp, ArrowUpDown, Image as ImageIcon,
} from "lucide-react";
import {
  fetchAutoConfVeiculos,
  fetchAutoConfVeiculo,
  fetchSancesVeiculos,
  testHypergestor,
  generateDescription,
  generateBlogPost,
  enrichVehicleWithSearch,
  fetchVehicleSpecs,
  type SancesVeiculo,
} from "./api";
import { useAuth } from "@/lib/auth";
import {
  getAllAdminVeiculos,
  upsertVeiculoFromAutoConf,
  despublishOrphanVeiculos,
  despublishVeiculoSingle,
  logDespublicacoes,
  getUltimasDespublicacoes,
  reativarVeiculo,
  type DespublicacaoLog,
  updateVeiculoTags,
  updateVeiculoFotosProvisórias,
  updateVeiculoDescricao,
  updateVeiculoTechnicalSpecs,
  updateVeiculoSances,
  saveSancesPendentes,
  getSancesPendentes,
  type SancesPendenteStored,
  publishVeiculo,
  getAdminConfig,
  saveAdminConfig,
  getAllLeads,
  getAllWhatsAppClicks,
  getMilestoneConfig,
  saveMilestoneConfig,
  getAllTagConfigs,
  saveTagConfigs,
  type TagConfig,
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  type VeiculoAdmin,
  type BlogPost,
  type BlogCategoria,
  type LeadAdmin,
  type WhatsAppClick,
  type MilestoneConfig,
} from "@/lib/adminFirestore";
import {
  getAllVehicleAnalytics, getAllVehicleDailyHistory, calcDiagnostic, calcMediana,
  type VehicleAnalytics, type DailyRecord, type VehicleDiagnostic,
} from "@/lib/vehicleAnalytics";
import { TagBadge, invalidateTagConfigs, tagStyle, useTagConfigs } from "@/components/TagBadge";

// ── Constants ────────────────────────────────────────────────────────────────
const LOGO_BRANCO = "https://i.postimg.cc/25m34dvJ/Logo_%C3%81tria_Branco.png";
const PRESET_TAGS = ["destaque", "oferta", "seminovo premium", "reservado"];
const TAG_COLORS: Record<string, string> = {
  destaque: "bg-amber-100 text-amber-800 border-amber-200",
  oferta: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "seminovo premium": "bg-violet-100 text-violet-800 border-violet-200",
  reservado: "bg-orange-100 text-orange-800 border-orange-200",
};
const DEFAULT_TAG_COLOR = "bg-sky-100 text-sky-800 border-sky-200";

type Page = "dashboard" | "estoque" | "leads" | "whatsapp" | "blog" | "config";

// ── Diagnostic display helpers ──────────────────────────────────────────────

const DIAG_STYLE: Record<string, { icon: string; cls: string }> = {
  "Demanda forte — segurar preço":                  { icon: "\uD83D\uDFE2", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "Preço pode estar acima do mercado":              { icon: "\uD83D\uDFE1", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  "Sem exposição — verificar fotos/título/posição": { icon: "\uD83D\uDD34", cls: "text-red-700 bg-red-50 border-red-200" },
  "Nicho específico — manter":                      { icon: "\uD83D\uDFE3", cls: "text-violet-700 bg-violet-50 border-violet-200" },
  "Sem dados":                                       { icon: "\u2796", cls: "text-slate-500 bg-slate-50 border-slate-200" },
};

const TEND_ICON: Record<string, string> = {
  subindo: "\u2197\uFE0F",
  estavel: "\u2796",
  caindo: "\u2198\uFE0F",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtKm = (v: number) => v.toLocaleString("pt-BR") + " km";
const fmtDate = (ts: { toDate?: () => Date } | null) => {
  if (!ts || !ts.toDate) return "-";
  const d = ts.toDate();
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const SITE_ORIGIN = "https://www.atriaveiculos.com";

function buildFotosProvisoriasMessage(vehicles: VeiculoAdmin[]): string {
  const pendentes = vehicles
    .filter((v) => v.fotos_provisorias)
    .sort((a, b) => {
      const ta = a.data_importacao?.toDate?.().getTime() ?? 0;
      const tb = b.data_importacao?.toDate?.().getTime() ?? 0;
      return ta - tb;
    });

  const header = `📸 Átria — Fotos pendentes (${pendentes.length} ${pendentes.length === 1 ? "carro" : "carros"})`;

  const blocos = pendentes.map((v, i) => {
    const nome = [v.marca, v.modelo, v.versao].filter(Boolean).join(" ");
    const ano = v.ano_fabricacao && v.ano_modelo ? `${v.ano_fabricacao}/${v.ano_modelo}` : "";
    const placa = v.placa_final ? ` — ${v.placa_final}` : "";
    const linha1 = `${i + 1}. ${nome}${ano ? " " + ano : ""}${placa}`;
    const detalhes = [v.cor, fmtKm(v.km), fmt(v.preco)].filter(Boolean).join(" · ");
    const link = `${SITE_ORIGIN}/campinas-sp/${v.slug}`;
    return `${linha1}\n   ${detalhes}\n   ${link}`;
  });

  return [header, "", ...blocos].join("\n");
}

// ── Login ────────────────────────────────────────────────────────────────────
function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, pass);
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("E-mail ou senha inválidos");
      } else if (code === "auth/too-many-requests") {
        setError("Muitas tentativas. Tente novamente em alguns minutos.");
      } else {
        setError("Erro ao autenticar. Verifique suas credenciais.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-white/10"
      >
        <div className="flex justify-center mb-5">
          <img src={LOGO_BRANCO} alt="Átria Veículos" className="h-12 object-contain" />
        </div>
        <h1 className="text-lg font-semibold text-white mb-0.5 text-center">Painel Administrativo</h1>
        <p className="text-slate-500 text-sm text-center mb-8">Acesso restrito</p>

        <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1.5 font-medium">E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@atriaveiculos.com.br"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition mb-4 placeholder:text-white/20" autoFocus />

        <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1.5 font-medium">Senha</label>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="********"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition mb-6 placeholder:text-white/20" />

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 rounded-lg py-2.5 px-3 border border-red-500/20">
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all text-sm">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </motion.form>
    </div>
  );
}

// ── Reusable Components ──────────────────────────────────────────────────────

function TagChip({ tag, onRemove, size = "sm" }: { tag: string; onRemove?: () => void; size?: "sm" | "xs" }) {
  const color = TAG_COLORS[tag] || DEFAULT_TAG_COLOR;
  const cls = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium border ${color} ${cls}`}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-60 ml-0.5"><X size={10} /></button>
      )}
    </span>
  );
}

function StatCard({ label, value, icon, color = "text-slate-900" }: {
  label: string; value: string | number; icon: React.ReactNode; color?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-slate-500 text-sm mt-0.5">{label}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const styles = status === "publicado"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "convertido"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : status === "contatado"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : status === "novo"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-slate-100 text-slate-600 border-slate-200";
  const label = status === "publicado" ? "Publicado" : status === "rascunho" ? "Rascunho" : status === "despublicado" ? "Despublicado" : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {label}
    </span>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return <RefreshCw size={size} className="animate-spin" />;
}

function CrmBadge({ lead }: { lead: LeadAdmin }) {
  if (lead.hypergestor_skipped) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-400 border-slate-200"
        title="Lead placeholder sem contato — não aplicável ao CRM"
      >
        —
      </span>
    );
  }
  if (lead.hypergestor_sent_at) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200"
        title={`Enviado ao Hypergestor em ${fmtDate(lead.hypergestor_sent_at)}`}
      >
        <CheckCircle2 size={10} /> Enviado
      </span>
    );
  }
  if (lead.hypergestor_error) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200"
        title={lead.hypergestor_error}
      >
        <X size={10} /> Erro
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-100 text-slate-500 border-slate-200"
      title="Aguardando envio ao Hypergestor"
    >
      <Clock size={10} /> Pendente
    </span>
  );
}

function SancesCell({ v }: { v: VeiculoAdmin }) {
  const status = v.sances_status;
  if (!status) {
    return <span className="text-slate-300 text-xs" title="Ainda não verificado. Rode Sincronizar.">?</span>;
  }
  if (status === "nao_encontrado") {
    return <span className="text-slate-300" title="Não encontrado na Sances (repasse, consignado ou fora de estoque)">—</span>;
  }
  if (status === "repasse") {
    return <span className="text-slate-400 text-xs" title={`Repasse — preço Sances R$ ${v.sances_preco ?? 0} não é retail`}>Repasse</span>;
  }
  if (status === "ok") {
    return <span className="text-slate-600 text-xs" title="Preço bate com a Sances">{fmt(v.sances_preco || 0)}</span>;
  }
  // divergente
  const diff = v.sances_diff || 0;
  const sign = diff > 0 ? "+" : "−";
  const absDiff = Math.abs(diff);
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-red-600 font-semibold text-xs">{fmt(v.sances_preco || 0)}</span>
      <span className="text-red-500 text-[10px]" title={diff > 0 ? "AutoConf está MAIOR que Sances" : "AutoConf está MENOR que Sances"}>
        {sign}{fmt(absDiff)}
      </span>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-slate-300 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md">{description}</p>
    </div>
  );
}

// ── Vehicle Detail Page (full-page, replaces modal) ─────────────────────────
const SPEC_FIELDS = [
  { key: "potenciaCv", label: "Potência (cv)", placeholder: "139" },
  { key: "torqueKgfM", label: "Torque (kgf·m)", placeholder: "19.3" },
  { key: "comprimentoMm", label: "Comprimento (mm)", placeholder: "4361" },
  { key: "larguraMm", label: "Largura (mm)", placeholder: "1800" },
  { key: "alturaMm", label: "Altura (mm)", placeholder: "1460" },
  { key: "entreEixosMm", label: "Entre-eixos (mm)", placeholder: "2620" },
  { key: "pesoKg", label: "Peso (kg)", placeholder: "1250" },
  { key: "portaMalasLitros", label: "Porta-malas (L)", placeholder: "520" },
  { key: "tanqueLitros", label: "Tanque (L)", placeholder: "50" },
  { key: "consumoCidadeKmL", label: "Consumo urbano (km/l)", placeholder: "12.5" },
  { key: "consumoEstradaKmL", label: "Consumo rodov. (km/l)", placeholder: "14.8" },
];

function VehicleDetailPage({
  vehicle, openaiKey, claudeKey, onBack, onUpdate,
}: {
  vehicle: VeiculoAdmin; openaiKey: string; claudeKey: string; onBack: () => void; onUpdate: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tags, setTags] = useState<string[]>(vehicle.tags || []);
  const [newTag, setNewTag] = useState("");
  const [descricao, setDescricao] = useState(vehicle.descricao_ia || "");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [specs, setSpecs] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(vehicle.technical_specs || {}).map(([k, v]) => [k, String(v ?? "")])
    )
  );
  const [savingSpecs, setSavingSpecs] = useState(false);
  const [fotosProvisórias, setFotosProvisórias] = useState(vehicle.fotos_provisorias ?? false);
  const tagConfigs = useTagConfigs();

  const handleAddTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      const updated = [...tags, t];
      setTags(updated);
      console.log("[TAGS] Salvando tags para", vehicle.autoconf_id, ":", updated);
      updateVeiculoTags(vehicle.autoconf_id, updated)
        .then(() => console.log("[TAGS] Salvo com sucesso"))
        .catch((err) => console.error("[TAGS] Erro ao salvar:", err));
    }
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    updateVeiculoTags(vehicle.autoconf_id, updated)
      .then(() => console.log("[TAGS] Removido com sucesso"))
      .catch((err) => console.error("[TAGS] Erro ao remover:", err));
  };

  const [searchingSpecs, setSearchingSpecs] = useState(false);
  const [doingAll, setDoingAll] = useState(false);

  const acessoriosNomes = (vehicle.acessorios || []).map((a: any) => typeof a === "string" ? a : a?.nome || "").filter(Boolean);

  const handleGenerateAI = async () => {
    if (!openaiKey) { setAiError("Configure a chave OpenAI nas configuracoes primeiro"); return; }
    setGenerating(true); setAiError("");
    try {
      const text = await generateDescription(openaiKey, {
        marca: vehicle.marca, modelo: vehicle.modelo, versao: vehicle.versao,
        ano_fabricacao: vehicle.ano_fabricacao, ano_modelo: vehicle.ano_modelo,
        km: vehicle.km, cor: vehicle.cor, cambio: vehicle.cambio,
        combustivel: vehicle.combustivel, acessorios: acessoriosNomes,
      });
      setDescricao(text);
      await updateVeiculoDescricao(vehicle.autoconf_id, text);
    } catch (err: any) { setAiError(err.message || "Erro ao gerar descricao"); }
    setGenerating(false);
  };

  const handleSearchSpecs = async () => {
    if (!claudeKey) { setAiError("Configure a chave Claude nas configuracoes primeiro"); return; }
    setSearchingSpecs(true); setAiError("");
    try {
      const fetched = await fetchVehicleSpecs(claudeKey, {
        marca: vehicle.marca, modelo: vehicle.modelo, versao: vehicle.versao,
        ano_fabricacao: vehicle.ano_fabricacao, ano_modelo: vehicle.ano_modelo,
        cambio: vehicle.cambio, combustivel: vehicle.combustivel,
      });
      if (Object.keys(fetched).length === 0) {
        setAiError("Nenhum dado verídico encontrado para esse modelo");
      } else {
        setSpecs((prev) => ({ ...prev, ...fetched }));
        await updateVeiculoTechnicalSpecs(vehicle.autoconf_id, fetched);
      }
    } catch (err: any) { setAiError(err.message || "Erro ao pesquisar specs"); }
    setSearchingSpecs(false);
  };

  const handleDoEverything = async () => {
    if (!claudeKey) { setAiError("Configure a chave Claude nas configuracoes primeiro"); return; }
    setDoingAll(true); setAiError("");
    try {
      const result = await enrichVehicleWithSearch(claudeKey, {
        marca: vehicle.marca, modelo: vehicle.modelo, versao: vehicle.versao,
        ano_fabricacao: vehicle.ano_fabricacao, ano_modelo: vehicle.ano_modelo,
        km: vehicle.km, cor: vehicle.cor, cambio: vehicle.cambio,
        combustivel: vehicle.combustivel, acessorios: acessoriosNomes,
      });
      if (result.descricao) {
        setDescricao(result.descricao);
        await updateVeiculoDescricao(vehicle.autoconf_id, result.descricao);
      }
      if (Object.keys(result.technical_specs).length > 0) {
        setSpecs((prev) => ({ ...prev, ...result.technical_specs }));
        await updateVeiculoTechnicalSpecs(vehicle.autoconf_id, result.technical_specs);
      }
    } catch (err: any) { setAiError(err.message || "Erro ao processar"); }
    setDoingAll(false);
  };

  const handleSaveDescricao = async () => {
    setSaving(true);
    await updateVeiculoDescricao(vehicle.autoconf_id, descricao);
    setSaving(false);
  };

  const handleSaveSpecs = async () => {
    setSavingSpecs(true);
    const cleaned: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(specs)) {
      if (v.trim()) cleaned[k] = v;
    }
    await updateVeiculoTechnicalSpecs(vehicle.autoconf_id, cleaned);
    setSavingSpecs(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    if (vehicle.status === "publicado") {
      const despublicado = await despublishVeiculoSingle(vehicle.autoconf_id);
      if (despublicado) {
        try { await logDespublicacoes([despublicado], "manual"); } catch { /* ignora */ }
      }
    } else {
      await publishVeiculo(vehicle.autoconf_id);
    }
    setPublishing(false); onUpdate(); onBack();
  };

  const [resyncing, setResyncing] = useState(false);
  const handleResync = async () => {
    setResyncing(true);
    try {
      // Detail endpoint tá instável (retorna false pra maioria dos IDs).
      // Se falhar, fallback pra list — que tem fotos/acessórios completos.
      let v: any = null;
      try {
        const detail = await fetchAutoConfVeiculo(vehicle.autoconf_id);
        const d = detail.dados as any;
        const veiculo = d?.dados ?? d;
        if (veiculo && typeof veiculo === "object" && !Array.isArray(veiculo) && veiculo.id) {
          v = veiculo;
        }
      } catch { /* ignora, tenta list */ }

      if (!v) {
        // Detail falhou. Busca na list (onde fotos/acessórios também existem).
        const listResp = await fetchAutoConfVeiculos({ registros_por_pagina: 500 });
        const arr = (listResp.dados || []) as any[];
        v = arr.find((x) => Number(x.id) === Number(vehicle.autoconf_id)) || null;
      }

      if (!v) {
        // Nem detail nem list têm o veículo — foi removido do AutoConf (vendido).
        // Marca como despublicado e loga pra auditoria. Se for engano, user
        // reativa pelo Dashboard (card "Últimos despublicados").
        const despublicado = await despublishVeiculoSingle(vehicle.autoconf_id);
        if (despublicado) {
          try { await logDespublicacoes([despublicado], "individual_resync"); } catch { /* ignora */ }
        }
        alert(
          `Veículo ID ${vehicle.autoconf_id} não está mais no AutoConf — marcado como despublicado.\n\n` +
          `Se foi engano, reativa pelo card "Últimos despublicados" no Dashboard.`
        );
        onUpdate();
        onBack();
        return;
      }

      const fotos = Array.isArray(v.fotos) ? v.fotos : [];
      const acc = Array.isArray(v.acessorios) ? v.acessorios : [];
      const accDest = Array.isArray(v.acessorios_destaque) ? v.acessorios_destaque : [];
      const seenIds = new Set<number>();
      const acessorios: unknown[] = [];
      for (const a of [...accDest, ...acc]) {
        const aid = (a as any)?.id;
        if (aid != null && seenIds.has(aid)) continue;
        if (aid != null) seenIds.add(aid);
        acessorios.push(a);
      }
      await upsertVeiculoFromAutoConf(v as Record<string, unknown>, fotos, acessorios);
      onUpdate();
      onBack();
    } catch (err: any) {
      alert("Erro ao re-sincronizar: " + (err?.message || err));
    }
    setResyncing(false);
  };

  const fotos = vehicle.fotos?.length ? vehicle.fotos : vehicle.foto_principal ? [vehicle.foto_principal] : [];

  return (
    <div className="space-y-6">
      {/* ── Header: back · title+badge · ações (primária = Publicar) ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-medium transition flex-shrink-0 mt-1">
            <ChevronLeft size={18} /> Voltar
          </button>
          <div className="h-6 w-px bg-slate-200 mt-1.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 truncate">{vehicle.marca} {vehicle.modelo}</h1>
              <Badge status={vehicle.status} />
            </div>
            <p className="text-slate-500 text-sm truncate mt-0.5">
              {vehicle.versao}
              <span className="text-slate-300 mx-1.5">·</span>
              <span className="text-slate-400">ID {vehicle.autoconf_id}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleResync} disabled={resyncing || publishing || doingAll}
            title="Busca novamente esse veículo no AutoConf (fotos, specs, preço)"
            className="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 w-10 h-10 rounded-lg transition flex items-center justify-center">
            {resyncing ? <Spinner size={16} /> : <RefreshCw size={16} />}
          </button>
          <button onClick={handleDoEverything} disabled={doingAll || generating || searchingSpecs}
            title="Pesquisa specs + gera descrição via Claude (Sonnet + web_search)"
            className="bg-white border border-violet-300 hover:bg-violet-50 disabled:opacity-50 text-violet-700 px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 h-10">
            {doingAll ? <Spinner size={14} /> : <Sparkles size={14} />}
            <span className="hidden sm:inline">{doingAll ? "Processando..." : "Fazer tudo com IA"}</span>
          </button>
          <button onClick={handlePublish} disabled={publishing}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 h-10 ${
              vehicle.status === "publicado"
                ? "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            } disabled:opacity-50`}>
            {publishing ? <Spinner size={14} /> : vehicle.status === "publicado" ? <EyeOff size={14} /> : <Eye size={14} />}
            {publishing ? "..." : vehicle.status === "publicado" ? "Despublicar" : "Publicar"}
          </button>
        </div>
      </div>

      {/* ── Hero: foto (2/5) + resumo comercial (3/5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {fotos.length > 0 ? (
              <div>
                <div className="relative aspect-[4/3] bg-slate-100">
                  <img src={fotos[photoIdx]} alt="" className="w-full h-full object-cover" />
                  {fotos.length > 1 && (
                    <>
                      <button onClick={() => setPhotoIdx((p) => (p - 1 + fotos.length) % fotos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={() => setPhotoIdx((p) => (p + 1) % fotos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition">
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {photoIdx + 1}/{fotos.length}
                  </span>
                </div>
                {fotos.length > 1 && (
                  <div className="flex gap-1.5 p-2 overflow-x-auto">
                    {fotos.map((f, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition ${i === photoIdx ? "border-blue-500" : "border-transparent opacity-50 hover:opacity-80"}`}>
                        <img src={f} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                Sem fotos
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const next = !fotosProvisórias;
              setFotosProvisórias(next);
              updateVeiculoFotosProvisórias(vehicle.autoconf_id, next);
            }}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
              fotosProvisórias
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            <span className="flex items-center gap-2">
              <Camera size={14} />
              Fotos provisórias
            </span>
            <span className={`w-10 h-5 rounded-full relative transition-colors ${fotosProvisórias ? "bg-amber-400" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${fotosProvisórias ? "left-[calc(100%-1.125rem)]" : "left-0.5"}`} />
            </span>
          </button>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {/* Preço + info grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-1">Preço anunciado</p>
            <p className="text-4xl font-bold text-slate-900 mb-5">{fmt(vehicle.preco)}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["Ano", `${vehicle.ano_fabricacao}/${vehicle.ano_modelo}`],
                ["KM", fmtKm(vehicle.km)],
                ["Câmbio", vehicle.cambio || "—"],
                ["Combustível", vehicle.combustivel || "—"],
                ["Cor", vehicle.cor || "—"],
                ["Portas", String(vehicle.portas || "—")],
              ].map(([l, v]) => (
                <div key={String(l)} className="bg-slate-50 rounded-lg px-3 py-2.5">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider font-medium">{l}</p>
                  <p className="text-slate-800 text-sm font-semibold mt-0.5">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-900 text-sm font-semibold">Tags</label>
              <span className="text-slate-400 text-xs">
                Configurar em <span className="text-slate-600 font-medium">Configurações → Tags</span>
              </span>
            </div>

            {/* Tags atuais com preview real do badge */}
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
              {tags.map((tag) => {
                const cfg = tagConfigs.find((c) => c.nome === tag);
                return (
                  <span key={tag} className="inline-flex items-center gap-1">
                    {cfg ? (
                      <TagBadge tag={tag} size="xs" />
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded border border-dashed border-slate-300" title="Tag sem visual configurado — não aparece como badge no site">
                        {tag} (sem visual)
                      </span>
                    )}
                    <button onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500 transition" title="Remover">
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
              {tags.length === 0 && <span className="text-slate-400 text-xs italic">Nenhuma tag adicionada</span>}
            </div>

            {/* Presets vindos da config — mostram badge real clicável */}
            {tagConfigs.filter((c) => !tags.includes(c.nome)).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-3 pt-3 border-t border-slate-100">
                <span className="text-slate-400 text-[11px]">Disponíveis:</span>
                {tagConfigs.filter((c) => !tags.includes(c.nome)).map((c) => (
                  <button
                    key={c.nome}
                    onClick={() => handleAddTag(c.nome)}
                    className="hover:scale-105 transition opacity-70 hover:opacity-100"
                    title={`Adicionar tag "${c.nome}"`}
                  >
                    <TagBadge tag={c.nome} size="xs" />
                  </button>
                ))}
              </div>
            )}

            {/* Input customizado — alerta que sem config não vira badge */}
            <div className="flex gap-2">
              <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag(newTag))}
                placeholder="Tag customizada (sem visual)..."
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10" />
              <button onClick={() => handleAddTag(newTag)} disabled={!newTag.trim()}
                className="bg-slate-100 hover:bg-slate-200 disabled:opacity-30 px-3 py-2 rounded-lg text-sm text-slate-700 transition font-medium flex items-center gap-1.5">
                <Tag size={12} /> Adicionar
              </button>
            </div>
            {newTag.trim() && !tagConfigs.some((c) => c.nome === newTag.trim().toLowerCase()) && (
              <p className="text-amber-600 text-[11px] mt-1.5">
                Essa tag ainda não tem visual em Configurações → Tags. Adicionar lá pra ela aparecer como badge no site.
              </p>
            )}
          </div>

          {/* Acessórios */}
          {vehicle.acessorios && vehicle.acessorios.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <label className="text-slate-900 text-sm font-semibold block mb-3">
                Acessórios <span className="text-slate-400 font-normal">({vehicle.acessorios.length})</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {vehicle.acessorios.map((a) => (
                  <span key={a} className="bg-slate-50 text-slate-600 text-xs px-2.5 py-1 rounded-full border border-slate-200">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Editor: descrição (1/2) · specs (1/2) — colunas esticam pra mesma altura ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Descrição IA — textarea estica pra preencher altura da coluna de specs */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <label className="text-slate-900 text-sm font-semibold">Descrição comercial</label>
            <button onClick={handleGenerateAI} disabled={generating}
              className="text-violet-600 hover:text-violet-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1 transition">
              {generating ? <><Spinner size={12} /> Gerando...</> : <><Sparkles size={12} /> Gerar com IA</>}
            </button>
          </div>
          {aiError && <p className="text-red-500 text-xs mb-2 flex items-center gap-1 flex-shrink-0"><AlertCircle size={11} /> {aiError}</p>}
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição do veículo..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 resize-none text-slate-700 leading-relaxed flex-1 min-h-[280px]" />
          <button onClick={handleSaveDescricao} disabled={saving}
            className="mt-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 flex-shrink-0 self-start">
            {saving ? <Spinner size={14} /> : <Save size={14} />}
            {saving ? "Salvando..." : "Salvar descrição"}
          </button>
        </div>

        {/* Specs técnicas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="text-slate-900 text-sm font-semibold">Especificações técnicas</label>
              <button onClick={handleSearchSpecs} disabled={searchingSpecs || doingAll}
                title="Pesquisa specs verídicas em CarrosNaWeb, iCarros, Quatro Rodas (Sonnet + web_search)"
                className="text-violet-600 hover:text-violet-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1 transition">
                {searchingSpecs ? <><Spinner size={12} /> Pesquisando...</> : <><Sparkles size={12} /> Pesquisar specs</>}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SPEC_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-slate-500 text-[11px] font-medium block mb-1">{label}</label>
                  <input
                    type="text"
                    value={specs[key] || ""}
                    onChange={(e) => setSpecs((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveSpecs} disabled={savingSpecs}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2">
              {savingSpecs ? <Spinner size={14} /> : <Save size={14} />}
              {savingSpecs ? "Salvando..." : "Salvar especificações"}
            </button>

          {/* Preview inline (só quando tem valores salvos) */}
          {Object.values(specs).some((v) => v) && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-2">Preview no site</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {SPEC_FIELDS.filter(({ key }) => specs[key]).map(({ key, label }) => (
                  <div key={key} className="flex justify-between items-baseline text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-500">{label.replace(/\s*\(.*\)/, "")}</span>
                    <span className="text-slate-800 font-semibold">{specs[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, onLogout, collapsed, setCollapsed }: {
  page: Page; setPage: (p: Page) => void; onLogout: () => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const items: { id: Page; icon: React.ReactNode; label: string }[] = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "estoque", icon: <Car size={20} />, label: "Estoque" },
    { id: "leads", icon: <Users size={20} />, label: "Leads" },
    { id: "whatsapp", icon: <MessageCircle size={20} />, label: "WhatsApp" },
    { id: "blog", icon: <BookOpen size={20} />, label: "Blog" },
    { id: "config", icon: <Settings size={20} />, label: "Configuracoes" },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-30 flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
        {!collapsed && <img src={LOGO_BRANCO} alt="Átria" className="h-7 object-contain" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white p-1 rounded transition">
          <Menu size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              page === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-2">
        <button onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sair" : undefined}>
          <LogOut size={18} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Build timestamp — diagnóstico de cache */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <p className="text-[10px] text-slate-600 font-mono leading-tight">
            Build:<br />
            {new Date(__BUILD_TIMESTAMP__).toLocaleString("pt-BR", {
              day: "2-digit", month: "2-digit", year: "2-digit",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </aside>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ vehicles, leads }: { vehicles: VeiculoAdmin[]; leads: LeadAdmin[] }) {
  const published = vehicles.filter((v) => v.status === "publicado").length;
  const drafts = vehicles.filter((v) => v.status === "rascunho").length;
  const pendingLeads = leads.filter((l) => !l.hypergestor_sent_at).length;

  const totalValue = vehicles.reduce((sum, v) => sum + v.preco, 0);

  const [despubs, setDespubs] = useState<DespublicacaoLog[]>([]);
  const [reativandoId, setReativandoId] = useState<string | null>(null);
  const reloadDespubs = useCallback(async () => {
    try { setDespubs(await getUltimasDespublicacoes(30)); } catch (e) { console.error(e); }
  }, []);
  useEffect(() => { reloadDespubs(); }, [reloadDespubs]);
  const handleReativar = async (logId: string, autoconfId: number) => {
    setReativandoId(logId);
    try {
      await reativarVeiculo(logId, autoconfId);
      await reloadDespubs();
    } catch (e: any) {
      alert("Erro ao reativar: " + (e?.message || e));
    }
    setReativandoId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Visao geral do seu estoque e leads</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de veiculos" value={vehicles.length} icon={<Car size={20} />} />
        <StatCard label="Publicados" value={published} icon={<Eye size={20} />} color="text-emerald-600" />
        <StatCard label="Rascunhos" value={drafts} icon={<EyeOff size={20} />} color="text-amber-600" />
        <StatCard label="Leads pendentes CRM" value={pendingLeads} icon={<Users size={20} />} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Valor total do estoque</h3>
          <p className="text-3xl font-bold text-slate-900">{fmt(totalValue)}</p>
          <p className="text-slate-500 text-sm mt-1">{vehicles.length} veiculos em estoque</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${vehicles.length > 0 ? (published / vehicles.length) * 100 : 0}%` }} />
            </div>
            <span className="text-xs text-slate-500">{vehicles.length > 0 ? Math.round((published / vehicles.length) * 100) : 0}% publicado</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Leads recentes</h3>
          {leads.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum lead recebido</p>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{l.nome || l.whatsapp || "Lead"}</p>
                    <p className="text-xs text-slate-400">{l.source} - {fmtDate(l.createdAt)}</p>
                  </div>
                  <CrmBadge lead={l} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimos despublicados (auditoria de sync) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Últimos despublicados automaticamente</h3>
            <p className="text-xs text-slate-500 mt-0.5">Carros que sumiram do AutoConf nos últimos syncs. Clique "Reativar" se for falso positivo.</p>
          </div>
          <button onClick={reloadDespubs} className="text-slate-400 hover:text-slate-600 transition-colors" title="Recarregar lista">
            <RefreshCw size={14} />
          </button>
        </div>
        {despubs.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhuma despublicação registrada ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {despubs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="font-mono text-[11px] uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700 flex-shrink-0">
                  {d.placa_final || "—"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {d.marca} {d.modelo}
                    <span className="text-slate-400 ml-2 text-xs font-normal">{d.versao}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {fmtDate(d.data_despublicacao)} · {d.origem === "sync_batch" ? "sync" : "resync individual"} · {fmt(d.preco)}
                  </p>
                </div>
                <button
                  onClick={() => handleReativar(d.id, d.autoconf_id)}
                  disabled={reativandoId === d.id}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 transition disabled:opacity-50 flex-shrink-0"
                  title="Volta pra status rascunho e some desta lista"
                >
                  {reativandoId === d.id ? "..." : "Reativar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top brands breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Marcas em estoque</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(vehicles.reduce((acc, v) => { acc[v.marca] = (acc[v.marca] || 0) + 1; return acc; }, {} as Record<string, number>))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .map(([marca, count]) => (
              <div key={marca} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{marca}</span>
                <span className="text-slate-400 ml-1.5">{count}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Estoque Page ─────────────────────────────────────────────────────────────
function EstoquePage({ vehicles, loadVehicles, openaiKey, claudeKey, analytics, dailyHistory, milestoneConfig }: {
  vehicles: VeiculoAdmin[]; loadVehicles: () => void; openaiKey: string; claudeKey: string;
  analytics: Map<string, VehicleAnalytics>; dailyHistory: Map<string, DailyRecord[]>;
  milestoneConfig: MilestoneConfig;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ativos" | "rascunho" | "publicado" | "despublicado" | "todos">("ativos");
  const [perfSort, setPerfSort] = useState<"" | "coldest" | "stalled" | "views_no_contact" | "milestone">("");
  type SortCol = "preco" | "dias" | "sances_dias_patio" | "ano_modelo" | "km" | null;
  const [columnSort, setColumnSort] = useState<{ col: SortCol; dir: "asc" | "desc" }>(() => {
    try {
      const saved = sessionStorage.getItem("estoque-column-sort");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { col: null, dir: "desc" };
  });
  useEffect(() => {
    try { sessionStorage.setItem("estoque-column-sort", JSON.stringify(columnSort)); } catch {}
  }, [columnSort]);
  type QuickFilter = "parados90" | "divergentes" | "semFotos" | null;
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(() => {
    try {
      const saved = sessionStorage.getItem("estoque-quick-filter");
      if (saved === "parados90" || saved === "divergentes" || saved === "semFotos") return saved;
    } catch {}
    return null;
  });
  useEffect(() => {
    try {
      if (quickFilter) sessionStorage.setItem("estoque-quick-filter", quickFilter);
      else sessionStorage.removeItem("estoque-quick-filter");
    } catch {}
  }, [quickFilter]);
  const [fotosProvFilter, setFotosProvFilter] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VeiculoAdmin | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [sancesPendentes, setSancesPendentes] = useState<SancesPendenteStored[]>([]);

  // Carrega pendentes do Firestore ao montar (sobrevive a reload/navigation)
  useEffect(() => {
    getSancesPendentes().then((list) => setSancesPendentes(list)).catch(() => {});
  }, []);
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState("");
  const [publishingAll, setPublishingAll] = useState(false);
  const [publishAllResult, setPublishAllResult] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem("estoque-page");
      const n = saved ? Number(saved) : 1;
      return Number.isFinite(n) && n >= 1 ? n : 1;
    } catch { return 1; }
  });
  useEffect(() => {
    try { sessionStorage.setItem("estoque-page", String(currentPage)); } catch {}
  }, [currentPage]);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter === "ativos" && v.status === "despublicado") return false;
      if (statusFilter === "rascunho" && v.status !== "rascunho") return false;
      if (statusFilter === "publicado" && v.status !== "publicado") return false;
      if (statusFilter === "despublicado" && v.status !== "despublicado") return false;
      if (fotosProvFilter && !v.fotos_provisorias) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const placaNorm = (v.placa_final || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const searchNorm = s.replace(/[^a-z0-9]/g, "");
        const matchesPlaca = searchNorm.length > 0 && placaNorm.includes(searchNorm);
        if (
          !v.marca.toLowerCase().includes(s) &&
          !v.modelo.toLowerCase().includes(s) &&
          !v.versao.toLowerCase().includes(s) &&
          !matchesPlaca
        ) return false;
      }
      return true;
    });
  }, [vehicles, statusFilter, searchTerm, fotosProvFilter]);

  const fotosProvCount = useMemo(
    () => vehicles.filter((v) => v.fotos_provisorias).length,
    [vehicles]
  );

  // Performance data — diagnostic based on last 7 days vs previous 7 days
  const now = Date.now();

  // Step 1: basic fields + milestone detection
  const withBasic = useMemo(() => filtered.map((v) => {
    const a = analytics.get(v.slug);
    const pubDate = v.data_publicacao?.toDate?.();
    const dias = pubDate ? Math.max(1, Math.floor((now - pubDate.getTime()) / 86400000)) : 0;
    const views = a?.pageviews ?? 0;
    const contatos = (a?.cliques_whatsapp ?? 0) + (a?.cliques_telefone ?? 0) + (a?.leads ?? 0);
    const milestone = milestoneConfig.dias.find((d) => dias >= d && dias < d + 3) ?? null;
    const history = dailyHistory.get(v.slug) ?? [];
    return { ...v, dias, views, contatos, milestone, history };
  }), [filtered, analytics, milestoneConfig, dailyHistory, now]);

  // Step 2: compute medianas from published vehicles for diagnostic thresholds
  const { medianaViews, medianaContatos } = useMemo(() => {
    const pub = withBasic.filter((v) => v.status === "publicado" && v.dias > 0 && v.history.length > 0);
    if (!pub.length) return { medianaViews: 0, medianaContatos: 0 };

    const today = new Date();
    const d7ago = new Date(today);
    d7ago.setDate(d7ago.getDate() - 7);
    const todayStr = today.toISOString().slice(0, 10);
    const d7agoStr = d7ago.toISOString().slice(0, 10);

    const viewsList: number[] = [];
    const contatosList: number[] = [];
    for (const v of pub) {
      let vw = 0, ct = 0;
      for (const r of v.history) {
        if (r.date >= d7agoStr && r.date <= todayStr) {
          vw += r.pageviews;
          ct += r.cliques_whatsapp + r.cliques_telefone + r.leads;
        }
      }
      viewsList.push(vw);
      contatosList.push(ct);
    }
    return { medianaViews: calcMediana(viewsList), medianaContatos: calcMediana(contatosList) };
  }, [withBasic]);

  // Step 3: compute diagnostic per vehicle
  const withPerf = useMemo(() => withBasic.map((v) => {
    const diag = calcDiagnostic(v.history, medianaViews, medianaContatos);
    return { ...v, diag };
  }), [withBasic, medianaViews, medianaContatos]);

  const sorted = useMemo(() => {
    let arr = [...withPerf];

    // 1. Quick filter filtra primeiro
    if (quickFilter === "parados90") {
      arr = arr.filter((v) => (v.sances_dias_patio ?? 0) > 90);
    } else if (quickFilter === "divergentes") {
      arr = arr.filter((v) => v.sances_status === "divergente");
    } else if (quickFilter === "semFotos") {
      arr = arr.filter((v) => (v.fotos?.length || 0) <= 1 && v.status !== "despublicado");
    }

    // 2. Column sort tem prioridade sobre perfSort
    if (columnSort.col) {
      const key = columnSort.col;
      const mult = columnSort.dir === "desc" ? -1 : 1;
      return [...arr].sort((a, b) => {
        const av = Number((a as any)[key]) || 0;
        const bv = Number((b as any)[key]) || 0;
        return (av - bv) * mult;
      });
    }

    // 3. Sort implícito do quick filter ativo
    if (quickFilter === "parados90") return [...arr].sort((a, b) => (b.sances_dias_patio ?? 0) - (a.sances_dias_patio ?? 0));
    if (quickFilter === "divergentes") return [...arr].sort((a, b) => Math.abs(b.sances_diff ?? 0) - Math.abs(a.sances_diff ?? 0));
    if (quickFilter === "semFotos") return [...arr].sort((a, b) => b.dias - a.dias);

    // 4. Senão, perfSort existente
    switch (perfSort) {
      case "coldest": return arr.sort((a, b) => (a.diag.views7d + a.diag.contatos7d) - (b.diag.views7d + b.diag.contatos7d));
      case "stalled": return arr.sort((a, b) => b.dias - a.dias);
      case "views_no_contact": return arr.sort((a, b) => { const rA = a.diag.views7d > 0 ? a.diag.contatos7d / a.diag.views7d : 1; const rB = b.diag.views7d > 0 ? b.diag.contatos7d / b.diag.views7d : 1; return rA - rB; });
      case "milestone": return arr.filter((v) => v.milestone !== null);
      default: return arr;
    }
  }, [withPerf, perfSort, columnSort, quickFilter]);

  // Helpers pra interação de sort/filter
  const handleColumnSort = (col: Exclude<SortCol, null>) => {
    setColumnSort((prev) => {
      if (prev.col !== col) return { col, dir: "desc" };
      if (prev.dir === "desc") return { col, dir: "asc" };
      return { col: null, dir: "desc" };
    });
  };
  const toggleQuickFilter = (f: Exclude<QuickFilter, null>) => {
    setQuickFilter((cur) => (cur === f ? null : f));
    setColumnSort({ col: null, dir: "desc" }); // reseta column sort quando muda quick filter
  };
  const SortArrow = ({ col }: { col: Exclude<SortCol, null> }) => {
    if (columnSort.col !== col) return <ArrowUpDown size={11} className="text-slate-300" />;
    return columnSort.dir === "desc"
      ? <ArrowDown size={11} className="text-blue-600" />
      : <ArrowUp size={11} className="text-blue-600" />;
  };

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const firstMountRef = useRef(true);
  useEffect(() => {
    if (firstMountRef.current) { firstMountRef.current = false; return; }
    setCurrentPage(1);
  }, [searchTerm, statusFilter, perfSort, columnSort, quickFilter]);

  const publishedCount = vehicles.filter((v) => v.status === "publicado").length;
  const draftCount = vehicles.filter((v) => v.status === "rascunho").length;
  const despublicadoCount = vehicles.filter((v) => v.status === "despublicado").length;

  const handleSync = async () => {
    setSyncing(true); setSyncResult(""); setEnrichResult(""); setPublishAllResult("");
    try {
      const res = await fetchAutoConfVeiculos({ registros_por_pagina: 500 });
      const dados = Array.isArray(res.dados) ? res.dados : [];
      let created = 0, updated = 0, errors = 0;
      const failedIds: number[] = [];
      let loggedPrecoFields = false;
      for (const v of dados) {
        try {
          // FONTE PRIMÁRIA: o LIST endpoint (dados `v`) já traz fotos, acessórios,
          // acessorios_destaque completos. Detail endpoint retorna `false` em ~100%
          // dos casos atualmente (bug AutoConf), então detail vira só enrichment
          // opcional. Usar list como default elimina perda de fotos silenciosa.
          const vAny = v as any;
          let fotos: unknown[] = Array.isArray(vAny.fotos) ? vAny.fotos : [];
          let accList: unknown[] = Array.isArray(vAny.acessorios) ? vAny.acessorios : [];
          let accDest: unknown[] = Array.isArray(vAny.acessorios_destaque) ? vAny.acessorios_destaque : [];

          // Enrichment via detail (opcional — sobrescreve se vier com mais info)
          try {
            const detail = await fetchAutoConfVeiculo(v.id);
            const d = detail.dados as any;
            const veiculo = d?.dados ?? d;
            if (veiculo && typeof veiculo === "object" && !Array.isArray(veiculo)) {
              if (Array.isArray(veiculo.fotos) && veiculo.fotos.length > 0) fotos = veiculo.fotos;
              if (Array.isArray(veiculo.acessorios)) accList = veiculo.acessorios;
              if (Array.isArray(veiculo.acessorios_destaque)) accDest = veiculo.acessorios_destaque;
              if (!loggedPrecoFields) {
                loggedPrecoFields = true;
                const precoRx = /val|preco|price|anuncio|web|publicad|negoc/i;
                const filterPreco = (obj: any) => Object.fromEntries(
                  Object.entries(obj || {}).filter(([k, val]) => precoRx.test(k) && val !== null && val !== "")
                );
                console.log("[SYNC DEBUG] Campos de preço — lista (primeiro veículo):", filterPreco(v));
                console.log("[SYNC DEBUG] Campos de preço — detalhe (primeiro veículo):", filterPreco(veiculo));
              }
            }
          } catch { /* detail falhou, dados da list servem */ }

          // Merge acessórios (destaque + lista), dedupe por id
          const seenIds = new Set<number>();
          const acessorios: unknown[] = [];
          for (const a of [...accDest, ...accList]) {
            const aid = (a as any)?.id;
            if (aid != null && seenIds.has(aid)) continue;
            if (aid != null) seenIds.add(aid);
            acessorios.push(a);
          }

          const result = await upsertVeiculoFromAutoConf(v as unknown as Record<string, unknown>, fotos, acessorios);
          if (result === "created") created++; else updated++;
        } catch (err) {
          errors++;
          failedIds.push(v.id);
          console.error(`[sync] vehicle ${v.id} failed:`, err);
        }
      }
      const autoconfIds = new Set(dados.map((v: any) => String(v.id)));
      const despublicadosList = await despublishOrphanVeiculos(autoconfIds);
      const despublicados = despublicadosList.length;
      if (despublicadosList.length > 0) {
        try { await logDespublicacoes(despublicadosList, "sync_batch"); }
        catch (e) { console.error("[sync] falha ao logar despublicacoes:", e); }
      }
      const errorSuffix = errors
        ? `, ${errors} com erro (IDs: ${failedIds.slice(0, 5).join(", ")}${failedIds.length > 5 ? "..." : ""})`
        : "";

      // ── Sances cross-check + autocomplete de placa ─────────────────
      // AutoConf mascara a placa como "A**-***1" — só primeira letra + último char.
      // A Sances retorna placa completa + descrição de modelo mais verbosa que
      // a do AutoConf (ex: AutoConf "KA" vs Sances "FORD KA SE 1.0"). Por isso
      // NÃO usamos modelo no fingerprint primário — apenas como tie-breaker
      // quando marca+ano+primeira+última da placa dão múltiplos candidatos.
      // Teste empírico (200 AutoConf × 74 Sances): fp sem modelo dá 60 matches
      // únicos sem ambiguidade; com modelo cai pra 19 acidentais.
      let sancesSuffix = "";
      try {
        setSyncResult(`Sincronizado: ${updated} atualizados, ${created} novos, ${despublicados} despublicados — verificando Sances...`);
        const sancesList = await fetchSancesVeiculos();
        const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        // Aliases conhecidos de marca entre AutoConf e Sances
        const MARCA_ALIASES: Record<string, string> = {
          gm: "chevrolet",
          vw: "volkswagen",
          gwmhaval: "gwm",
          caoachery: "chery",
        };
        const normMarca = (s: string) => {
          const n = norm(s);
          return MARCA_ALIASES[n] || n;
        };
        const fpBase = (placa: string, marca: string, ano: string | number) => {
          const p = (placa || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          if (p.length < 2) return "";
          const first = p[0];
          const last = p[p.length - 1];
          return `${first}${last}|${normMarca(marca)}|${String(ano || "").slice(-4)}`;
        };

        // Index Sances: fpBase → array de candidatos (preserva modelo + km pro match)
        type SancesMatch = { placa: string; preco: number; modelo: string; diasPatio: number; km: number };
        const sancesByFingerprint = new Map<string, SancesMatch[]>();
        const sancesByPlacaCompleta = new Map<string, SancesMatch>();
        for (const sv of sancesList) {
          const placaCompleta = (sv.placa || "").toUpperCase();
          const preco = typeof sv.precoVenda === "number" ? sv.precoVenda : 0;
          const diasPatio = typeof sv.diasEstoque === "number" ? sv.diasEstoque : 0;
          const km = typeof sv.quilometragem === "number" ? sv.quilometragem : 0;
          if (!placaCompleta) continue;
          const entry: SancesMatch = { placa: placaCompleta, preco, modelo: sv.descricaoModelo || "", diasPatio, km };
          sancesByPlacaCompleta.set(norm(placaCompleta), entry);
          const fp = fpBase(placaCompleta, sv.descricaoMarca || "", sv.anoModelo || "");
          if (!fp) continue;
          if (!sancesByFingerprint.has(fp)) sancesByFingerprint.set(fp, []);
          sancesByFingerprint.get(fp)!.push(entry);
        }

        // Placas Sances que deram match com algum AutoConf (pra depois filtrar pendentes)
        const placasSancesUsadas = new Set<string>();
        let divergentes = 0, ok = 0, repasse = 0, naoEncontrados = 0, placasCompletadas = 0;
        for (const v of dados as any[]) {
          const placaAutoconfRaw = String(v.placa || "");
          const isMascarada = placaAutoconfRaw.includes("*");
          const precoAutoconf = parseFloat(String(v.valoranuncio || v.valor_anuncio || v.valorvenda || v.preco || 0)) || 0;

          // Tenta matchar: primeiro placa completa direta (caso raro, fallback), depois fingerprint
          let match: SancesMatch | null = null;
          if (!isMascarada) {
            const entry = sancesByPlacaCompleta.get(norm(placaAutoconfRaw));
            if (entry !== undefined) match = entry;
          }
          if (!match) {
            const fp = fpBase(placaAutoconfRaw, v.marca_nome || "", v.anomodelo || "");
            if (fp) {
              const candidates = sancesByFingerprint.get(fp) || [];
              // Tie-breaker por modelo + KM: evita false positives quando
              // AutoConf não expõe placa_completa. KM deve ser IDÊNTICO — carros
              // diferentes quase nunca têm mesmo km exato, carros iguais entre
              // Sances e AutoConf têm km sincronizado (confirmado empiricamente
              // nos 4 casos reportados pelo user: BWW5C42/FIX1D82/EBQ0529/EGU8J59).
              const normModelo = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
              // Aliases de modelo: AutoConf às vezes usa submarca ("Haval"),
              // Sances usa modelo específico ("H6"). Mapeamento token AC → tokens aceitos SC.
              const MODELO_ALIASES: Record<string, string[]> = {
                HAVAL: ["H6", "H2", "H3", "JOLION", "DARGO", "F7"],
              };
              const tokenAc = normModelo(String(v.modelopai_nome || "")).split(/\s+/)[0] || "";
              const tokensAceitos = tokenAc ? [tokenAc, ...(MODELO_ALIASES[tokenAc] || [])] : [];
              const modeloOK = (c: SancesMatch) =>
                tokensAceitos.length === 0 || tokensAceitos.some((t) => normModelo(c.modelo).includes(t));
              const kmAutoconf = Number(v.km) || 0;
              // Filtra primeiro por modelo. KM antes era filtro estrito (=== exato),
              // mas isso quebrava quando Sances atualizava km real e AutoConf ficava
              // atrasado (ex: Chery Tiggo 5X GJQ6C37 — match falhava). Agora KM
              // entra só como tie-breaker quando há múltiplos candidatos modelo-OK.
              const compatModelo = candidates.filter(modeloOK);
              if (compatModelo.length === 1) {
                match = compatModelo[0];
              } else if (compatModelo.length > 1 && kmAutoconf > 0) {
                // Múltiplos com mesmo modelo+marca+ano+placa-fp: pega o KM mais próximo
                const sorted = [...compatModelo].sort(
                  (a, b) => Math.abs(a.km - kmAutoconf) - Math.abs(b.km - kmAutoconf)
                );
                match = sorted[0];
              }
              // Se 0 modelo-OK, não arrisca (evita false match entre carros distintos)
            }
          }

          let status: "ok" | "divergente" | "nao_encontrado" | "repasse";
          let diff: number | null = null;
          let precoToSave: number | null = null;
          let placaAutocomplete: string | undefined = undefined;

          if (!match) {
            status = "nao_encontrado";
            naoEncontrados++;
          } else {
            placasSancesUsadas.add(match.placa.toUpperCase());
            const sancesPreco = match.preco;
            if (isMascarada) {
              placaAutocomplete = match.placa; // preenche placa_final com a placa real da Sances
              placasCompletadas++;
            }
            if (sancesPreco < 1000) {
              status = "repasse";
              precoToSave = sancesPreco;
              repasse++;
            } else {
              precoToSave = sancesPreco;
              diff = precoAutoconf - sancesPreco;
              if (Math.abs(diff) < 1) { status = "ok"; ok++; } else { status = "divergente"; divergentes++; }
            }
          }

          try {
            await updateVeiculoSances(Number(v.id), {
              sances_preco: precoToSave,
              sances_status: status,
              sances_diff: diff,
              sances_dias_patio: match ? match.diasPatio : null,
              ...(placaAutocomplete ? { placa_final: placaAutocomplete } : {}),
            });
          } catch (e) { /* tolera falha individual, continua */ }
        }

        // Direção inversa: veículos na Sances (preço retail) que não estão no AutoConf.
        // Usa placasSancesUsadas (alimentado no loop via fingerprint + modelo + KM
        // exato). AutoConf não expõe placa_completa de forma confiável, por isso
        // KM idêntico é o discriminante principal: carros diferentes quase nunca
        // têm mesmo km exato.
        const pendentes: SancesPendenteStored[] = sancesList
          .filter((sv) => {
            const preco = typeof sv.precoVenda === "number" ? sv.precoVenda : 0;
            if (preco < 1000) return false; // ignora repasse
            if (!sv.placa) return false;
            return !placasSancesUsadas.has(sv.placa.toUpperCase());
          })
          .map((sv) => ({
            placa: String(sv.placa || "").toUpperCase(),
            marca: String(sv.descricaoMarca || ""),
            modelo: String(sv.descricaoModelo || ""),
            ano: Number(sv.anoModelo) || 0,
            preco: typeof sv.precoVenda === "number" ? sv.precoVenda : 0,
            estoque: String(sv.descricaoEstoque || ""),
          }));
        console.log("[sync] Sances pendentes pra cadastrar no AutoConf:", pendentes.length, pendentes);
        setSancesPendentes(pendentes);
        try { await saveSancesPendentes(pendentes); } catch (e) { console.error("[sync] falha ao persistir pendentes:", e); }

        sancesSuffix = `. Sances: ${divergentes} divergentes, ${ok} ok, ${repasse} repasse, ${naoEncontrados} não encontrados`;
        if (placasCompletadas > 0) sancesSuffix += `, ${placasCompletadas} placas completadas`;
        if (pendentes.length > 0) sancesSuffix += `, ${pendentes.length} pra cadastrar no AutoConf`;
      } catch (e: any) {
        console.error("[sync] Sances falhou:", e);
        sancesSuffix = `. Sances: falhou (${e.message || "erro"})`;
      }

      setSyncResult(`Sincronizado: ${updated} atualizados, ${created} novos (rascunho), ${despublicados} despublicados${errorSuffix}${sancesSuffix}`);
      loadVehicles();
    } catch (err: any) { setSyncResult(`Erro: ${err.message}`); }
    setSyncing(false);
  };

  // Lote: pesquisa specs verídicas (Sonnet+web_search) só nos rascunhos sem technical_specs
  const handleEnrichSpecs = async () => {
    if (!claudeKey) { setEnrichResult("Erro: Configure a chave Claude nas configuracoes primeiro"); return; }
    const targets = vehicles.filter((v) => v.status === "rascunho" && (!v.technical_specs || Object.keys(v.technical_specs).length === 0));
    if (targets.length === 0) { setEnrichResult("Nenhum rascunho sem specs para pesquisar"); return; }
    setEnriching(true); setEnrichResult(""); setSyncResult(""); setPublishAllResult("");
    let ok = 0, failed = 0;
    try {
      for (let i = 0; i < targets.length; i++) {
        const v = targets[i];
        setEnrichResult(`Pesquisando specs ${i + 1}/${targets.length} (${v.marca} ${v.modelo})...`);
        try {
          const specs = await fetchVehicleSpecs(claudeKey, {
            marca: v.marca, modelo: v.modelo, versao: v.versao,
            ano_fabricacao: v.ano_fabricacao, ano_modelo: v.ano_modelo,
            cambio: v.cambio, combustivel: v.combustivel,
          });
          if (Object.keys(specs).length > 0) {
            await updateVeiculoTechnicalSpecs(v.autoconf_id, specs);
            ok++;
          } else {
            failed++;
          }
        } catch (e) {
          console.error("[SPECS] falhou para", v.autoconf_id, e);
          failed++;
        }
        if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 500));
      }
      setEnrichResult(`Specs: ${ok} pesquisados${failed ? `, ${failed} falharam` : ""}`);
      loadVehicles();
    } catch (err: any) { setEnrichResult(`Erro: ${err.message}`); }
    setEnriching(false);
  };

  // Lote: gera descricao comercial (OpenAI, rapido/barato) nos rascunhos sem descricao_ia
  const handleEnrichDescriptions = async () => {
    if (!openaiKey) { setEnrichResult("Erro: Configure a chave OpenAI nas configuracoes primeiro"); return; }
    const targets = vehicles.filter((v) => v.status === "rascunho" && !v.descricao_ia);
    if (targets.length === 0) { setEnrichResult("Nenhum rascunho sem descricao"); return; }
    setEnriching(true); setEnrichResult(""); setSyncResult(""); setPublishAllResult("");
    let ok = 0, failed = 0;
    try {
      for (let i = 0; i < targets.length; i++) {
        const v = targets[i];
        setEnrichResult(`Gerando descricao ${i + 1}/${targets.length} (${v.marca} ${v.modelo})...`);
        try {
          const desc = await generateDescription(openaiKey, {
            marca: v.marca, modelo: v.modelo, versao: v.versao,
            ano_fabricacao: v.ano_fabricacao, ano_modelo: v.ano_modelo,
            km: v.km, cor: v.cor, cambio: v.cambio,
            combustivel: v.combustivel,
            acessorios: (v.acessorios || []).map((a: any) => typeof a === "string" ? a : a?.nome || "").filter(Boolean),
          });
          if (desc) { await updateVeiculoDescricao(v.autoconf_id, desc); ok++; } else failed++;
        } catch (e) {
          console.error("[DESC] falhou para", v.autoconf_id, e);
          failed++;
        }
        if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 200));
      }
      setEnrichResult(`Descricoes: ${ok} geradas${failed ? `, ${failed} falharam` : ""}`);
      loadVehicles();
    } catch (err: any) { setEnrichResult(`Erro: ${err.message}`); }
    setEnriching(false);
  };

  const handlePublishAllDrafts = async () => {
    const drafts = vehicles.filter((v) => v.status === "rascunho");
    if (drafts.length === 0) return;
    setPublishingAll(true); setPublishAllResult(""); setSyncResult(""); setEnrichResult("");
    try {
      for (let i = 0; i < drafts.length; i++) {
        setPublishAllResult(`Publicando ${i + 1}/${drafts.length}...`);
        await publishVeiculo(drafts[i].autoconf_id);
      }
      setPublishAllResult(`Concluido: ${drafts.length} rascunhos publicados`);
      loadVehicles();
    } catch (err: any) { setPublishAllResult(`Erro: ${err.message}`); }
    setPublishingAll(false);
  };

  const listView = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
          <p className="text-slate-500 text-sm mt-0.5">{vehicles.length} veiculos ({publishedCount} publicados, {draftCount} rascunhos, {despublicadoCount} despublicados)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSync} disabled={syncing || enriching || publishingAll}
            className="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
            {syncing ? <Spinner size={14} /> : <RefreshCw size={14} />}
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </button>
          {draftCount > 0 && (
            <button onClick={handleEnrichSpecs} disabled={syncing || enriching || publishingAll}
              title="Pesquisa specs verídicas (Sonnet + web_search) nos rascunhos sem technical_specs"
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
              {enriching ? <Spinner size={14} /> : <Sparkles size={14} />}
              {enriching ? "Processando..." : "Pesquisar specs"}
            </button>
          )}
          {draftCount > 0 && (
            <button onClick={handleEnrichDescriptions} disabled={syncing || enriching || publishingAll}
              title="Gera descrição comercial (OpenAI) nos rascunhos sem descricao_ia"
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
              {enriching ? <Spinner size={14} /> : <Sparkles size={14} />}
              {enriching ? "Processando..." : "Gerar descrições"}
            </button>
          )}
          {draftCount > 0 && (
            <button onClick={handlePublishAllDrafts} disabled={syncing || enriching || publishingAll}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
              {publishingAll ? <Spinner size={14} /> : <Eye size={14} />}
              {publishingAll ? "Publicando..." : `Publicar ${draftCount} rascunhos`}
            </button>
          )}
        </div>
      </div>

      {/* Progress messages */}
      {(() => {
        const msg = syncResult || enrichResult || publishAllResult;
        if (!msg) return null;
        const isError = msg.startsWith("Erro");
        const isDone = msg.startsWith("Sincronizado") || msg.startsWith("Concluido") || msg.startsWith("Nenhum");
        return (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border ${
            isError ? "bg-red-50 text-red-700 border-red-200"
            : isDone ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            {isError ? <AlertCircle size={14} /> : isDone ? <CheckCircle2 size={14} /> : <Spinner size={14} />}
            {msg}
          </div>
        );
      })()}

      {/* Alerta: veículos na Sances sem correspondente no AutoConf */}
      {sancesPendentes.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-700" />
            <h3 className="font-semibold text-amber-900 text-sm uppercase tracking-wide">
              Cadastrar no AutoConf — {sancesPendentes.length} veículo{sancesPendentes.length !== 1 ? "s" : ""} na Sances sem correspondente
            </h3>
          </div>
          <div className="divide-y divide-amber-200">
            {sancesPendentes.map((sv) => (
              <div key={sv.placa} className="flex items-center gap-3 py-2 text-sm">
                <span className="font-mono text-xs uppercase bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-900 flex-shrink-0">
                  {sv.placa}
                </span>
                <span className="text-amber-900 truncate flex-1 min-w-0">
                  {sv.marca} {sv.modelo}
                  <span className="text-amber-700 ml-2 text-xs">{sv.ano}</span>
                </span>
                <span className="text-amber-600 text-xs hidden md:inline">{sv.estoque}</span>
                <span className="font-semibold text-amber-900 tabular-nums flex-shrink-0">{fmt(sv.preco)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar marca, modelo, versão ou placa..."
              className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-blue-500">
              <option value="ativos">Ativos</option>
              <option value="publicado">Publicado</option>
              <option value="rascunho">Rascunho</option>
              <option value="despublicado">Despublicado</option>
              <option value="todos">Todos</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-slate-400" />
            <select value={perfSort} onChange={(e) => setPerfSort(e.target.value as any)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-blue-500">
              <option value="">Performance</option>
              <option value="coldest">Mais frios primeiro</option>
              <option value="stalled">Mais dias parado</option>
              <option value="views_no_contact">Views sem contato</option>
              <option value="milestone">Em marco de revisão</option>
            </select>
          </div>
          <button
            onClick={() => setFotosProvFilter((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${
              fotosProvFilter
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            <Camera size={14} />
            Fotos provisórias
          </button>
          {/* Quick filters — atalhos pra workflows comuns */}
          <button
            onClick={() => toggleQuickFilter("parados90")}
            title="Veículos no pátio físico há mais de 90 dias (Sances)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${
              quickFilter === "parados90"
                ? "bg-red-50 border-red-300 text-red-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            <Clock size={14} />
            Parados &gt; 90d
          </button>
          <button
            onClick={() => toggleQuickFilter("divergentes")}
            title="Preço AutoConf diferente do preço Sances"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${
              quickFilter === "divergentes"
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            <AlertCircle size={14} />
            Divergentes Sances
          </button>
          <button
            onClick={() => toggleQuickFilter("semFotos")}
            title="Veículos com 1 ou nenhuma foto (exceto despublicados)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${
              quickFilter === "semFotos"
                ? "bg-slate-800 border-slate-800 text-white"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}>
            <ImageIcon size={14} />
            Sem fotos
          </button>
          <button
            onClick={() => {
              setShareText(buildFotosProvisoriasMessage(vehicles));
              setShareCopied(false);
              setShareOpen(true);
            }}
            disabled={fotosProvCount === 0}
            title={fotosProvCount === 0 ? "Nenhum carro com fotos provisórias" : `Gerar mensagem com ${fotosProvCount} carros`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-500 transition hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200">
            <Share2 size={14} />
            Compartilhar lista
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Car size={48} />}
          title={vehicles.length === 0 ? "Nenhum veiculo importado" : "Nenhum resultado"}
          description={vehicles.length === 0 ? 'Clique em "Sincronizar" para importar veiculos do AutoConf.' : "Tente ajustar os filtros."}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Placa</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    <button type="button" onClick={() => handleColumnSort("ano_modelo")} className="flex items-center gap-1 hover:text-slate-700 transition-colors uppercase tracking-wider">
                      Ano <SortArrow col="ano_modelo" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    <button type="button" onClick={() => handleColumnSort("km")} className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors uppercase tracking-wider">
                      KM <SortArrow col="km" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <button type="button" onClick={() => handleColumnSort("preco")} className="flex items-center gap-1 ml-auto hover:text-slate-700 transition-colors uppercase tracking-wider">
                      Preco <SortArrow col="preco" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider" title="Carros em promoção (valorpromocao > 0 no AutoConf)">Promo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell" title="Preço na Sances (cross-check)">Sances</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Fotos</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden xl:table-cell">Tags</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden 2xl:table-cell">
                    <button type="button" onClick={() => handleColumnSort("dias")} className="flex items-center gap-1 mx-auto hover:text-slate-700 transition-colors uppercase tracking-wider">
                      Dias cadastro <SortArrow col="dias" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden 2xl:table-cell" title="Dias no pátio físico (Sances)">
                    <button type="button" onClick={() => handleColumnSort("sances_dias_patio")} className="flex items-center gap-1 mx-auto hover:text-slate-700 transition-colors uppercase tracking-wider">
                      Dias pátio <SortArrow col="sances_dias_patio" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden 2xl:table-cell">Desempenho 7d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((v) => [
                  <tr key={v.autoconf_id} onClick={() => setSelectedVehicle(v)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {v.foto_principal ? (
                            <img src={v.foto_principal} alt="" className="w-14 h-10 object-cover rounded-lg" />
                          ) : (
                            <div className="w-14 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Car size={16} className="text-slate-300" />
                            </div>
                          )}
                          {v.fotos_provisorias && (
                            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center" title="Fotos provisórias">
                              <Camera size={10} />
                            </span>
                          )}
                          {(v.fotos?.length || 0) <= 1 && !v.fotos_provisorias && (
                            <span className="absolute -bottom-1.5 -left-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center" title="Galeria com 1 foto — sync pode ter falhado, tente Re-sincronizar">
                              <AlertCircle size={10} />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{v.marca} {v.modelo}</p>
                          <p className="text-slate-400 text-xs truncate">{v.versao}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs uppercase tracking-wider">{v.placa_final || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{v.ano_fabricacao}/{v.ano_modelo}</td>
                    <td className="px-4 py-3 text-slate-600 text-right hidden md:table-cell">{fmtKm(v.km)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 text-right">{fmt(v.preco)}</td>
                    <td className="px-4 py-3 text-center">
                      {v.preco_promocao && v.preco_promocao > 0 ? (
                        v.preco_promocao < v.preco ? (
                          <span className="inline-flex flex-col items-center gap-0.5">
                            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">Oferta</span>
                            <span className="text-[11px] text-slate-700 font-semibold">{fmt(v.preco_promocao)}</span>
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" title={`valorpromocao=${fmt(v.preco_promocao)} (igual ao preço — operação preencheu errado no AutoConf)`}>Oferta</span>
                        )
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <SancesCell v={v} />
                    </td>
                    <td className="px-4 py-3 text-center"><Badge status={v.status} /></td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const next = !v.fotos_provisorias;
                          v.fotos_provisorias = next; // optimistic UI local
                          await updateVeiculoFotosProvisórias(v.autoconf_id, next);
                          await loadVehicles();
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition ${
                          v.fotos_provisorias
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                        title={v.fotos_provisorias ? "Fotos provisórias — clique pra desmarcar" : "Fotos OK — clique pra marcar como provisórias"}>
                        <Camera size={12} />
                        {v.fotos_provisorias ? "Prov." : "OK"}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(v.tags || []).slice(0, 3).map((tag) => <TagChip key={tag} tag={tag} size="xs" />)}
                        {(v.tags || []).length > 3 && <span className="text-slate-400 text-[10px]">+{v.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden 2xl:table-cell">
                      <span className="text-sm text-slate-600">{v.dias > 0 ? `${v.dias}d` : "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden 2xl:table-cell">
                      <span className="text-sm text-slate-600" title="Dias no pátio físico (Sances)">
                        {typeof v.sances_dias_patio === "number" ? `${v.sances_dias_patio}d` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden 2xl:table-cell">
                      {v.dias > 0 ? (() => {
                        const d = v.diag;
                        const style = DIAG_STYLE[d.diagnostico] ?? DIAG_STYLE["Sem dados"];
                        return (
                          <div className={`inline-flex flex-col gap-0.5 text-xs px-2.5 py-1.5 rounded-lg border ${style.cls}`}>
                            <div className="flex items-center gap-2 font-medium">
                              <span>{d.views7d} views</span>
                              <span className="text-slate-300">|</span>
                              <span>{d.contatos7d} contatos</span>
                              <span className="text-slate-300">|</span>
                              <span>{d.conversao.toFixed(1)}%</span>
                              <span className="text-slate-300">|</span>
                              <span>{TEND_ICON[d.tendenciaDir]} {d.tendenciaPct > 0 ? "+" : ""}{d.tendenciaPct.toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px]">
                              <span>{style.icon}</span>
                              <span>{d.diagnostico}</span>
                            </div>
                          </div>
                        );
                      })() : <span className="text-xs text-slate-300">Sem dados</span>}
                    </td>
                  </tr>
                  ,v.milestone ? (
                    <tr key={`${v.autoconf_id}-ms`} className="bg-orange-50/50">
                      <td colSpan={13} className="px-4 py-1.5">
                        <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border ${
                          (DIAG_STYLE[v.diag.diagnostico] ?? DIAG_STYLE["Sem dados"]).cls
                        }`}>
                          <AlertCircle size={12} />
                          Marco {v.milestone}d: {v.diag.views7d} views 7d, {v.diag.contatos7d} contatos 7d, {v.diag.conversao.toFixed(1)}% conv. — {v.diag.diagnostico}
                        </div>
                      </td>
                    </tr>
                  ) : null,
                ])}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                {(currentPage - 1) * PER_PAGE + 1}-{Math.min(currentPage * PER_PAGE, sorted.length)} de {sorted.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                  title="Primeira página"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition">
                  <ChevronsLeft size={16} />
                </button>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  title="Página anterior"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, currentPage - 2);
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${p === currentPage ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  title="Próxima página"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition">
                  <ChevronRight size={16} />
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                  title="Última página"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition">
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {shareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900">Fotos pendentes</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {fotosProvCount} {fotosProvCount === 1 ? "carro" : "carros"} · mais antigos primeiro
                </p>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 flex-1 overflow-hidden flex flex-col gap-3">
              <textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                className="flex-1 min-h-[240px] font-mono text-xs text-slate-700 border border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-[11px] text-slate-400">Edite se quiser antes de enviar.</p>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareText);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  } catch {}
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:border-slate-300 transition"
              >
                {shareCopied ? "Copiado ✓" : "Copiar"}
              </button>
              <button
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // If a vehicle is selected, show full detail page instead of list
  if (selectedVehicle) {
    return (
      <VehicleDetailPage
        vehicle={selectedVehicle}
        openaiKey={openaiKey}
        claudeKey={claudeKey}
        onBack={() => setSelectedVehicle(null)}
        onUpdate={() => { loadVehicles(); setSelectedVehicle(null); }}
      />
    );
  }

  return listView;
}

// ── Leads Page ───────────────────────────────────────────────────────────────
function LeadsPage() {
  const [leads, setLeads] = useState<LeadAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | "enviado" | "pendente" | "erro">("");

  useEffect(() => {
    getAllLeads().then(setLeads).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const crmStatus = (l: LeadAdmin): "enviado" | "pendente" | "erro" | "skipped" => {
    if (l.hypergestor_skipped) return "skipped";
    if (l.hypergestor_sent_at) return "enviado";
    if (l.hypergestor_error) return "erro";
    return "pendente";
  };

  const filtered = filter ? leads.filter((l) => crmStatus(l) === filter) : leads;
  const pendingCount = leads.filter((l) => crmStatus(l) === "pendente").length;
  const errorCount = leads.filter((l) => crmStatus(l) === "erro").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {leads.length} leads recebidos · {pendingCount} pendentes no CRM
            {errorCount > 0 ? ` · ${errorCount} com erro` : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { val: "", label: "Todos" },
          { val: "enviado", label: "Enviados" },
          { val: "pendente", label: "Pendentes" },
          { val: "erro", label: "Erros" },
        ].map((f) => (
          <button key={f.val} onClick={() => setFilter(f.val as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f.val ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={48} />} title="Nenhum lead" description="Os leads dos formularios do site aparecerão aqui." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Origem</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Interesse</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Data</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{l.nome || "Sem nome"}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {l.whatsapp && <span className="flex items-center gap-1"><Phone size={10} />{l.whatsapp}</span>}
                            {l.dados?.email ? <span className="flex items-center gap-1"><Mail size={10} />{String(l.dados.email)}</span> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{l.source}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm hidden lg:table-cell truncate max-w-[200px]">
                      {l.query || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      <div className="flex items-center gap-1"><Calendar size={12} />{fmtDate(l.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CrmBadge lead={l} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WhatsApp Page ────────────────────────────────────────────────────────────
function WhatsAppPage() {
  const [clicks, setClicks] = useState<WhatsAppClick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllWhatsAppClicks().then(setClicks).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp</h1>
        <p className="text-slate-500 text-sm mt-0.5">Log de cliques no botao WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total de cliques" value={clicks.length} icon={<MessageCircle size={20} />} color="text-emerald-600" />
        <StatCard label="Hoje" value={clicks.filter((c) => {
          if (!c.createdAt?.toDate) return false;
          return c.createdAt.toDate().toDateString() === new Date().toDateString();
        }).length} icon={<TrendingUp size={20} />} color="text-blue-600" />
        <StatCard label="Ultimos 7 dias" value={clicks.filter((c) => {
          if (!c.createdAt?.toDate) return false;
          return Date.now() - c.createdAt.toDate().getTime() < 7 * 86400000;
        }).length} icon={<Calendar size={20} />} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={24} /></div>
      ) : clicks.length === 0 ? (
        <EmptyState icon={<MessageCircle size={48} />} title="Nenhum clique registrado"
          description="Os cliques no botao WhatsApp do site aparecerão aqui." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Pagina</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clicks.slice(0, 100).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700">{c.veiculo || "Geral"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                      {c.page || c.slug || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      <div className="flex items-center gap-1"><Clock size={12} />{fmtDate(c.createdAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Blog Page ───────────────────────────────────────────────────────────────
const BLOG_CATEGORIAS: BlogCategoria[] = ["comparativo", "guia-preco", "review", "financiamento", "guia-perfil"];

const BLOG_8_TEMAS: Array<{ tema: string; categoria: BlogCategoria; keywords: string[]; filter: (v: VeiculoAdmin) => boolean }> = [
  { tema: "Melhores SUVs usados ate R$90 mil em Campinas 2026", categoria: "guia-preco", keywords: ["suv usado campinas", "suv seminovo campinas sp"],
    filter: (v) => (v.tipo || "").toLowerCase().includes("suv") && v.preco <= 90000 },
  { tema: "Tracker vs Creta vs HR-V usado — qual comprar em Campinas?", categoria: "comparativo", keywords: ["tracker usado campinas", "creta usado campinas", "hr-v usado campinas"],
    filter: (v) => /tracker|creta|hr-v|hrv/i.test(v.modelo) },
  { tema: "Vale a pena comprar Honda Civic usado em Campinas? Guia completo", categoria: "review", keywords: ["honda civic usado campinas", "civic seminovo campinas sp"],
    filter: (v) => /civic/i.test(v.modelo) },
  { tema: "Como financiar carro usado em Campinas — taxas e aprovacao em 2026", categoria: "financiamento", keywords: ["financiamento carro usado campinas", "financiar seminovo campinas"],
    filter: () => true },
  { tema: "Melhores carros usados ate R$60 mil para familia em Campinas", categoria: "guia-perfil", keywords: ["carro usado familia campinas", "seminovo ate 60 mil campinas"],
    filter: (v) => v.preco <= 60000 },
  { tema: "Sedan usado em Campinas — Corolla, Civic ou Jetta? Comparativo 2026", categoria: "comparativo", keywords: ["sedan usado campinas", "corolla usado campinas", "jetta usado campinas"],
    filter: (v) => /corolla|civic|jetta/i.test(v.modelo) },
  { tema: "Guia completo: comprar carro por consignacao em Campinas", categoria: "guia-perfil", keywords: ["consignacao carro campinas", "vender carro consignacao campinas"],
    filter: () => true },
  { tema: "Picapes usadas em Campinas — Toro, S10 e Hilux: qual escolher?", categoria: "comparativo", keywords: ["picape usada campinas", "toro usada campinas", "s10 usada campinas"],
    filter: (v) => /toro|s10|hilux|ranger|amarok|saveiro|strada/i.test(v.modelo) || /picape|pickup|caminhonete/i.test(v.tipo || "") },
];

function toVehicleInfo(v: VeiculoAdmin) {
  return { marca: v.marca, modelo: v.modelo, versao: v.versao, ano: v.ano_fabricacao, km: v.km, preco: v.preco, cambio: v.cambio, combustivel: v.combustivel, slug: v.slug, foto: v.foto_principal };
}

function BlogPage({ claudeKey, vehicles }: { claudeKey: string; vehicles: VeiculoAdmin[] }) {
  const published = useMemo(() => vehicles.filter((v) => v.status === "publicado"), [vehicles]);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState("");
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

  // Form state
  const [formTitulo, setFormTitulo] = useState("");
  const [formCategoria, setFormCategoria] = useState<BlogCategoria>("guia-perfil");
  const [formConteudo, setFormConteudo] = useState("");
  const [formMetaTitle, setFormMetaTitle] = useState("");
  const [formMetaDesc, setFormMetaDesc] = useState("");
  const [formKeywords, setFormKeywords] = useState("");
  const [formVeiculos, setFormVeiculos] = useState("");
  const [formCapa, setFormCapa] = useState("");

  const loadPosts = useCallback(async () => {
    try { setPosts(await getAllBlogPosts()); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const publishedCount = posts.filter((p) => p.status === "publicado").length;
  const draftCount = posts.filter((p) => p.status === "rascunho").length;

  const resetForm = () => {
    setFormTitulo(""); setFormCategoria("guia-perfil"); setFormConteudo("");
    setFormMetaTitle(""); setFormMetaDesc(""); setFormKeywords(""); setFormVeiculos(""); setFormCapa("");
    setEditing(null); setCreating(false);
  };

  const openEditor = (post: BlogPost) => {
    setEditing(post); setCreating(false);
    setFormTitulo(post.titulo); setFormCategoria(post.categoria);
    setFormConteudo(post.conteudo); setFormMetaTitle(post.meta_title);
    setFormMetaDesc(post.meta_description);
    setFormKeywords(post.keywords.join(", ")); setFormVeiculos(post.veiculos_relacionados.join(", ")); setFormCapa(post.capa);
  };

  const makeSlug = (title: string) =>
    title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const filterVehiclesForTema = (filter: (v: VeiculoAdmin) => boolean): VeiculoAdmin[] => {
    const matched = published.filter(filter);
    if (matched.length >= 3) return matched.slice(0, 10);
    // Fallback: return a varied sample if filter matches too few
    return published.sort(() => Math.random() - 0.5).slice(0, 10);
  };

  const handleSave = async () => {
    const keywords = formKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    const veiculos = formVeiculos.split(",").map((v) => v.trim()).filter(Boolean);
    const slug = editing ? editing.slug : makeSlug(formTitulo);

    const data = {
      slug, titulo: formTitulo, capa: formCapa, categoria: formCategoria,
      conteudo: formConteudo, meta_title: formMetaTitle,
      meta_description: formMetaDesc, keywords, veiculos_relacionados: veiculos,
    };

    if (editing) {
      await updateBlogPost(slug, data);
    } else {
      await createBlogPost(data);
    }
    resetForm(); loadPosts();
  };

  const handleGenerate = async () => {
    if (!claudeKey) { setGenResult("Configure a chave Claude nas configuracoes primeiro"); return; }
    setGenerating(true); setGenResult("");
    try {
      // Pick a varied sample of published vehicles for context
      const sample = published.sort(() => Math.random() - 0.5).slice(0, 15).map(toVehicleInfo);

      const result = await generateBlogPost(claudeKey, {
        categoria: "",
        tema: formTitulo || "",
        veiculos: sample,
        keywords: formKeywords ? formKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        titulosExistentes: posts.map((p) => p.titulo),
      });

      setFormTitulo(result.titulo);
      setFormCapa(result.capa);
      setFormCategoria((result.categoria || "guia-perfil") as BlogCategoria);
      setFormConteudo(result.conteudo);
      setFormMetaTitle(result.meta_title);
      setFormMetaDesc(result.meta_description);
      setFormKeywords(result.keywords.join(", "));
      setFormVeiculos(result.veiculos_slugs.join(", "));
      setGenResult("Artigo gerado com sucesso");
    } catch (err: any) { setGenResult(`Erro: ${err.message}`); }
    setGenerating(false);
  };

  const handleGenerate8 = async () => {
    console.log("[BLOG] handleGenerate8 called, claudeKey:", claudeKey ? "set" : "empty", "published vehicles:", published.length);
    if (!claudeKey) { setBatchProgress("Configure a chave Claude nas configuracoes primeiro"); return; }
    setBatchGenerating(true); setBatchProgress("");
    let created = 0;
    for (let i = 0; i < BLOG_8_TEMAS.length; i++) {
      const t = BLOG_8_TEMAS[i];
      setBatchProgress(`Gerando artigo ${i + 1}/${BLOG_8_TEMAS.length}: ${t.tema.slice(0, 50)}...`);
      try {
        const relevantVehicles = filterVehiclesForTema(t.filter).map(toVehicleInfo);
        console.log(`[BLOG] Artigo ${i + 1}: ${t.tema.slice(0, 40)}, ${relevantVehicles.length} veiculos`);
        const existingTitles = [...posts.map((p) => p.titulo), ...Array.from({ length: created }, (_, j) => BLOG_8_TEMAS[j]?.tema || "")];
        const result = await generateBlogPost(claudeKey, {
          categoria: t.categoria, tema: t.tema, veiculos: relevantVehicles, keywords: t.keywords,
          titulosExistentes: existingTitles,
        });
        console.log(`[BLOG] Artigo ${i + 1} gerado:`, result.titulo);
        const slug = makeSlug(result.titulo);
        await createBlogPost({
          slug, titulo: result.titulo, capa: result.capa, categoria: (result.categoria || t.categoria) as BlogCategoria,
          conteudo: result.conteudo, meta_title: result.meta_title,
          meta_description: result.meta_description, keywords: result.keywords,
          veiculos_relacionados: result.veiculos_slugs,
        });
        console.log(`[BLOG] Artigo ${i + 1} salvo: ${slug}`);
        created++;
      } catch (err: any) {
        console.error(`[BLOG] Erro no artigo ${i + 1}:`, err);
        setBatchProgress(`Erro no artigo ${i + 1}: ${err.message}`);
      }
      if (i < BLOG_8_TEMAS.length - 1) await new Promise((r) => setTimeout(r, 2000));
    }
    setBatchProgress(`Concluido: ${created} artigos gerados como rascunho`);
    setBatchGenerating(false);
    loadPosts();
  };

  const handlePublish = async (slug: string, currentStatus: string) => {
    if (currentStatus === "publicado") await unpublishBlogPost(slug);
    else await publishBlogPost(slug);
    loadPosts();
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size={24} /></div>;

  // Editor view
  if (creating || editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{editing ? "Editar Artigo" : "Novo Artigo"}</h1>
          <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="max-w-4xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Titulo</label>
              <input value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Titulo do artigo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Categoria</label>
              <select value={formCategoria} onChange={(e) => setFormCategoria(e.target.value as BlogCategoria)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-blue-500">
                {BLOG_CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Keywords (separadas por virgula)</label>
            <input value={formKeywords} onChange={(e) => setFormKeywords(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="suv usado campinas, tracker usado" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Conteudo (markdown)</label>
            <textarea value={formConteudo} onChange={(e) => setFormConteudo(e.target.value)} rows={20}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono" placeholder="Conteudo do artigo em markdown..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Meta Title</label>
              <input value={formMetaTitle} onChange={(e) => setFormMetaTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Title tag (max 60 chars)" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Meta Description</label>
              <input value={formMetaDesc} onChange={(e) => setFormMetaDesc(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Description (max 155 chars)" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Imagem de capa (URL) — 1200 x 675 px (16:9), max 500 KB</label>
            <div className="flex gap-2 items-center">
              <input value={formCapa} onChange={(e) => setFormCapa(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="https://..." />
              {formCapa && <img src={formCapa} alt="capa" className="w-20 h-14 object-cover rounded-lg border" />}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Veículos relacionados (slugs, separados por vírgula)</label>
            <input value={formVeiculos} onChange={(e) => setFormVeiculos(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="comprar-honda-civic-..., comprar-toyota-corolla-..." />
          </div>
          {genResult && (
            <p className={`text-sm ${genResult.startsWith("Erro") ? "text-red-600" : "text-emerald-600"}`}>{genResult}</p>
          )}
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={generating}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
              {generating ? <Spinner size={14} /> : <Sparkles size={14} />}
              {generating ? "Gerando..." : "Gerar com IA"}
            </button>
            <button onClick={handleSave}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
              <Save size={14} /> {editing ? "Atualizar" : "Salvar rascunho"}
            </button>
            {editing && (
              <button onClick={() => { handlePublish(editing.slug, editing.status); resetForm(); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                <Eye size={14} /> {editing.status === "publicado" ? "Despublicar" : "Publicar"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-slate-500 text-sm mt-0.5">{posts.length} artigos ({publishedCount} publicados, {draftCount} rascunhos)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { resetForm(); setCreating(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
            <Plus size={14} /> Novo Artigo
          </button>
          <button onClick={handleGenerate8} disabled={batchGenerating || !claudeKey}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
            {batchGenerating ? <Spinner size={14} /> : <Sparkles size={14} />}
            {batchGenerating ? "Gerando..." : "Gerar 8 Artigos SEO"}
          </button>
        </div>
      </div>

      {batchProgress && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border ${
          batchProgress.startsWith("Erro") ? "bg-red-50 text-red-700 border-red-200"
          : batchProgress.startsWith("Concluido") ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-blue-50 text-blue-700 border-blue-200"
        }`}>
          {batchProgress.startsWith("Erro") ? <AlertCircle size={14} /> :
           batchProgress.startsWith("Concluido") ? <CheckCircle2 size={14} /> :
           <Spinner size={14} />}
          {batchProgress}
        </div>
      )}

      {posts.length === 0 && !batchProgress ? (
        <EmptyState icon={<BookOpen size={48} />} title="Nenhum artigo" description='Clique em "Novo Artigo" para criar o primeiro.' />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Titulo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Categoria</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.slug} className="hover:bg-slate-50 cursor-pointer" onClick={() => openEditor(post)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-md">{post.titulo}</p>
                    <p className="text-slate-400 text-xs truncate">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{post.categoria}</td>
                  <td className="px-4 py-3 text-center"><Badge status={post.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handlePublish(post.slug, post.status); }}
                      className="text-slate-400 hover:text-slate-600 p-1" title={post.status === "publicado" ? "Despublicar" : "Publicar"}>
                      {post.status === "publicado" ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Config Page ──────────────────────────────────────────────────────────────
// ── Tags Config Card ────────────────────────────────────────────────────────
// Editor visual das tags do estoque (Destaque, Oferta, etc). Cada tag tem
// label, cor de fundo (sólida ou gradiente vertical) e cor do texto. Preview
// ao vivo mostra exatamente como o badge vai aparecer no card do veículo.

const TAG_PRESETS: Array<{ label: string; bgFrom: string; bgTo: string; textColor: string }> = [
  { label: "Amarelo brilho",  bgFrom: "#FCD34D", bgTo: "#F59E0B", textColor: "#0B1B3F" },
  { label: "Vermelho fogo",    bgFrom: "#EF4444", bgTo: "#B91C1C", textColor: "#FFFFFF" },
  { label: "Verde sucesso",    bgFrom: "#34D399", bgTo: "#059669", textColor: "#FFFFFF" },
  { label: "Azul Átria",       bgFrom: "#3B82F6", bgTo: "#1E3A8A", textColor: "#FFFFFF" },
  { label: "Roxo premium",     bgFrom: "#A78BFA", bgTo: "#6D28D9", textColor: "#FFFFFF" },
  { label: "Rosa novidade",    bgFrom: "#F472B6", bgTo: "#BE185D", textColor: "#FFFFFF" },
  { label: "Cinza neutro",     bgFrom: "#E5E7EB", bgTo: "",         textColor: "#1F2937" },
  { label: "Preto sólido",     bgFrom: "#0F172A", bgTo: "",         textColor: "#FFFFFF" },
];

function TagsConfigCard() {
  const [list, setList] = useState<TagConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getAllTagConfigs()
      .then((l) => { setList(l); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const update = (idx: number, patch: Partial<TagConfig>) => {
    setList((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
    setDirty(true);
  };

  const remove = (idx: number) => {
    if (!window.confirm(`Remover a tag "${list[idx].nome}"? Veículos com essa tag deixarão de exibir o badge.`)) return;
    setList((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const add = () => {
    const nome = window.prompt('Nome da tag (lowercase, sem espaços. Ex: "novo", "imperdivel"):')?.trim().toLowerCase() || "";
    if (!nome) return;
    if (list.some((t) => t.nome === nome)) {
      window.alert("Já existe uma tag com esse nome.");
      return;
    }
    setList((prev) => [...prev, {
      nome,
      label: nome.charAt(0).toUpperCase() + nome.slice(1),
      bgFrom: "#3B82F6",
      bgTo: "#1E3A8A",
      textColor: "#FFFFFF",
      uppercase: true,
    }]);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = list
        .map((t) => ({ ...t, nome: t.nome.trim().toLowerCase(), label: t.label.trim() || t.nome }))
        .filter((t) => t.nome);
      await saveTagConfigs(clean);
      invalidateTagConfigs(clean);
      setList(clean);
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[Tags] erro ao salvar:", err);
      window.alert("Erro ao salvar tags. Veja o console.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
          <Tag size={18} className="text-pink-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">Tags do estoque</h3>
          <p className="text-slate-500 text-xs">Badges exibidos no card do veículo (Home, Estoque e Ficha)</p>
        </div>
        <button onClick={add} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
          <Plus size={14} /> Nova tag
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Carregando tags...</div>
      ) : list.length === 0 ? (
        <div className="text-slate-400 text-sm italic">Nenhuma tag cadastrada. Clique em "Nova tag" pra começar.</div>
      ) : (
        <div className="space-y-4">
          {list.map((t, idx) => (
            <div key={t.nome + idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              {/* Header: nome (read-only) + preview + delete */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <code className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                  {t.nome}
                </code>
                <div className="flex-1 flex justify-center">
                  <span
                    className={`inline-block font-inter font-bold ${t.uppercase ? "uppercase tracking-wide" : ""} rounded text-xs px-2.5 py-1`}
                    style={tagStyle(t)}
                  >
                    {t.label || t.nome}
                  </span>
                </div>
                <button onClick={() => remove(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition" title="Remover tag">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Editores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-600 text-xs font-medium block mb-1">Texto</label>
                  <input
                    type="text"
                    value={t.label}
                    onChange={(e) => update(idx, { label: e.target.value })}
                    className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-medium block mb-1">Cor topo</label>
                  <ColorPicker value={t.bgFrom} onChange={(v) => update(idx, { bgFrom: v })} />
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-medium block mb-1">
                    Cor base <span className="text-slate-400">(vazio = sólido)</span>
                  </label>
                  <ColorPicker value={t.bgTo} onChange={(v) => update(idx, { bgTo: v })} allowEmpty />
                </div>
                <div>
                  <label className="text-slate-600 text-xs font-medium block mb-1">Texto</label>
                  <ColorPicker value={t.textColor} onChange={(v) => update(idx, { textColor: v })} />
                </div>
              </div>

              {/* Toggle uppercase + presets */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <label className="flex items-center gap-1.5 text-xs text-slate-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.uppercase}
                    onChange={(e) => update(idx, { uppercase: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  UPPERCASE
                </label>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1">Presets:</span>
                  {TAG_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => update(idx, { bgFrom: p.bgFrom, bgTo: p.bgTo, textColor: p.textColor })}
                      title={p.label}
                      className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition shadow-sm"
                      style={{
                        backgroundImage: p.bgTo
                          ? `linear-gradient(to bottom, ${p.bgFrom}, ${p.bgTo})`
                          : "none",
                        backgroundColor: p.bgTo ? undefined : p.bgFrom,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          {saving ? <Spinner size={14} /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar tags"}
        </button>
        {dirty && !saved && <span className="text-xs text-amber-600">Alterações não salvas</span>}
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange, allowEmpty = false }: { value: string; onChange: (v: string) => void; allowEmpty?: boolean }) {
  const safe = value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : (allowEmpty ? "" : "#000000");
  return (
    <div className="flex gap-1.5">
      <input
        type="color"
        value={safe || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={allowEmpty ? "(vazio)" : "#RRGGBB"}
        className="flex-1 min-w-0 border border-slate-200 rounded-md px-2 py-1.5 text-xs font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
      />
      {allowEmpty && value && (
        <button onClick={() => onChange("")} className="text-slate-400 hover:text-slate-600 px-1 text-xs" title="Limpar (cor sólida)">
          ×
        </button>
      )}
    </div>
  );
}

function ConfigPage({ openaiKey, setOpenaiKey, claudeKey, setClaudeKey, milestoneConfig, setMilestoneConfig }: {
  openaiKey: string; setOpenaiKey: (k: string) => void;
  claudeKey: string; setClaudeKey: (k: string) => void;
  milestoneConfig: MilestoneConfig; setMilestoneConfig: (c: MilestoneConfig) => void;
}) {
  const [keyInput, setKeyInput] = useState("");
  const [claudeInput, setClaudeInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingClaude, setSavingClaude] = useState(false);
  const [savedClaude, setSavedClaude] = useState(false);
  const [milestoneDias, setMilestoneDias] = useState(milestoneConfig.dias.join(", "));
  const [savingMs, setSavingMs] = useState(false);
  const [savedMs, setSavedMs] = useState(false);
  const [highlightsPadrao, setHighlightsPadrao] = useState("");
  const [disclaimerPadrao, setDisclaimerPadrao] = useState("");
  const [savingGlobais, setSavingGlobais] = useState(false);
  const [savedGlobais, setSavedGlobais] = useState(false);

  useEffect(() => {
    getAdminConfig()
      .then((c) => {
        setHighlightsPadrao((c.highlights_padrao || []).join("\n"));
        setDisclaimerPadrao(c.disclaimer_padrao || "");
      })
      .catch(() => {});
  }, []);

  const handleSaveGlobais = async () => {
    setSavingGlobais(true);
    try {
      const arr = highlightsPadrao.split("\n").map((s) => s.trim()).filter(Boolean);
      await saveAdminConfig({
        highlights_padrao: arr,
        disclaimer_padrao: disclaimerPadrao.trim(),
      });
      setSavedGlobais(true);
      setTimeout(() => setSavedGlobais(false), 3000);
    } catch { /* ignore */ }
    setSavingGlobais(false);
  };
  const [crmChecking, setCrmChecking] = useState(true);
  const [crmOk, setCrmOk] = useState<boolean | null>(null);
  const [crmDetail, setCrmDetail] = useState("");

  const checkCrm = useCallback(async () => {
    setCrmChecking(true);
    try {
      const r = await testHypergestor();
      setCrmOk(r.ok);
      setCrmDetail(r.ok ? `HTTP ${r.status}` : `HTTP ${r.status} — ${r.error || r.body || "sem resposta"}`);
    } catch (err: any) {
      setCrmOk(false);
      setCrmDetail(err?.message || String(err));
    }
    setCrmChecking(false);
  }, []);

  useEffect(() => { checkCrm(); }, [checkCrm]);

  // Backfill: reenviar leads pendentes pro Hypergestor
  const [pendingLeads, setPendingLeads] = useState<LeadAdmin[] | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillProgress, setBackfillProgress] = useState({ done: 0, total: 0, ok: 0, fail: 0 });

  const loadPending = useCallback(async () => {
    try {
      const all = await getAllLeads();
      setPendingLeads(all.filter((l) => !l.hypergestor_sent_at && !l.hypergestor_error && !l.hypergestor_skipped));
    } catch { setPendingLeads([]); }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleBackfill = async () => {
    if (!pendingLeads || pendingLeads.length === 0) return;
    if (!window.confirm(`Reenviar ${pendingLeads.length} leads pendentes pro Hypergestor? (vai rodar um por vez com pausa de 500ms — não feche a página)`)) return;
    setBackfilling(true);
    setBackfillProgress({ done: 0, total: pendingLeads.length, ok: 0, fail: 0 });
    let ok = 0, fail = 0;
    for (let i = 0; i < pendingLeads.length; i++) {
      const l = pendingLeads[i];
      try {
        const res = await fetch("/api/hypergestor-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: l.id,
            lead: {
              nome: l.nome,
              whatsapp: l.whatsapp,
              source: l.source,
              query: l.query,
              dados: l.dados,
            },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.ok) ok++; else fail++;
      } catch { fail++; }
      setBackfillProgress({ done: i + 1, total: pendingLeads.length, ok, fail });
      if (i < pendingLeads.length - 1) await new Promise((r) => setTimeout(r, 500));
    }
    setBackfilling(false);
    await loadPending();
  };

  const handleSaveMilestones = async () => {
    setSavingMs(true);
    const dias = milestoneDias.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n > 0).sort((a, b) => a - b);
    await saveMilestoneConfig({ dias });
    setMilestoneConfig({ dias });
    setSavedMs(true);
    setTimeout(() => setSavedMs(false), 3000);
    setSavingMs(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminConfig({ openai_key: keyInput || openaiKey });
      setOpenaiKey(keyInput || openaiKey);
      setKeyInput("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuracoes</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gerencie as configuracoes do painel</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* OpenAI */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">OpenAI API</h3>
              <p className="text-slate-500 text-xs">Chave para geracao automatica de descricoes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="password" placeholder={openaiKey ? "****" + openaiKey.slice(-4) : "sk-..."}
              value={keyInput} onChange={(e) => setKeyInput(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10" />
            <button onClick={handleSave} disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
              {saving ? <Spinner size={14} /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
            </button>
          </div>
          {openaiKey && (
            <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Chave configurada (****{openaiKey.slice(-4)})
            </p>
          )}
        </div>

        {/* Claude API */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Claude API (Blog)</h3>
              <p className="text-slate-500 text-xs">Chave Anthropic para geracao de artigos do blog</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="password" placeholder={claudeKey ? "****" + claudeKey.slice(-4) : "sk-ant-..."}
              value={claudeInput} onChange={(e) => setClaudeInput(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10" />
            <button onClick={async () => {
              setSavingClaude(true);
              try {
                await saveAdminConfig({ claude_key: claudeInput || claudeKey });
                setClaudeKey(claudeInput || claudeKey);
                setClaudeInput("");
                setSavedClaude(true);
                setTimeout(() => setSavedClaude(false), 3000);
              } catch { /* ignore */ }
              setSavingClaude(false);
            }} disabled={savingClaude}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
              {savingClaude ? <Spinner size={14} /> : savedClaude ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {savingClaude ? "Salvando..." : savedClaude ? "Salvo!" : "Salvar"}
            </button>
          </div>
          {claudeKey && (
            <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Chave configurada (****{claudeKey.slice(-4)})
            </p>
          )}
        </div>

        {/* Textos padrão da ficha (aplicados em TODOS os veículos) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Textos padrão da ficha</h3>
              <p className="text-slate-500 text-xs">Highlights e disclaimer aplicados em todos os veículos automaticamente</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-slate-600 text-xs font-medium block mb-1.5">
                Highlights (um por linha)
              </label>
              <textarea value={highlightsPadrao} onChange={(e) => setHighlightsPadrao(e.target.value)} rows={4}
                placeholder={"Valores para pagamento à vista ou financiamento sem troca\nAceitamos seu usado na troca"}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 resize-y text-slate-700" />
              {highlightsPadrao.trim() && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {highlightsPadrao.split("\n").map((s) => s.trim()).filter(Boolean).map((h, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full border border-emerald-200">{h}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-slate-600 text-xs font-medium block mb-1.5">
                Disclaimer
              </label>
              <textarea value={disclaimerPadrao} onChange={(e) => setDisclaimerPadrao(e.target.value)} rows={3}
                placeholder="Em caso de divergência de informações, entre em contato pelo WhatsApp para confirmar."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 resize-y text-slate-700" />
            </div>
            <button onClick={handleSaveGlobais} disabled={savingGlobais}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
              {savingGlobais ? <Spinner size={14} /> : savedGlobais ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {savingGlobais ? "Salvando..." : savedGlobais ? "Salvo!" : "Salvar textos padrão"}
            </button>
          </div>
        </div>

        {/* Tags do estoque */}
        <TagsConfigCard />

        {/* Sync settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <RefreshCw size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Sincronizacao AutoConf</h3>
              <p className="text-slate-500 text-xs">Integrador de estoque de veiculos</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">API</span>
              <span className="text-slate-700 font-medium">api.autoconf.com.br</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Conectado</span>
            </div>
          </div>
        </div>

        {/* Store info */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ExternalLink size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Dados da loja</h3>
              <p className="text-slate-500 text-xs">Informacoes exibidas no site</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Empresa</span>
              <span className="text-slate-700 font-medium">Átria Veículos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cidade</span>
              <span className="text-slate-700 font-medium">Campinas - SP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">WhatsApp</span>
              <span className="text-slate-700 font-medium">(19) 99652-5211</span>
            </div>
          </div>
        </div>
        {/* Milestones */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Marcos de Revisão</h3>
              <p className="text-slate-500 text-xs">Dias de publicação que disparam alertas de revisão no estoque</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input type="text" value={milestoneDias} onChange={(e) => setMilestoneDias(e.target.value)}
              placeholder="7, 20, 40, 60"
              className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10" />
            <button onClick={handleSaveMilestones} disabled={savingMs}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
              {savingMs ? <Spinner size={14} /> : savedMs ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {savingMs ? "Salvando..." : savedMs ? "Salvo!" : "Salvar"}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {milestoneConfig.dias.map((d) => (
              <span key={d} className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium px-2.5 py-1 rounded-full">
                {d} dias
              </span>
            ))}
          </div>
        </div>
        {/* Hypergestor (CRM) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Integração Hypergestor (CRM)</h3>
              <p className="text-slate-500 text-xs">Leads do site são enviados automaticamente pro CRM</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">API</span>
              <span className="text-slate-700 font-medium">api.autopop360.com</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500">Status</span>
              {crmChecking ? (
                <span className="text-slate-500 font-medium flex items-center gap-1"><Spinner size={12} /> Verificando...</span>
              ) : crmOk ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1" title={crmDetail}>
                  <CheckCircle2 size={12} /> Conectado
                </span>
              ) : (
                <span className="text-red-600 font-medium flex items-center gap-1" title={crmDetail}>
                  <X size={12} /> Desconectado
                </span>
              )}
            </div>
            <div className="flex justify-between text-sm items-center pt-1">
              <span className="text-slate-400 text-xs">Cria um lead "TESTE API" no CRM — pode deletar lá</span>
              <button
                onClick={checkCrm}
                disabled={crmChecking}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1 transition"
              >
                <RefreshCw size={12} className={crmChecking ? "animate-spin" : ""} />
                {crmChecking ? "Testando..." : "Testar agora"}
              </button>
            </div>
            {!crmChecking && !crmOk && crmDetail && (
              <p className="text-xs text-red-600 mt-1 break-all">{crmDetail}</p>
            )}
          </div>

          {/* Backfill dos leads pendentes */}
          {pendingLeads !== null && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-700 font-medium">
                  {pendingLeads.length === 0
                    ? "Nenhum lead pendente"
                    : `${pendingLeads.length} lead${pendingLeads.length === 1 ? "" : "s"} pendente${pendingLeads.length === 1 ? "" : "s"} de envio`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {backfilling
                    ? `Enviando ${backfillProgress.done}/${backfillProgress.total} · ${backfillProgress.ok} ok, ${backfillProgress.fail} erro`
                    : "Reenvia em lote os leads que ainda não chegaram no Hypergestor"}
                </p>
              </div>
              <button
                onClick={handleBackfill}
                disabled={backfilling || !crmOk || pendingLeads.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shrink-0"
              >
                {backfilling ? <Spinner size={14} /> : <RefreshCw size={14} />}
                {backfilling ? `${backfillProgress.done}/${backfillProgress.total}` : "Reenviar"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Dashboard (Main Layout) ─────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  // Diagnóstico: loga o build timestamp no console toda vez que o Admin monta.
  // Serve pra detectar quando um cliente está carregando bundle antigo de cache.
  useEffect(() => {
    console.log("%c[admin] Build:", "color: #22d3ee; font-weight: bold", __BUILD_TIMESTAMP__);
  }, []);

  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vehicles, setVehicles] = useState<VeiculoAdmin[]>([]);
  const [leads, setLeads] = useState<LeadAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [analytics, setAnalytics] = useState<Map<string, VehicleAnalytics>>(new Map());
  const [dailyHistory, setDailyHistory] = useState<Map<string, DailyRecord[]>>(new Map());
  const [milestoneConfig, setMilestoneConfig] = useState<MilestoneConfig>({ dias: [7, 20, 40, 60] });

  const loadVehicles = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getAllAdminVeiculos();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar veiculos");
      setVehicles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  useEffect(() => {
    getAllLeads().then(setLeads).catch(() => {});
  }, []);

  useEffect(() => {
    getAdminConfig().then((c) => { setOpenaiKey(c.openai_key || ""); setClaudeKey(c.claude_key || ""); }).catch(() => {});
    getAllVehicleAnalytics().then(setAnalytics).catch(() => {});
    getMilestoneConfig().then(setMilestoneConfig).catch(() => {});
  }, []);

  // Fetch daily history when vehicles are loaded
  useEffect(() => {
    if (!vehicles.length) return;
    const slugs = vehicles.map((v) => v.slug).filter(Boolean);
    if (!slugs.length) return;
    getAllVehicleDailyHistory(slugs, 14).then(setDailyHistory).catch(() => {});
  }, [vehicles]);

  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className={`transition-all duration-200 ${sidebarCollapsed ? "ml-16" : "ml-56"}`}>
        <div className="px-6 py-8">
          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {loading && page !== "leads" && page !== "whatsapp" ? (
            <div className="flex items-center justify-center py-32">
              <Spinner size={28} />
            </div>
          ) : (
            <>
              {page === "dashboard" && <DashboardPage vehicles={vehicles} leads={leads} />}
              {page === "estoque" && <EstoquePage vehicles={vehicles} loadVehicles={loadVehicles} openaiKey={openaiKey} claudeKey={claudeKey} analytics={analytics} dailyHistory={dailyHistory} milestoneConfig={milestoneConfig} />}
              {page === "leads" && <LeadsPage />}
              {page === "whatsapp" && <WhatsAppPage />}
              {page === "blog" && <BlogPage claudeKey={claudeKey} vehicles={vehicles} />}
              {page === "config" && <ConfigPage openaiKey={openaiKey} setOpenaiKey={setOpenaiKey} claudeKey={claudeKey} setClaudeKey={setClaudeKey} milestoneConfig={milestoneConfig} setMilestoneConfig={setMilestoneConfig} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  return <Dashboard onLogout={() => {}} />;
}
