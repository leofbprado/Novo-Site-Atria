import { useEffect } from "react";
import { useRoute } from "wouter";
import { getVehicles, getVehicleByAutoconfId, vehiclePath } from "@/lib/firestore";
import { ROUTES } from "@/lib/constants";

/**
 * Captura URLs antigas do Motorleads no padrão real (confirmado por amostras):
 *   /campinas-sp/veiculo-seminovo-usado-atria/comprar-{MODELO}-{MARCA}-{ID}-usado-seminovo-campinas-sp
 *
 * Exemplos reais:
 *   comprar-arrizo-chery-1096972-usado-seminovo-campinas-sp
 *   comprar-cruze-chevrolet-1104499-usado-seminovo-campinas-sp
 *   comprar-renegade-jeep-1108303-usado-seminovo-campinas-sp
 *
 * Estratégia em 3 níveis:
 *   1. **MATCH EXATO POR ID** — extrai o ID numérico (ex: 1096972) e busca direto
 *      no Firestore. O `autoconf_id` é o próprio doc.id, então é uma única leitura.
 *      Funciona pra qualquer carro publicado, mesmo que slug ou modelo tenham mudado.
 *   2. **FALLBACK FUZZY** — se ID não achou (carro vendido / despublicado), parseia
 *      marca+modelo e busca no estoque atual. Pode achar um carro similar.
 *   3. **FALLBACK FINAL** — sem nenhum match, redireciona pro estoque com filtro
 *      de marca pré-aplicado (preserva intenção de busca).
 */
const KNOWN_BRANDS = [
  "TOYOTA", "VOLKSWAGEN", "VW", "CHEVROLET", "GM", "HYUNDAI", "BMW", "HONDA",
  "FIAT", "FORD", "JEEP", "RENAULT", "NISSAN", "PEUGEOT", "CITROEN",
  "MITSUBISHI", "AUDI", "MERCEDES", "MERCEDES-BENZ", "KIA", "VOLVO", "SUZUKI",
  "CHERY", "BYD", "RAM", "DODGE", "JAC", "GWM", "HAVAL", "LAND", "PORSCHE",
  "LEXUS", "SUBARU", "CAOA",
];

interface ParsedSlug {
  id?: string;
  marca?: string;
  modelo?: string;
}

function parseMotorleadsSlug(slug: string): ParsedSlug {
  // Slug bruto: comprar-arrizo-chery-1096972-usado-seminovo-campinas-sp
  // 1. Remove prefixo "comprar-" e sufixo "-usado-seminovo-campinas-sp"
  const stripped = slug
    .toLowerCase()
    .replace(/^comprar-/, "")
    .replace(/-usado-seminovo-campinas-sp$/, "")
    .replace(/-usado-seminovo$/, "")
    .replace(/-campinas-sp$/, "");
  // Resultado: arrizo-chery-1096972

  // 2. Extrai o ID numérico (4+ dígitos no final)
  const idMatch = stripped.match(/-(\d{4,})$/);
  const id = idMatch ? idMatch[1] : undefined;
  const withoutId = idMatch ? stripped.slice(0, -idMatch[0].length) : stripped;
  // Resultado: arrizo-chery

  // 3. Tokeniza e procura marca conhecida
  const tokens = withoutId.split("-").filter(Boolean);
  let brandIdx = -1;
  let brand = "";
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].toUpperCase();
    if (KNOWN_BRANDS.includes(t)) {
      brandIdx = i;
      brand = t;
      break;
    }
  }

  if (brandIdx === -1) {
    return { id };
  }

  // No padrão Motorleads o modelo vem ANTES da marca (modelo-marca-id)
  const modeloTokens = brandIdx > 0 ? tokens.slice(0, brandIdx) : tokens.slice(brandIdx + 1);
  const modelo = modeloTokens.join(" ");

  // Normaliza marca pra capitalizada — Firestore guarda assim (Volkswagen, não VOLKSWAGEN)
  const marcaCapitalized = brand.charAt(0) + brand.slice(1).toLowerCase();

  return { id, marca: marcaCapitalized, modelo };
}

export default function MotorleadsRedirect() {
  const [, params] = useRoute<{ slug: string }>("/campinas-sp/veiculo-seminovo-usado-atria/:slug");

  useEffect(() => {
    const slug = params?.slug || "";
    if (!slug) {
      window.location.replace(ROUTES.estoque);
      return;
    }

    const { id, marca, modelo } = parseMotorleadsSlug(slug);

    (async () => {
      try {
        // 1. Match exato por ID (melhor cenário — uma única leitura)
        if (id) {
          const exact = await getVehicleByAutoconfId(id);
          if (exact) {
            window.location.replace(vehiclePath(exact));
            return;
          }
        }

        // 2. Fallback fuzzy: busca por marca, depois match por modelo
        const vehicles = marca ? await getVehicles({ marca }) : await getVehicles();

        let match = null;
        if (modelo) {
          const modeloNorm = modelo.toLowerCase().trim();
          match = vehicles.find((v) => {
            const vModelo = (v.modelo || "").toLowerCase();
            return vModelo === modeloNorm
              || vModelo.includes(modeloNorm)
              || modeloNorm.includes(vModelo);
          });
        }

        if (match) {
          window.location.replace(vehiclePath(match));
          return;
        }

        // 3. Fallback final: só aplica filtro de marca SE houver carros dessa marca.
        // Senão joga pro estoque geral (evita tela "Nenhum veículo encontrado").
        if (marca && vehicles.length > 0) {
          window.location.replace(`${ROUTES.estoque}?marca=${encodeURIComponent(marca)}`);
        } else {
          window.location.replace(ROUTES.estoque);
        }
      } catch {
        window.location.replace(ROUTES.estoque);
      }
    })();
  }, [params?.slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-atria-gray-light">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-atria-navy/15 border-t-atria-navy animate-spin" />
        <p className="font-inter text-atria-text-gray text-sm">Atualizando endereço...</p>
      </div>
    </div>
  );
}
