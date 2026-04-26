import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Heart } from "lucide-react";
import { vehiclePath, type Vehicle } from "@/lib/firestore";
import { getPrecoExibicao, parcelaParaPreco, SIM_PRAZO } from "@/lib/preco";
import { TagBadge } from "@/components/TagBadge";

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtKm = (n: number) => `${n.toLocaleString("pt-BR")} km`;

const ENTRADA_PCT = 0.4;

export function VehicleCard({ v }: { v: Vehicle }) {
  const titulo = v.titulo ?? `${v.marca} ${v.modelo}`;
  const { precoFinal, precoCheio, emPromocao } = getPrecoExibicao(v);
  const desconto = precoCheio ? precoCheio - precoFinal : 0;
  const parcelaEst = parcelaParaPreco(precoFinal, precoFinal * ENTRADA_PCT);
  const [favorited, setFavorited] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl overflow-hidden border border-atria-gray-medium hover:shadow-lg transition-shadow"
      itemScope itemType="https://schema.org/Car"
    >
      <a href={vehiclePath(v)} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-atria-gray-light">
          {v.fotos?.[0] ? (
            <img
              src={v.fotos[0]}
              alt={`${titulo} – ${v.cor} – ${fmtKm(v.km)}`}
              width={800} height={600}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              itemProp="image"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Car size={48} className="text-atria-gray-medium" />
            </div>
          )}

          {(() => {
            const primeiraTag = (v.tags || []).find((t) => t !== "oferta");
            const tagFinal = emPromocao ? "oferta" : primeiraTag ?? null;
            if (!tagFinal) return null;
            return (
              <div className="absolute top-3 left-3">
                <TagBadge tag={tagFinal} />
              </div>
            );
          })()}

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFavorited((s) => !s); }}
            aria-label={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
            aria-pressed={favorited}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              size={16}
              strokeWidth={2}
              className={favorited ? "fill-atria-navy text-atria-navy" : "text-atria-text-gray"}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-inter text-[10px] font-bold text-atria-text-gray uppercase tracking-[0.15em]">{v.marca}</span>
            <span className="text-atria-gray-medium">·</span>
            <span className="font-inter text-[10px] font-medium text-atria-text-gray">{v.ano}</span>
          </div>
          <h3 className="font-barlow-condensed font-bold text-lg sm:text-xl text-atria-text-dark leading-tight group-hover:text-atria-navy transition-colors" itemProp="name">
            {titulo}
          </h3>
          {v.versao && (
            <div className="font-inter text-[11px] text-atria-text-gray mt-0.5 line-clamp-1">{v.versao}</div>
          )}

          {emPromocao && precoCheio && (
            <div className="flex items-center gap-2 mt-3 mb-1">
              <span className="font-inter text-xs text-atria-text-gray line-through font-medium">{fmt(precoCheio)}</span>
              <span className="font-inter text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {fmt(-desconto)}
              </span>
            </div>
          )}

          <div className={`flex items-baseline gap-2.5 flex-wrap ${emPromocao ? "" : "mt-3"}`} itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <span
              className="font-barlow-condensed font-black text-[26px] sm:text-3xl text-atria-navy leading-none tabular-nums tracking-tight"
              itemProp="price"
              content={String(precoFinal)}
            >
              {fmt(precoFinal)}
            </span>
            <span className="text-atria-gray-medium font-light text-lg leading-none">|</span>
            <span className="font-inter text-sm font-bold text-atria-text-dark leading-none whitespace-nowrap">
              {fmtKm(v.km)}
            </span>
            <meta itemProp="priceCurrency" content="BRL" />
            <meta itemProp="availability" content="https://schema.org/InStock" />
          </div>
        </div>

        <div className="border-t border-dashed border-atria-gray-medium bg-atria-gray-light/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-inter text-[11px] text-atria-text-gray font-medium">Est.</span>
              <span className="font-barlow-condensed font-black text-base text-atria-text-dark tabular-nums">{fmt(parcelaEst)}</span>
              <span className="font-inter text-xs font-bold text-atria-text-gray">/mês*</span>
            </div>
            <span className="font-inter text-[10px] text-atria-text-gray font-medium">{Math.round(ENTRADA_PCT * 100)}% entrada · {SIM_PRAZO}x</span>
          </div>
          <p className="font-inter text-[10px] text-atria-text-gray/80 mt-1.5 text-right italic">
            * Sujeito a aprovação de crédito
          </p>
        </div>
      </a>
    </motion.article>
  );
}

export default VehicleCard;
