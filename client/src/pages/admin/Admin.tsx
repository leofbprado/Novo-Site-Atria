import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Car, Users, MessageCircle, Settings, LogOut,
  RefreshCw, CheckCircle2, Upload, Search, Filter, ChevronLeft,
  ChevronRight, Eye, EyeOff, Sparkles, X, Tag, Save, ExternalLink,
  Phone, Mail, Calendar, Clock, TrendingUp, AlertCircle, Menu,
} from "lucide-react";
import {
  adminLogin,
  fetchAutoConfVeiculos,
  fetchAutoConfVeiculo,
  generateDescription,
  type AutoConfVeiculo,
} from "./api";
import {
  getAllAdminVeiculos,
  upsertVeiculoFromAutoConf,
  updateVeiculoTags,
  updateVeiculoDescricao,
  publishVeiculo,
  unpublishVeiculo,
  getAdminConfig,
  saveAdminConfig,
  getAllLeads,
  updateLeadStatus,
  getAllWhatsAppClicks,
  type VeiculoAdmin,
  type LeadAdmin,
  type WhatsAppClick,
} from "@/lib/adminFirestore";

// ── Constants ────────────────────────────────────────────────────────────────
const LOGO_BRANCO = "https://i.postimg.cc/25m34dvJ/Logo_%C3%81tria_Branco.png";
const PRESET_TAGS = ["destaque", "oferta", "seminovo premium", "reservado", "vendido"];
const TAG_COLORS: Record<string, string> = {
  destaque: "bg-amber-100 text-amber-800 border-amber-200",
  oferta: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "seminovo premium": "bg-violet-100 text-violet-800 border-violet-200",
  reservado: "bg-orange-100 text-orange-800 border-orange-200",
  vendido: "bg-red-100 text-red-800 border-red-200",
};
const DEFAULT_TAG_COLOR = "bg-sky-100 text-sky-800 border-sky-200";

type Page = "dashboard" | "estoque" | "leads" | "whatsapp" | "config";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtKm = (v: number) => v.toLocaleString("pt-BR") + " km";
const fmtDate = (ts: { toDate?: () => Date } | null) => {
  if (!ts || !ts.toDate) return "-";
  const d = ts.toDate();
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

// ── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (adminLogin(user, pass)) {
      sessionStorage.setItem("admin_auth", "1");
      onLogin();
    } else {
      setError("Usuario ou senha invalidos");
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
          <img src={LOGO_BRANCO} alt="Atria Veiculos" className="h-12 object-contain" />
        </div>
        <h1 className="text-lg font-semibold text-white mb-0.5 text-center">Painel Administrativo</h1>
        <p className="text-slate-500 text-sm text-center mb-8">Acesso restrito</p>

        <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1.5 font-medium">Usuario</label>
        <input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin"
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

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all text-sm">
          Entrar
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
  const label = status === "publicado" ? "Publicado" : status === "rascunho" ? "Rascunho" : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {label}
    </span>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return <RefreshCw size={size} className="animate-spin" />;
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

// ── Vehicle Modal ────────────────────────────────────────────────────────────
function VehicleModal({
  vehicle, openaiKey, onClose, onUpdate,
}: {
  vehicle: VeiculoAdmin; openaiKey: string; onClose: () => void; onUpdate: () => void;
}) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tags, setTags] = useState<string[]>(vehicle.tags || []);
  const [newTag, setNewTag] = useState("");
  const [descricao, setDescricao] = useState(vehicle.descricao_ia || "");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleAddTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      const updated = [...tags, t];
      setTags(updated);
      updateVeiculoTags(vehicle.autoconf_id, updated);
    }
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    updateVeiculoTags(vehicle.autoconf_id, updated);
  };

  const handleGenerateAI = async () => {
    if (!openaiKey) { setAiError("Configure a chave OpenAI nas configuracoes primeiro"); return; }
    setGenerating(true); setAiError("");
    try {
      const text = await generateDescription(openaiKey, {
        marca: vehicle.marca, modelo: vehicle.modelo, versao: vehicle.versao,
        ano_fabricacao: vehicle.ano_fabricacao, ano_modelo: vehicle.ano_modelo,
        km: vehicle.km, cor: vehicle.cor, cambio: vehicle.cambio,
        combustivel: vehicle.combustivel, acessorios: vehicle.acessorios || [],
      });
      setDescricao(text);
    } catch (err: any) { setAiError(err.message || "Erro ao gerar descricao"); }
    setGenerating(false);
  };

  const handleSaveDescricao = async () => {
    setSaving(true);
    await updateVeiculoDescricao(vehicle.autoconf_id, descricao);
    setSaving(false); onUpdate();
  };

  const handlePublish = async () => {
    setPublishing(true);
    if (vehicle.status === "publicado") await unpublishVeiculo(vehicle.autoconf_id);
    else await publishVeiculo(vehicle.autoconf_id);
    setPublishing(false); onUpdate(); onClose();
  };

  const fotos = vehicle.fotos?.length ? vehicle.fotos : vehicle.foto_principal ? [vehicle.foto_principal] : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-[5vh] overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{vehicle.marca} {vehicle.modelo}</h2>
            <p className="text-slate-500 text-sm">{vehicle.versao}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={vehicle.status} />
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Left: Photos */}
          <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
            {fotos.length > 0 && (
              <div className="space-y-3">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
                  <img src={fotos[photoIdx]} alt="" className="w-full h-full object-cover" />
                  {fotos.length > 1 && (
                    <>
                      <button onClick={() => setPhotoIdx((p) => (p - 1 + fotos.length) % fotos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => setPhotoIdx((p) => (p + 1) % fotos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center">
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {photoIdx + 1}/{fotos.length}
                  </span>
                </div>
                {fotos.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {fotos.map((f, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)}
                        className={`flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition ${i === photoIdx ? "border-blue-500" : "border-transparent opacity-50 hover:opacity-80"}`}>
                        <img src={f} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {[
                ["Ano", `${vehicle.ano_fabricacao}/${vehicle.ano_modelo}`],
                ["KM", fmtKm(vehicle.km)],
                ["Cambio", vehicle.cambio],
                ["Combustivel", vehicle.combustivel],
              ].map(([l, v]) => (
                <div key={String(l)} className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">{l}</p>
                  <p className="text-slate-800 text-sm font-medium">{String(v)}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-2xl font-bold text-slate-900">{fmt(vehicle.preco)}</p>
              <p className="text-slate-400 text-xs">ID: {vehicle.autoconf_id}</p>
            </div>
          </div>

          {/* Right: Tags + Description + Actions */}
          <div className="lg:col-span-2 p-6 space-y-5">
            {/* Tags */}
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-wider font-medium block mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {tags.map((tag) => <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />)}
                {tags.length === 0 && <span className="text-slate-400 text-xs">Nenhuma tag</span>}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {PRESET_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                  <button key={tag} onClick={() => handleAddTag(tag)}
                    className="px-2 py-0.5 rounded-full text-[11px] border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition">
                    + {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag(newTag))}
                  placeholder="Tag customizada..."
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10" />
                <button onClick={() => handleAddTag(newTag)} disabled={!newTag.trim()}
                  className="bg-slate-100 hover:bg-slate-200 disabled:opacity-30 px-3 py-1.5 rounded-lg text-xs text-slate-700 transition font-medium">
                  <Tag size={12} />
                </button>
              </div>
            </div>

            {/* AI Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-500 text-xs uppercase tracking-wider font-medium">Descricao</label>
                <button onClick={handleGenerateAI} disabled={generating}
                  className="text-violet-600 hover:text-violet-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1 transition">
                  {generating ? <><Spinner size={12} /> Gerando...</> : <><Sparkles size={12} /> Gerar com IA</>}
                </button>
              </div>
              {aiError && <p className="text-red-500 text-xs mb-1.5 flex items-center gap-1"><AlertCircle size={11} /> {aiError}</p>}
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4}
                placeholder="Descricao do veiculo..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 resize-y text-slate-700" />
              <button onClick={handleSaveDescricao} disabled={saving}
                className="mt-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5">
                {saving ? <Spinner size={12} /> : <Save size={12} />}
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>

            {/* Accessories */}
            {vehicle.acessorios && vehicle.acessorios.length > 0 && (
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-wider font-medium block mb-2">
                  Acessorios ({vehicle.acessorios.length})
                </label>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                  {vehicle.acessorios.map((a) => (
                    <span key={a} className="bg-slate-50 text-slate-600 text-[11px] px-2 py-0.5 rounded-full border border-slate-100">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Publish action */}
            <button onClick={handlePublish} disabled={publishing}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                vehicle.status === "publicado"
                  ? "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              } disabled:opacity-50`}>
              {publishing ? <Spinner size={14} /> : vehicle.status === "publicado" ? <EyeOff size={14} /> : <Eye size={14} />}
              {publishing ? "Processando..." : vehicle.status === "publicado" ? "Despublicar" : "Publicar no site"}
            </button>
          </div>
        </div>
      </motion.div>
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
    { id: "config", icon: <Settings size={20} />, label: "Configuracoes" },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-30 flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
        {!collapsed && <img src={LOGO_BRANCO} alt="Atria" className="h-7 object-contain" />}
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
      <div className="px-2 pb-4">
        <button onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sair" : undefined}>
          <LogOut size={18} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ vehicles, leads }: { vehicles: VeiculoAdmin[]; leads: LeadAdmin[] }) {
  const published = vehicles.filter((v) => v.status === "publicado").length;
  const drafts = vehicles.filter((v) => v.status === "rascunho").length;
  const newLeads = leads.filter((l) => !l.status || l.status === "novo").length;

  const totalValue = vehicles.reduce((sum, v) => sum + v.preco, 0);

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
        <StatCard label="Leads novos" value={newLeads} icon={<Users size={20} />} color="text-blue-600" />
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
                  <Badge status={l.status || "novo"} />
                </div>
              ))}
            </div>
          )}
        </div>
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
function EstoquePage({ vehicles, loadVehicles, openaiKey }: {
  vehicles: VeiculoAdmin[]; loadVehicles: () => void; openaiKey: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "rascunho" | "publicado">("");
  const [selectedVehicle, setSelectedVehicle] = useState<VeiculoAdmin | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [importingAll, setImportingAll] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (statusFilter && v.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return v.marca.toLowerCase().includes(s) || v.modelo.toLowerCase().includes(s) || v.versao.toLowerCase().includes(s);
    });
  }, [vehicles, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const publishedCount = vehicles.filter((v) => v.status === "publicado").length;
  const draftCount = vehicles.filter((v) => v.status === "rascunho").length;

  const handleSync = async () => {
    setSyncing(true); setSyncResult("");
    try {
      const res = await fetchAutoConfVeiculos({ registros_por_pagina: 500 });
      const dados = Array.isArray(res.dados) ? res.dados : [];
      let created = 0, updated = 0;
      for (const v of dados) {
        let fotos: string[] = [], acessorios: string[] = [];
        try {
          const detail = await fetchAutoConfVeiculo(v.id);
          if (detail.dados) { fotos = detail.dados.fotos || []; acessorios = detail.dados.acessorios || []; }
        } catch { fotos = v.foto_principal ? [v.foto_principal] : []; }
        const result = await upsertVeiculoFromAutoConf(v as unknown as Record<string, unknown>, fotos, acessorios);
        if (result === "created") created++; else updated++;
      }
      setSyncResult(`${created} novos, ${updated} atualizados de ${dados.length} veiculos`);
      loadVehicles();
    } catch (err: any) { setSyncResult(`Erro: ${err.message}`); }
    setSyncing(false);
  };

  const handleImportAll = async () => {
    setImportingAll(true); setImportProgress("Buscando veiculos...");
    try {
      const res = await fetchAutoConfVeiculos({ registros_por_pagina: 500 });
      const dados = Array.isArray(res.dados) ? res.dados : [];
      const total = dados.length;
      const imported: Array<{ id: number; data: AutoConfVeiculo; acessorios: string[] }> = [];

      for (let i = 0; i < total; i++) {
        setImportProgress(`Importando ${i + 1}/${total}...`);
        const v = dados[i];
        let fotos: string[] = [], acessorios: string[] = [];
        try {
          const detail = await fetchAutoConfVeiculo(v.id);
          if (detail.dados) { fotos = detail.dados.fotos || []; acessorios = detail.dados.acessorios || []; }
        } catch { fotos = v.foto_principal ? [v.foto_principal] : []; }
        await upsertVeiculoFromAutoConf(v as unknown as Record<string, unknown>, fotos, acessorios);
        imported.push({ id: v.id, data: v, acessorios });
      }

      if (openaiKey) {
        for (let i = 0; i < imported.length; i++) {
          setImportProgress(`Gerando descricao ${i + 1}/${total}...`);
          try {
            const v = imported[i].data;
            const desc = await generateDescription(openaiKey, {
              marca: v.marca, modelo: v.modelo, versao: v.versao,
              ano_fabricacao: v.ano_fabricacao, ano_modelo: v.ano_modelo,
              km: v.km, cor: v.cor, cambio: v.cambio,
              combustivel: v.combustivel, acessorios: imported[i].acessorios,
            });
            await updateVeiculoDescricao(imported[i].id, desc);
          } catch { /* skip */ }
          if (i < imported.length - 1) await new Promise((r) => setTimeout(r, 200));
        }
      }

      for (let i = 0; i < imported.length; i++) {
        setImportProgress(`Publicando ${i + 1}/${total}...`);
        await publishVeiculo(imported[i].id);
      }

      setImportProgress(`Concluido! ${total} veiculos importados e publicados.`);
      loadVehicles();
    } catch (err: any) { setImportProgress(`Erro: ${err.message}`); }
    setImportingAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
          <p className="text-slate-500 text-sm mt-0.5">{vehicles.length} veiculos ({publishedCount} publicados, {draftCount} rascunhos)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSync} disabled={syncing || importingAll}
            className="bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
            {syncing ? <Spinner size={14} /> : <RefreshCw size={14} />}
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </button>
          <button onClick={handleImportAll} disabled={syncing || importingAll}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm">
            {importingAll ? <Spinner size={14} /> : <Upload size={14} />}
            {importingAll ? "Importando..." : "Importar Tudo"}
          </button>
        </div>
      </div>

      {/* Progress messages */}
      {(syncResult || importProgress) && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border ${
          (syncResult || importProgress).startsWith("Erro")
            ? "bg-red-50 text-red-700 border-red-200"
            : (syncResult || importProgress).startsWith("Concluido") || (!importProgress && syncResult)
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-blue-50 text-blue-700 border-blue-200"
        }`}>
          {(syncResult || importProgress).startsWith("Erro") ? <AlertCircle size={14} /> :
           (syncResult || importProgress).startsWith("Concluido") || (!importProgress && syncResult) ? <CheckCircle2 size={14} /> :
           <Spinner size={14} />}
          {importProgress || syncResult}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar marca, modelo ou versao..."
              className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-blue-500">
              <option value="">Todos</option>
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Car size={48} />}
          title={vehicles.length === 0 ? "Nenhum veiculo importado" : "Nenhum resultado"}
          description={vehicles.length === 0 ? 'Clique em "Importar Tudo" para importar veiculos do AutoConf.' : "Tente ajustar os filtros."}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Veiculo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Ano</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">KM</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Preco</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((v) => (
                  <tr key={v.autoconf_id} onClick={() => setSelectedVehicle(v)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {v.foto_principal ? (
                          <img src={v.foto_principal} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Car size={16} className="text-slate-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{v.marca} {v.modelo}</p>
                          <p className="text-slate-400 text-xs truncate">{v.versao}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{v.ano_fabricacao}/{v.ano_modelo}</td>
                    <td className="px-4 py-3 text-slate-600 text-right hidden md:table-cell">{fmtKm(v.km)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 text-right">{fmt(v.preco)}</td>
                    <td className="px-4 py-3 text-center"><Badge status={v.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(v.tags || []).slice(0, 3).map((tag) => <TagChip key={tag} tag={tag} size="xs" />)}
                        {(v.tags || []).length > 3 && <span className="text-slate-400 text-[10px]">+{v.tags.length - 3}</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                {(currentPage - 1) * PER_PAGE + 1}-{Math.min(currentPage * PER_PAGE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
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
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <VehicleModal
            vehicle={selectedVehicle}
            openaiKey={openaiKey}
            onClose={() => setSelectedVehicle(null)}
            onUpdate={() => { loadVehicles(); setSelectedVehicle(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Leads Page ───────────────────────────────────────────────────────────────
function LeadsPage() {
  const [leads, setLeads] = useState<LeadAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"" | "novo" | "contatado" | "convertido">("");

  useEffect(() => {
    getAllLeads().then(setLeads).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: "novo" | "contatado" | "convertido") => {
    await updateLeadStatus(id, status);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  };

  const filtered = filter ? leads.filter((l) => (l.status || "novo") === filter) : leads;
  const newCount = leads.filter((l) => !l.status || l.status === "novo").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm mt-0.5">{leads.length} leads recebidos ({newCount} novos)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { val: "", label: "Todos" },
          { val: "novo", label: "Novos" },
          { val: "contatado", label: "Contatados" },
          { val: "convertido", label: "Convertidos" },
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
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
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
                      <select
                        value={l.status || "novo"}
                        onChange={(e) => handleStatusChange(l.id, e.target.value as any)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border outline-none cursor-pointer ${
                          (l.status || "novo") === "novo" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          l.status === "contatado" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <option value="novo">Novo</option>
                        <option value="contatado">Contatado</option>
                        <option value="convertido">Convertido</option>
                      </select>
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Veiculo</th>
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

// ── Config Page ──────────────────────────────────────────────────────────────
function ConfigPage({ openaiKey, setOpenaiKey }: { openaiKey: string; setOpenaiKey: (k: string) => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
              <span className="text-slate-700 font-medium">Atria Veiculos</span>
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
      </div>
    </div>
  );
}

// ── Dashboard (Main Layout) ─────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vehicles, setVehicles] = useState<VeiculoAdmin[]>([]);
  const [leads, setLeads] = useState<LeadAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

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
    getAdminConfig().then((c) => setOpenaiKey(c.openai_key || "")).catch(() => {});
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className={`transition-all duration-200 ${sidebarCollapsed ? "ml-16" : "ml-56"}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
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
              {page === "estoque" && <EstoquePage vehicles={vehicles} loadVehicles={loadVehicles} openaiKey={openaiKey} />}
              {page === "leads" && <LeadsPage />}
              {page === "whatsapp" && <WhatsAppPage />}
              {page === "config" && <ConfigPage openaiKey={openaiKey} setOpenaiKey={setOpenaiKey} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}
