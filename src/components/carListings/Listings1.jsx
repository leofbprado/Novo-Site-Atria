import React, { useEffect, useMemo, useState } from "react";
import LucideIcon from "../icons/LucideIcon";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { analytics } from "@/lib/analytics";
import { buildVehicleCanonicalPath } from "@/utils/vehiclePaths";

import SelectComponent from "../common/SelectComponent";
import Pagination from "../common/Pagination";
import { cars } from "@/data/cars";
import { useFilters } from "@/contexts/FilterContext";

/**
 * Listagem de veículos (Estoque)
 * - Desktop XL: 3 cards por linha (col-xl-4)
 * - Desktop LG: 3 cards por linha (col-lg-4)
 * - MD/SM: 2 cards por linha (col-md-6 / col-sm-6)
 * - Mobile: 1 card por linha (100%)
 * - Linha de especificações (Flex / km / câmbio) com fonte reduzida e mais respiro
 * - Ano e "Ver Detalhes" com layout flex, sem sobreposição e com wrap no mobile
 * - Remove "Disponível em Campinas" da listagem
 * - Mantém DE/POR, tags personalizadas, filtros e analytics
 */
export default function Listings1({ searchQuery = "", onVehiclesChange }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { debouncedFilters, updateFilters } = useFilters();

  const [vehicles, setVehicles] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [urlBrandApplied, setUrlBrandApplied] = useState(false);
  const [urlOfferApplied, setUrlOfferApplied] = useState(false);

  const urlBrand = searchParams.get("marca");
  const urlOferta = searchParams.get("oferta");

  // ----------------------------- CSS de reforço (injetado) -----------------------------
  useEffect(() => {
    const id = "listings1-estoque-fixes";
    const css = `
      /* grid: ajusta gutters e garante que o card ocupe a largura */
      .page-estoque .cards-row { margin-left: -8px; margin-right: -8px; }
      .page-estoque .cards-row > [class*="col-"] { padding-left: 8px; padding-right: 8px; }

      /* card não estoura e não corta conteúdo */
      .page-estoque .car-block-four .inner-box { box-sizing: border-box; width: 100%; overflow: hidden; }

      /* título com quebra elegante */
      .page-estoque .car-block-four .content-box .title {
        word-break: break-word;
        hyphens: auto;
        line-height: 1.28;
        margin: 12px 0 8px;
      }

      /* imagem do card responsiva */
      .page-estoque .car-block-four .image-box .image,
      .page-estoque .car-block-four .image-box .image img {
        width: 100%;
        height: auto;
        display: block;
      }
      .page-estoque .car-block-four .image-box .image img {
        aspect-ratio: 1.5 / 1;
        object-fit: cover;
        border-radius: 12px;
      }

      /* linha de especificações: 3 colunas (combustível / km / câmbio) com fonte menor e mais respiro */
      .page-estoque .car-block-four .content-box ul {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px 16px;           /* + respiro horizontal */
        list-style: none;
        margin: 12px 0 0;
        padding: 0;
      }

      /* remove pseudo-elementos/pontos do tema */
      .page-estoque .car-block-four .content-box ul li::before,
      .page-estoque .car-block-four .content-box ul li::after {
        content: none !important;
        display: none !important;
      }

      /* cada item de spec: ícone + valor, sem elipse e com fonte reduzida */
      .page-estoque .car-block-four .content-box ul li {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      .page-estoque .car-block-four .content-box ul li i { flex: 0 0 auto; }
      .page-estoque .car-block-four .content-box ul li span {
        flex: 1 1 auto;
        min-width: 0;
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;
        font-size: 12px;          /* ↓ diminui um pouco a fonte */
        line-height: 1.25;
        color: #475569;
      }

      /* Rodapé do card (ano + "Ver Detalhes") com flex e wrap — nada sobrepõe */
      .page-estoque .car-block-four .content-box .btn-box{
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 12px;
        flex-wrap: nowrap;
        min-height: 40px; /* evita sobreposição em temas que comprimem o rodapé */
      }
      .page-estoque .car-block-four .content-box .btn-box > span{
        font-weight: 600;
        color: #1f2937;
        white-space: nowrap;
      }
      .page-estoque .car-block-four .content-box .btn-box > small{
        color: #64748b;
        white-space: nowrap;
      }
      .page-estoque .car-block-four .content-box .btn-box .details{
        margin-left: auto;
        white-space: nowrap;
      }

      /* MOBILE: 1 card por fileira, ocupar 100% */
      @media (max-width: 768px) {
        .page-estoque .cards-row { margin-left: 0; margin-right: 0; }
        .page-estoque .cards-row > [class*="col-"] {
          width: 100% !important;
          max-width: 100% !important;
          flex: 0 0 100% !important;
          padding-left: 0;
          padding-right: 0;
        }
        .page-estoque .car-block-four .inner-box {
          width: 100%;
          margin-bottom: 16px;
        }
        /* No mobile, se faltar espaço, deixa o botão quebrar de linha com elegância */
        .page-estoque .car-block-four .content-box .btn-box{
          flex-wrap: wrap;
        }
        .page-estoque .car-block-four .content-box .btn-box .details{
          margin-left: 0;
          flex-basis: 100%;
        }
      }
    `.trim();

    const existing = document.getElementById(id);
    if (existing) {
      existing.textContent = css;
    } else {
      const style = document.createElement("style");
      style.id = id;
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }
  }, []);
  // --------------------------------------------------------------------------------------

  // Formatação de preço
  const formatPrice = (price) => {
    if (!price || price === 0) return "Consulte";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    const finalPrice = numPrice < 1000 ? numPrice * 1000 : numPrice;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(finalPrice);
  };

  // Preço: DE/POR quando mostrar_de_por = true e preco_de válido
  const renderPrice = (vehicle) => {
    const precoAtual = formatPrice(vehicle.preco);
    const precoDe =
      vehicle.preco_de && parseFloat(vehicle.preco_de) > parseFloat(vehicle.preco)
        ? formatPrice(vehicle.preco_de)
        : null;

    if (vehicle.mostrar_de_por && precoDe) {
      return (
        <div>
          <span
            style={{
              color: "#6b7280",
              textDecoration: "line-through",
              fontSize: "12px",
              display: "block",
            }}
          >
            DE {precoDe}
          </span>
          <span
            style={{
              color: "#1A75FF",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            POR {precoAtual}
          </span>
        </div>
      );
    }
    return <span style={{ color: "#1A75FF", fontWeight: "bold" }}>{precoAtual}</span>;
  };

  // Tags personalizadas (Firebase)
  useEffect(() => {
    const loadCustomTags = async () => {
      try {
        const { db } = await import("@/firebase/config");
        const { collection, getDocs } = await import("firebase/firestore");
        const col = collection(db, "tags_customizadas");
        const snap = await getDocs(col);
        setCustomTags(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erro ao carregar tags personalizadas:", e);
      }
    };
    loadCustomTags();
  }, []);

  const getCustomTagByName = (name) => customTags.find((t) => t.nome === name);

  // Aplica filtro de marca via URL
  useEffect(() => {
    if (urlBrand && !urlBrandApplied) {
      updateFilters({ brand: urlBrand, brands: [urlBrand] });
      setUrlBrandApplied(true);
    } else if (!urlBrand && urlBrandApplied) {
      updateFilters({ brand: "", brands: [] });
      setUrlBrandApplied(false);
    }
  }, [urlBrand, urlBrandApplied, updateFilters]);

  // Aplica filtro de oferta via URL
  useEffect(() => {
    if (urlOferta && !urlOfferApplied) {
      updateFilters({ offers: [urlOferta] });
      setUrlOfferApplied(true);
    } else if (!urlOferta && urlOfferApplied) {
      updateFilters({ offers: [] });
      setUrlOfferApplied(false);
    }
  }, [urlOferta, urlOfferApplied, updateFilters]);

  // Sincroniza oferta no querystring quando alterada pelos filtros
  useEffect(() => {
    const current = new URLSearchParams(searchParams);
    if (!urlOfferApplied && debouncedFilters.offers?.length) {
      current.set("oferta", debouncedFilters.offers[0]);
      window.history.replaceState({}, "", `${window.location.pathname}?${current.toString()}`);
    } else if (!urlOfferApplied && (!debouncedFilters.offers || debouncedFilters.offers.length === 0)) {
      current.delete("oferta");
      const newUrl = current.toString()
        ? `${window.location.pathname}?${current.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [debouncedFilters.offers, urlOfferApplied, searchParams]);

  // Carrega veículos (Firebase -> fallback local)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { db } = await import("@/firebase/config");
        const { collection, getDocs } = await import("firebase/firestore");
        const col = collection(db, "veiculos");
        const snap = await getDocs(col);
        setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setError(null);
      } catch (e) {
        console.error("❌ Erro ao carregar veículos:", e);
        setVehicles(cars);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtro principal
  const filteredVehicles = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];

    let filtered = [...vehicles];

    // Busca textual
    const searchText = searchQuery || debouncedFilters.search;
    if (searchText && typeof searchText === "string" && searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      const hasSpecific =
        debouncedFilters.brands?.length > 0 || debouncedFilters.models?.length > 0;
      if (!hasSpecific) {
        filtered = filtered.filter((v) => {
          const fields = [
            v.marca,
            v.modelo,
            v.versao,
            v.descricao,
            v.descricao_corrigida,
            v.categoria,
            v.tipo_veiculo,
            v.tipo,
            v.category,
            v.combustivel,
            v.combustivel_corrigido,
            v.transmissao,
            v.cambio,
            v.ano?.toString(),
            v.year?.toString(),
            v.cor,
            v.color,
            ...(Array.isArray(v.tags) ? v.tags : []),
            v.tag?.nome,
            v.custom_tag?.nome,
            ...(typeof v.opcionais === "object" && v.opcionais
              ? Object.values(v.opcionais).flat().filter(Boolean)
              : []),
            ...(typeof v.opcionais_corrigidos === "object" && v.opcionais_corrigidos
              ? Object.values(v.opcionais_corrigidos).flat().filter(Boolean)
              : []),
            v.blindado ? "blindado" : null,
            v.ipva_pago ? "ipva pago" : null,
            v.unico_dono ? "único dono" : null,
            v.licenciado ? "licenciado" : null,
            v.km === 0 ? "0km" : null,
            v.km && v.km < 30000 ? "baixa quilometragem" : null,
            v.km && v.km < 30000 ? "baixo km" : null,
            v.preco && v.preco < 50000 ? "barato" : null,
            v.preco && v.preco < 50000 ? "econômico" : null,
            v.placa,
            v.chassi,
            v.cidade,
            v.estado,
            v.vendedor,
          ].filter((f) => f && typeof f === "string" && f.trim());

          const tokens = query.split(/\s+/);
          return tokens.some((t) => fields.some((f) => f.toLowerCase().includes(t)));
        });
      }
    }

    // Marcas
    if (debouncedFilters.brands?.length) {
      filtered = filtered.filter(
        (v) =>
          v.marca &&
          debouncedFilters.brands.some((b) => v.marca.toLowerCase() === b.toLowerCase())
      );
    }

    // Modelos
    if (debouncedFilters.models?.length) {
      filtered = filtered.filter(
        (v) =>
          v.modelo &&
          debouncedFilters.models.some((m) => v.modelo.toLowerCase() === m.toLowerCase())
      );
    }

    // Preço
    const minPrice = Number(debouncedFilters.minPrice);
    const maxPrice = Number(debouncedFilters.maxPrice);
    const hasMin = !isNaN(minPrice) && minPrice > 0;
    const hasMax = !isNaN(maxPrice) && maxPrice < 999999;
    if (hasMin || hasMax) {
      filtered = filtered.filter((v) => {
        if (!v.preco) return false;
        const p = Number(v.preco);
        if (isNaN(p)) return false;
        const fv = p < 1000 ? p * 1000 : p;
        const okMin = !hasMin || fv >= minPrice;
        const okMax = !hasMax || fv <= maxPrice;
        return okMin && okMax;
      });
    }

    // Ano(s)
    if (debouncedFilters.years?.length) {
      filtered = filtered.filter((v) => {
        const y = Number(v.ano_modelo || v.ano || v.ano_fabricacao);
        return !isNaN(y) && debouncedFilters.years.includes(y);
      });
    }
    if (debouncedFilters.anos?.length) {
      filtered = filtered.filter((v) => {
        const y = Number(v.ano_modelo || v.ano || v.ano_fabricacao);
        return !isNaN(y) && debouncedFilters.anos.includes(y);
      });
    }
    if (debouncedFilters.anoMin !== null || debouncedFilters.anoMax !== null) {
      filtered = filtered.filter((v) => {
        const y = Number(v.ano_modelo || v.ano || v.ano_fabricacao);
        if (isNaN(y)) return false;
        if (debouncedFilters.anoMin !== null && y < debouncedFilters.anoMin) return false;
        if (debouncedFilters.anoMax !== null && y > debouncedFilters.anoMax) return false;
        return true;
      });
    }

    // Combustível
    if (debouncedFilters.fuel?.length) {
      filtered = filtered.filter(
        (v) =>
          v.combustivel &&
          debouncedFilters.fuel.some(
            (f) => v.combustivel.toLowerCase().trim() === f.toLowerCase().trim()
          )
      );
    }

    // Transmissão
    if (debouncedFilters.transmission?.length) {
      filtered = filtered.filter(
        (v) =>
          v.cambio &&
          debouncedFilters.transmission.some(
            (t) => v.cambio.toLowerCase().trim() === t.toLowerCase().trim()
          )
      );
    }

    // KM
    const minMileage = Number(debouncedFilters.minMileage);
    const maxMileage = Number(debouncedFilters.maxMileage);
    if (!isNaN(minMileage) && minMileage > 0) {
      filtered = filtered.filter((v) => Number(v.km) >= minMileage);
    }
    if (!isNaN(maxMileage) && maxMileage > 0) {
      filtered = filtered.filter((v) => Number(v.km) <= maxMileage);
    }
    const kmMin = Number(debouncedFilters.kmMin);
    const kmMax = Number(debouncedFilters.kmMax);
    if (!isNaN(kmMin) && kmMin > 0) {
      filtered = filtered.filter((v) => Number(v.km) >= kmMin);
    }
    if (!isNaN(kmMax) && kmMax > 0) {
      filtered = filtered.filter((v) => Number(v.km) <= kmMax);
    }

    // Categoria/tipo
    const carTypes = debouncedFilters.carTypes?.length
      ? debouncedFilters.carTypes
      : debouncedFilters.category?.length
      ? debouncedFilters.category
      : [];
    if (Array.isArray(carTypes) && carTypes.length > 0) {
      filtered = filtered.filter((v) => {
        const vt = (v.categoria || v.tipo_veiculo || v.tipo || v.category || "")
          .toLowerCase()
          .trim();
        if (!vt) return false;
        return carTypes.some((f) => {
          const lf = f.toLowerCase().trim();
          return (
            vt.includes(lf) ||
            lf.includes(vt) ||
            (lf === "hatch" && (vt.includes("hatchback") || vt.includes("compacto"))) ||
            (lf === "hatchback" && vt.includes("hatch")) ||
            (lf === "pickup" && (vt.includes("pick-up") || vt.includes("picape"))) ||
            (lf === "pick-up" && (vt.includes("pickup") || vt.includes("picape"))) ||
            (lf === "suv" && vt.includes("crossover")) ||
            (lf === "crossover" && vt.includes("suv"))
          );
        });
      });
    }

    // Ofertas/tags
    if (debouncedFilters.offers?.length) {
      filtered = filtered.filter((v) => {
        let vtags = [];
        if (Array.isArray(v.tags)) vtags = v.tags;
        else if (v.tag && typeof v.tag === "object" && v.tag.nome) vtags = [v.tag.nome];
        if (vtags.length === 0) return false;
        return debouncedFilters.offers.some((sel) =>
          vtags.some(
            (t) => typeof t === "string" && (t === sel || t.toLowerCase() === sel.toLowerCase())
          )
        );
      });
    }

    if (onVehiclesChange && typeof onVehiclesChange === "function") {
      onVehiclesChange(filtered);
    }
    return filtered;
  }, [vehicles, searchQuery, debouncedFilters, onVehiclesChange]);

  // Analytics de lista
  useEffect(() => {
    if (filteredVehicles.length > 0) {
      analytics.viewItemList("Estoque", filteredVehicles, filteredVehicles.length);
    }
  }, [filteredVehicles.length]);

  // Estados de carregamento/erro
  if (loading) {
    return (
      <div className="boxcar-container">
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            fontSize: "18px",
            color: "#666",
          }}
        >
          🔄 Carregando veículos...
        </div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="boxcar-container">
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            fontSize: "18px",
            color: "#e74c3c",
          }}
        >
          ❌ Erro ao carregar veículos: {error}
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="boxcar-container">
      {/* Cabeçalho da listagem */}
      <div
        className="text-box"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0",
          borderBottom: "1px solid #e9ecef",
          marginBottom: "24px",
        }}
      >
        <div
          className="text"
          style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}
        >
          Mostrando {filteredVehicles.length} veículo
          {filteredVehicles.length !== 1 ? "s" : ""}{" "}
          {vehicles.length !== filteredVehicles.length &&
            ` de ${vehicles.length} total`}
          {error && " (usando dados de exemplo)"}
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div
            className="form_boxes v3"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <small style={{ color: "#64748b", fontWeight: 500 }}>Ordenar por</small>
            <SelectComponent
              options={[
                "Mais recentes",
                "Menor preço",
                "Maior preço",
                "Menor quilometragem",
                "Maior quilometragem",
              ]}
            />
          </div>
        </form>
      </div>

      {/* Grid */}
      <div className="row wow fadeInUp cards-row">
        {filteredVehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="car-block-four col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12"
          >
            <div className="inner-box">
              <div className="image-box relative">
                <figure className="image" style={{ overflow: "hidden", borderRadius: 12 }}>
                  <Link
                    to={
                      buildVehicleCanonicalPath(vehicle) ||
                      `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`
                    }
                    onClick={() => analytics.selectItem(vehicle, index + 1, "Estoque")}
                  >
                    <img
                      fetchpriority="low"
                      decoding="async"
                      loading="lazy"
                      alt={`Foto do veículo ${vehicle?.marca || vehicle?.brand} ${vehicle?.modelo || vehicle?.model}`}
                      src={(() => {
                        if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
                          return vehicle.photos[0];
                        }
                        if (vehicle.imagens && Array.isArray(vehicle.imagens) && vehicle.imagens.length > 0) {
                          return vehicle.imagens[0];
                        }
                        return "/images/resource/car1-1.jpg";
                      })()}
                    />
                  </Link>
                </figure>

                {/* Selo de oferta simples */}
                {vehicle.promocao && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow font-semibold">
                    Oferta
                  </span>
                )}

                {/* Tag personalizada (validação pela base de tags) */}
                {(() => {
                  const nowTag = vehicle.tag || vehicle.custom_tag;
                  let validTag = null;

                  if (nowTag && typeof nowTag === "object" && nowTag.nome) {
                    validTag = customTags.some((t) => t.nome === nowTag.nome) ? nowTag : null;
                  } else if (typeof nowTag === "string") {
                    validTag = getCustomTagByName(nowTag) || null;
                  }

                  if (!validTag) return null;

                  return (
                    <div className="absolute top-2 right-2">
                      <span
                        className="text-white text-xs px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide flex items-center gap-2"
                        style={{ backgroundColor: validTag.cor || "#1A75FF" }}
                      >
                        {validTag.icone && (
                          <LucideIcon name={validTag.icone} size={12} color="white" />
                        )}
                        {validTag.nome}
                      </span>
                    </div>
                  );
                })()}

                <a className="icon-box" aria-label="Salvar">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={12}
                    height={12}
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_601_1274)">
                      <path
                        d="M9.39062 12C9.15156 12 8.91671 11.9312 8.71128 11.8009L6.11794 10.1543C6.04701 10.1091 5.95296 10.1096 5.88256 10.1543L3.28869 11.8009C2.8048 12.1082 2.13755 12.0368 1.72722 11.6454C1.47556 11.4047 1.33685 11.079 1.33685 10.728V1.2704C1.33738 0.570053 1.90743 0 2.60778 0H9.39272C10.0931 0 10.6631 0.570053 10.6631 1.2704V10.728C10.6631 11.4294 10.0925 12 9.39062 12ZM6.00025 9.06935C6.24193 9.06935 6.47783 9.13765 6.68169 9.26743L9.27503 10.9135C9.31233 10.9371 9.35069 10.9487 9.39114 10.9487C9.48046 10.9487 9.61286 10.8788 9.61286 10.728V1.2704C9.61233 1.14956 9.51356 1.05079 9.39272 1.05079H2.60778C2.48642 1.05079 2.38817 1.14956 2.38817 1.2704V10.728C2.38817 10.7911 2.41023 10.8436 2.45384 10.8851C2.52582 10.9539 2.63563 10.9708 2.72599 10.9135L5.31934 9.2669C5.52267 9.13765 5.75857 9.06935 6.00025 9.06935Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_601_1274">
                        <rect width={12} height={12} fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              </div>

              <div className="content-box">
                <h6 className="title">
                  <Link
                    to={
                      buildVehicleCanonicalPath(vehicle) ||
                      `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`
                    }
                    onClick={() => analytics.selectItem(vehicle, index + 1, "Estoque")}
                  >
                    {vehicle.marca} {vehicle.modelo} {vehicle.versao}
                  </Link>
                </h6>

                <div className="text">{renderPrice(vehicle)}</div>

                {/* Especificações (sem ellipsis) */}
                <ul>
                  <li>
                    <i className="flaticon-gasoline-pump" />
                    <span>{vehicle.combustivel || "Flex"}</span>
                  </li>
                  <li>
                    <i className="flaticon-speedometer" />
                    <span>
                      {typeof vehicle.km === "number"
                        ? vehicle.km.toLocaleString("pt-BR") + " km"
                        : vehicle.km || "N/A"}
                    </span>
                  </li>
                  <li>
                    <i className="flaticon-gearbox" />
                    <span>{vehicle.cambio || "Manual"}</span>
                  </li>
                </ul>

                {/* Sem "Disponível em Campinas‑SP" aqui na listagem */}

                <div className="btn-box">
                  <span>{vehicle.ano_modelo || vehicle.ano_fabricacao}</span>
                  <small>{vehicle.promocao ? "Oferta Especial" : ""}</small>
                  <Link
                    to={
                      buildVehicleCanonicalPath(vehicle) ||
                      `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`
                    }
                    className="details"
                    onClick={() => analytics.selectItem(vehicle, index + 1, "Estoque")}
                  >
                    Ver Detalhes
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_601_4346)">
                        <path
                          d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                          fill="#405FF2"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_601_4346">
                          <rect width={14} height={14} />
                        </clipPath>
                      </defs>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="pagination-sec">
        <nav aria-label="Page navigation example">
          <ul className="pagination">
            <Pagination />
          </ul>
          <div className="text">Mostrando resultados 1-30 de 1,415</div>
        </nav>
      </div>
    </div>
  );
}
