import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  type VeiculoAdmin,
} from "@/lib/adminFirestore";

// ── Constants ────────────────────────────────────────────────────────────────
const LOGO_BRANCO = "https://i.postimg.cc/25m34dvJ/Logo_%C3%81tria_Branco.png";

const PRESET_TAGS = ["destaque", "oferta", "seminovo premium", "reservado", "vendido"];

const TAG_COLORS: Record<string, string> = {
  destaque: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  oferta: "bg-green-500/20 text-green-300 border-green-500/30",
  "seminovo premium": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  reservado: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  vendido: "bg-red-500/20 text-red-300 border-red-500/30",
};

const DEFAULT_TAG_COLOR = "bg-blue-500/20 text-blue-300 border-blue-500/30";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtKm = (v: number) => v.toLocaleString("pt-BR") + " km";

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d2147] to-[#1a3a6b] flex items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-white/10"
      >
        <div className="flex justify-center mb-4">
          <img src={LOGO_BRANCO} alt="Atria Veiculos" className="h-14 object-contain" />
        </div>
        <h1 className="text-xl font-bold text-white mb-0.5 text-center font-barlow-condensed tracking-wide">
          Painel Administrativo
        </h1>
        <p className="text-blue-300/60 text-sm text-center mb-8">Acesso restrito</p>

        <label className="block text-blue-200/70 text-xs uppercase tracking-wider mb-1.5">Usuario</label>
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Seu usuario"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-400 focus:bg-white/10 transition placeholder:text-white/20" autoFocus />
        </div>

        <label className="block text-blue-200/70 text-xs uppercase tracking-wider mb-1.5">Senha</label>
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Sua senha"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-400 focus:bg-white/10 transition placeholder:text-white/20" />
        </div>

        {error && (
          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mb-4 text-center bg-red-500/10 rounded-lg py-2">{error}</motion.p>
        )}

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-400/30">
          Entrar
        </button>
      </motion.form>
    </div>
  );
}

// ── Tag Chips ────────────────────────────────────────────────────────────────
function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  const color = TAG_COLORS[tag] || DEFAULT_TAG_COLOR;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 ml-0.5">&times;</button>
      )}
    </span>
  );
}

// ── Vehicle Detail / Edit Modal ──────────────────────────────────────────────
function VehicleModal({
  vehicle,
  openaiKey,
  onClose,
  onUpdate,
}: {
  vehicle: VeiculoAdmin;
  openaiKey: string;
  onClose: () => void;
  onUpdate: () => void;
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
    if (!openaiKey) {
      setAiError("Configure a chave OpenAI nas configuracoes primeiro");
      return;
    }
    setGenerating(true);
    setAiError("");
    try {
      const text = await generateDescription(openaiKey, {
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        versao: vehicle.versao,
        ano_fabricacao: vehicle.ano_fabricacao,
        ano_modelo: vehicle.ano_modelo,
        km: vehicle.km,
        cor: vehicle.cor,
        cambio: vehicle.cambio,
        combustivel: vehicle.combustivel,
        acessorios: vehicle.acessorios || [],
      });
      setDescricao(text);
    } catch (err: any) {
      setAiError(err.message || "Erro ao gerar descricao");
    }
    setGenerating(false);
  };

  const handleSaveDescricao = async () => {
    setSaving(true);
    await updateVeiculoDescricao(vehicle.autoconf_id, descricao);
    setSaving(false);
    onUpdate();
  };

  const handlePublish = async () => {
    setPublishing(true);
    if (vehicle.status === "publicado") {
      await unpublishVeiculo(vehicle.autoconf_id);
    } else {
      await publishVeiculo(vehicle.autoconf_id);
    }
    setPublishing(false);
    onUpdate();
    onClose();
  };

  const fotos = vehicle.fotos?.length ? vehicle.fotos : vehicle.foto_principal ? [vehicle.foto_principal] : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}>
        {/* Photos */}
        {fotos.length > 0 && (
          <div className="relative">
            <img src={fotos[photoIdx]} alt={`${vehicle.marca} ${vehicle.modelo}`}
              className="w-full aspect-video object-cover rounded-t-2xl" />
            {fotos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {fotos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition ${i === photoIdx ? "bg-white" : "bg-white/40 hover:bg-white/70"}`} />
                ))}
              </div>
            )}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${vehicle.status === "publicado" ? "bg-green-500 text-white" : "bg-gray-600 text-gray-200"}`}>
                {vehicle.status === "publicado" ? "PUBLICADO" : "RASCUNHO"}
              </span>
            </div>
          </div>
        )}

        {/* Photo thumbnails */}
        {fotos.length > 1 && (
          <div className="flex gap-1 p-2 overflow-x-auto bg-gray-950">
            {fotos.map((f, i) => (
              <img key={i} src={f} alt="" onClick={() => setPhotoIdx(i)}
                className={`h-14 w-20 object-cover rounded cursor-pointer flex-shrink-0 transition ${i === photoIdx ? "ring-2 ring-blue-500" : "opacity-60 hover:opacity-100"}`} />
            ))}
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">{vehicle.marca} {vehicle.modelo}</h2>
              <p className="text-gray-400 text-sm">{vehicle.versao}</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{fmt(vehicle.preco)}</p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Ano", `${vehicle.ano_fabricacao}/${vehicle.ano_modelo}`],
              ["KM", fmtKm(vehicle.km)],
              ["Cor", vehicle.cor],
              ["Cambio", vehicle.cambio],
              ["Combustivel", vehicle.combustivel],
              ["Portas", vehicle.portas || "-"],
              ["Tipo", vehicle.tipo],
              ["Placa", vehicle.placa_final || "-"],
            ].map(([label, val]) => (
              <div key={String(label)} className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
                <p className="text-white text-sm font-medium">{String(val)}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
              ))}
              {tags.length === 0 && <span className="text-gray-500 text-xs">Nenhuma tag</span>}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button key={tag} onClick={() => handleAddTag(tag)}
                  className="px-2.5 py-0.5 rounded-full text-xs border border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition">
                  + {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag(newTag))}
                placeholder="Tag customizada..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500" />
              <button onClick={() => handleAddTag(newTag)} disabled={!newTag.trim()}
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 px-3 py-1.5 rounded-lg text-xs text-white transition">
                Adicionar
              </button>
            </div>
          </div>

          {/* AI Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Descricao para o site</h3>
              <button onClick={handleGenerateAI} disabled={generating}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                {generating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Gerar com IA
                  </>
                )}
              </button>
            </div>
            {aiError && <p className="text-red-400 text-xs mb-2">{aiError}</p>}
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4}
              placeholder="Descricao do veiculo para exibir no site..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 resize-y" />
            <button onClick={handleSaveDescricao} disabled={saving}
              className="mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded-lg transition">
              {saving ? "Salvando..." : "Salvar descricao"}
            </button>
          </div>

          {/* Observacao (original from AutoConf) */}
          {vehicle.observacao && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Observacao (AutoConf)</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{vehicle.observacao}</p>
            </div>
          )}

          {/* Accessories */}
          {vehicle.acessorios && vehicle.acessorios.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Acessorios ({vehicle.acessorios.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {vehicle.acessorios.map((a) => (
                  <span key={a} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-xs">ID AutoConf: {vehicle.autoconf_id}</p>
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <button onClick={handlePublish} disabled={publishing}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              vehicle.status === "publicado"
                ? "bg-orange-600 hover:bg-orange-500 text-white"
                : "bg-green-600 hover:bg-green-500 text-white"
            } disabled:opacity-50`}>
            {publishing ? "..." : vehicle.status === "publicado" ? "Despublicar" : "Publicar"}
          </button>
          <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm transition">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [vehicles, setVehicles] = useState<VeiculoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<"" | "rascunho" | "publicado">("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal
  const [selectedVehicle, setSelectedVehicle] = useState<VeiculoAdmin | null>(null);

  // Sync
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");

  // Config
  const [showSettings, setShowSettings] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filter = statusFilter || undefined;
      const data = await getAllAdminVeiculos(filter);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar veiculos");
      setVehicles([]);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Load config
  useEffect(() => {
    getAdminConfig()
      .then((c) => setOpenaiKey(c.openai_key || ""))
      .catch(() => {});
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult("");
    try {
      // Fetch all vehicles from AutoConf (up to 500)
      const res = await fetchAutoConfVeiculos({ registros_por_pagina: 500 });
      const dados = Array.isArray(res.dados) ? res.dados : [];

      let created = 0;
      let updated = 0;

      for (const v of dados) {
        // Fetch detail to get fotos and acessorios
        let fotos: string[] = [];
        let acessorios: string[] = [];
        try {
          const detail = await fetchAutoConfVeiculo(v.id);
          if (detail.dados) {
            fotos = detail.dados.fotos || [];
            acessorios = detail.dados.acessorios || [];
          }
        } catch {
          // Use basic data if detail fails
          fotos = v.foto_principal ? [v.foto_principal] : [];
        }

        const result = await upsertVeiculoFromAutoConf(v as unknown as Record<string, unknown>, fotos, acessorios);
        if (result === "created") created++;
        else updated++;
      }

      setSyncResult(`Sincronizado! ${created} novos, ${updated} atualizados de ${dados.length} veiculos.`);
      loadVehicles();
    } catch (err: any) {
      setSyncResult(`Erro: ${err.message}`);
    }
    setSyncing(false);
  };

  const handleSaveOpenAIKey = async () => {
    setSavingKey(true);
    try {
      await saveAdminConfig({ openai_key: openaiKeyInput || openaiKey });
      setOpenaiKey(openaiKeyInput || openaiKey);
      setOpenaiKeyInput("");
    } catch (err: any) {
      setError(err.message);
    }
    setSavingKey(false);
  };

  // Filter by search
  const filtered = vehicles.filter((v) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      v.marca.toLowerCase().includes(s) ||
      v.modelo.toLowerCase().includes(s) ||
      v.versao.toLowerCase().includes(s)
    );
  });

  const publishedCount = vehicles.filter((v) => v.status === "publicado").length;
  const draftCount = vehicles.filter((v) => v.status === "rascunho").length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={LOGO_BRANCO} alt="Atria" className="h-8 object-contain" />
          <h1 className="text-lg font-bold hidden sm:block">Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white text-sm transition">
            Config
          </button>
          <button onClick={() => { sessionStorage.removeItem("admin_auth"); onLogout(); }}
            className="text-red-400 hover:text-red-300 text-sm transition">
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Configuracoes</h2>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Chave OpenAI</label>
                  <div className="flex gap-2">
                    <input type="password" placeholder={openaiKey ? "****" + openaiKey.slice(-4) : "sk-..."}
                      value={openaiKeyInput} onChange={(e) => setOpenaiKeyInput(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
                    <button onClick={handleSaveOpenAIKey} disabled={savingKey}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition">
                      {savingKey ? "..." : "Salvar"}
                    </button>
                  </div>
                  {openaiKey && <p className="text-gray-600 text-xs mt-1">Chave configurada (****{openaiKey.slice(-4)})</p>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats + Sync */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="grid grid-cols-3 gap-4 flex-1">
            {[
              ["Total", vehicles.length, "text-white"],
              ["Publicados", publishedCount, "text-green-400"],
              ["Rascunhos", draftCount, "text-yellow-400"],
            ].map(([label, val, color]) => (
              <div key={String(label)} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{String(label)}</p>
                <p className={`text-2xl font-bold ${color}`}>{String(val)}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={handleSync} disabled={syncing}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2">
              {syncing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar Estoque
                </>
              )}
            </button>
            {syncResult && (
              <p className={`text-xs ${syncResult.startsWith("Erro") ? "text-red-400" : "text-green-400"}`}>
                {syncResult}
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none min-w-[140px]">
                <option value="">Todos</option>
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">Buscar</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Marca, modelo ou versao..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Vehicle list */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando veiculos...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {vehicles.length === 0
              ? 'Nenhum veiculo no Firestore. Clique em "Sincronizar Estoque" para importar do AutoConf.'
              : "Nenhum veiculo encontrado com os filtros atuais."}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-wider">
                    <th className="text-left p-3">Foto</th>
                    <th className="text-left p-3">Veiculo</th>
                    <th className="text-left p-3 hidden sm:table-cell">Ano</th>
                    <th className="text-right p-3 hidden md:table-cell">KM</th>
                    <th className="text-right p-3">Preco</th>
                    <th className="text-center p-3">Status</th>
                    <th className="text-left p-3 hidden lg:table-cell">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.autoconf_id} onClick={() => setSelectedVehicle(v)}
                      className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer transition">
                      <td className="p-3">
                        {v.foto_principal ? (
                          <img src={v.foto_principal} alt="" className="w-16 h-11 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-11 bg-gray-800 rounded flex items-center justify-center text-gray-600 text-[10px]">Sem foto</div>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-white">{v.marca} {v.modelo}</p>
                        <p className="text-gray-500 text-xs">{v.versao}</p>
                      </td>
                      <td className="p-3 text-gray-300 hidden sm:table-cell">{v.ano_fabricacao}/{v.ano_modelo}</td>
                      <td className="p-3 text-gray-300 text-right hidden md:table-cell">{fmtKm(v.km)}</td>
                      <td className="p-3 text-green-400 font-semibold text-right">{fmt(v.preco)}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          v.status === "publicado" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
                        }`}>
                          {v.status === "publicado" ? "Publicado" : "Rascunho"}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(v.tags || []).slice(0, 3).map((tag) => (
                            <TagChip key={tag} tag={tag} />
                          ))}
                          {(v.tags || []).length > 3 && (
                            <span className="text-gray-500 text-xs">+{v.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          openaiKey={openaiKey}
          onClose={() => setSelectedVehicle(null)}
          onUpdate={() => {
            loadVehicles();
          }}
        />
      )}
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("admin_auth") === "1"
  );

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}
