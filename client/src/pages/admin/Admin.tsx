import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  adminLogin,
  fetchVeiculos,
  fetchVeiculosHome,
  fetchVeiculo,
  type VeiculoResumo,
  type VeiculoDetalhe,
  type VeiculosResponse,
} from "./api";

// ── Constants ────────────────────────────────────────────────────────────────
const LOGO_BRANCO = "https://i.postimg.cc/25m34dvJ/Logo_%C3%81tria_Branco.png";

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
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={LOGO_BRANCO} alt="Atria Veiculos" className="h-14 object-contain" />
        </div>

        <h1 className="text-xl font-bold text-white mb-0.5 text-center font-barlow-condensed tracking-wide">
          Painel Administrativo
        </h1>
        <p className="text-blue-300/60 text-sm text-center mb-8">
          Acesso restrito
        </p>

        {/* User field */}
        <label className="block text-blue-200/70 text-xs uppercase tracking-wider mb-1.5">
          Usuario
        </label>
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Seu usuario"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-400 focus:bg-white/10 transition placeholder:text-white/20"
            autoFocus
          />
        </div>

        {/* Password field */}
        <label className="block text-blue-200/70 text-xs uppercase tracking-wider mb-1.5">
          Senha
        </label>
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Sua senha"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-400 focus:bg-white/10 transition placeholder:text-white/20"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mb-4 text-center bg-red-500/10 rounded-lg py-2"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-400/30"
        >
          Entrar
        </button>
      </motion.form>
    </div>
  );
}

// ── Vehicle Detail Modal ─────────────────────────────────────────────────────
function VehicleModal({
  vehicleId,
  onClose,
}: {
  vehicleId: number;
  onClose: () => void;
}) {
  const [vehicle, setVehicle] = useState<VeiculoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchVeiculo(vehicleId).then((res) => {
      setVehicle(res.dados || null);
      setLoading(false);
    });
  }, [vehicleId]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !vehicle ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : (
          <>
            {/* Photos */}
            {vehicle.fotos && vehicle.fotos.length > 0 && (
              <div className="relative">
                <img
                  src={vehicle.fotos[photoIdx]}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  className="w-full aspect-video object-cover rounded-t-2xl"
                />
                {vehicle.fotos.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {vehicle.fotos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        className={`w-2.5 h-2.5 rounded-full transition ${
                          i === photoIdx
                            ? "bg-white"
                            : "bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {photoIdx + 1}/{vehicle.fotos.length}
                </div>
              </div>
            )}

            {/* Photo thumbnails */}
            {vehicle.fotos && vehicle.fotos.length > 1 && (
              <div className="flex gap-1 p-2 overflow-x-auto bg-gray-950">
                {vehicle.fotos.map((f, i) => (
                  <img
                    key={i}
                    src={f}
                    alt=""
                    className={`h-14 w-20 object-cover rounded cursor-pointer flex-shrink-0 transition ${
                      i === photoIdx
                        ? "ring-2 ring-blue-500"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    onClick={() => setPhotoIdx(i)}
                  />
                ))}
              </div>
            )}

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {vehicle.marca} {vehicle.modelo}
                  </h2>
                  <p className="text-gray-400 text-sm">{vehicle.versao}</p>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {fmt(vehicle.preco)}
                </p>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["Ano", `${vehicle.ano_fabricacao}/${vehicle.ano_modelo}`],
                  ["KM", fmtKm(vehicle.km)],
                  ["Cor", vehicle.cor],
                  ["Cambio", vehicle.cambio],
                  ["Combustivel", vehicle.combustivel],
                  ["Portas", vehicle.portas],
                  ["Tipo", vehicle.tipo],
                  ["Placa", vehicle.final_placa || vehicle.placa_final || "-"],
                ].map(([label, val]) => (
                  <div
                    key={String(label)}
                    className="bg-gray-800 rounded-lg p-3"
                  >
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-white text-sm font-medium">{String(val)}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {vehicle.observacao && (
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Observacao
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {vehicle.observacao}
                  </p>
                </div>
              )}

              {/* Accessories */}
              {vehicle.acessorios && vehicle.acessorios.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold text-sm mb-2">
                    Acessorios ({vehicle.acessorios.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {vehicle.acessorios.map((a) => (
                      <span
                        key={a}
                        className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ID */}
              <p className="text-gray-600 text-xs">
                ID AutoConf: {vehicle.id}
              </p>
            </div>

            {/* Close */}
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm transition"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [vehicles, setVehicles] = useState<VeiculoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [page, setPage] = useState(1);
  const [destaqueCount, setDestaqueCount] = useState(0);

  // Filters
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState("");
  const [precoAte, setPrecoAte] = useState("");

  // Modal
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Available brands for filter
  const [marcas, setMarcas] = useState<string[]>([]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        pagina: page,
        registros_por_pagina: 20,
        ordenacao: "preco_desc",
      };
      if (marca) params.marca = marca;
      if (tipo) params.tipo = tipo;
      if (precoAte) params.preco_ate = Number(precoAte);

      const res = await fetchVeiculos(params);
      if (res.sucesso !== false) {
        const dados = Array.isArray(res.dados) ? res.dados : [];
        setVehicles(dados);
        if (res.paginacao) {
          setTotalRegistros(res.paginacao.total_registros);
          setTotalPaginas(res.paginacao.total_paginas);
        }
      } else {
        setVehicles(Array.isArray(res.dados) ? res.dados : []);
      }
    } catch {
      setVehicles([]);
    }
    setLoading(false);
  }, [page, marca, tipo, precoAte]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Load highlights count + brands on mount
  useEffect(() => {
    fetchVeiculosHome().then((res) => {
      const dados = Array.isArray(res.dados) ? res.dados : [];
      setDestaqueCount(dados.length);
    });
    fetchVeiculos({ registros_por_pagina: 200 }).then((res) => {
      const dados = Array.isArray(res.dados) ? res.dados : [];
      const m = Array.from(new Set(dados.map((v) => v.marca).filter(Boolean))).sort();
      setMarcas(m);
    });
  }, []);

  const handleFilter = () => {
    setPage(1);
    loadVehicles();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">Atria Admin</h1>
          <span className="text-gray-600 text-xs">AutoConf API</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_auth");
              onLogout();
            }}
            className="text-red-400 hover:text-red-300 text-sm transition"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ["Veiculos no Estoque", totalRegistros],
            ["Em Destaque", destaqueCount],
            ["Pagina Atual", `${page}/${totalPaginas}`],
            ["Marcas", marcas.length],
          ].map(([label, val]) => (
            <div
              key={String(label)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                {String(label)}
              </p>
              <p className="text-2xl font-bold">{String(val)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
                Marca
              </label>
              <select
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none min-w-[140px]"
              >
                <option value="">Todas</option>
                {marcas.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none min-w-[120px]"
              >
                <option value="">Todos</option>
                <option value="carros">Carros</option>
                <option value="motos">Motos</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
                Preco ate
              </label>
              <input
                type="number"
                placeholder="Ex: 200000"
                value={precoAte}
                onChange={(e) => setPrecoAte(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none w-[140px]"
              />
            </div>

            <button
              onClick={handleFilter}
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Filtrar
            </button>

            {(marca || tipo || precoAte) && (
              <button
                onClick={() => {
                  setMarca("");
                  setTipo("");
                  setPrecoAte("");
                  setPage(1);
                }}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Vehicle list */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Carregando veiculos...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Nenhum veiculo encontrado
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
                    <th className="text-center p-3 hidden sm:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer transition"
                    >
                      <td className="p-3">
                        {v.foto_principal ? (
                          <img
                            src={v.foto_principal}
                            alt=""
                            className="w-16 h-11 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-11 bg-gray-800 rounded flex items-center justify-center text-gray-600 text-[10px]">
                            Sem foto
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-white">
                          {v.marca} {v.modelo}
                        </p>
                        <p className="text-gray-500 text-xs">{v.versao}</p>
                      </td>
                      <td className="p-3 text-gray-300 hidden sm:table-cell">
                        {v.ano_fabricacao}/{v.ano_modelo}
                      </td>
                      <td className="p-3 text-gray-300 text-right hidden md:table-cell">
                        {fmtKm(v.km)}
                      </td>
                      <td className="p-3 text-green-400 font-semibold text-right">
                        {fmt(v.preco)}
                      </td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            v.destaque
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {v.destaque ? "Destaque" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 px-4 py-2 rounded-lg text-sm transition"
            >
              Anterior
            </button>
            <span className="flex items-center text-gray-400 text-sm px-3">
              {page} de {totalPaginas}
            </span>
            <button
              disabled={page >= totalPaginas}
              onClick={() => setPage((p) => p + 1)}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 px-4 py-2 rounded-lg text-sm transition"
            >
              Proxima
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedId && (
        <VehicleModal
          vehicleId={selectedId}
          onClose={() => setSelectedId(null)}
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
