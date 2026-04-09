import { useEffect } from "react";
import { useRoute } from "wouter";
import { getVehicles, vehiclePath } from "@/lib/firestore";
import { ROUTES } from "@/lib/constants";

/**
 * Captura URLs antigas do Motorleads no padrão:
 *   /campinas-sp/veiculo-seminovo-usado-atria/comprar-MODELO-MARCA-ID-usado-seminovo-campinas-sp
 *   /campinas-sp/veiculo-seminovo-usado-atria/comprar-CRUZE-CHEVROLET-12345-usado-seminovo-campinas-sp
 *
 * Estratégia:
 *   1. Tenta extrair marca e modelo do slug Motorleads (regex tolerante).
 *   2. Busca no Firestore o veículo equivalente publicado.
 *   3. Se achar → window.location.replace para a URL nova (soft 301).
 *   4. Se não achar → redireciona pro Estoque com filtro de marca pré-aplicado
 *      (preserva intenção de busca, evita 404).
 *
 * Marcas conhecidas (padrão Motorleads tem marca em CAIXA ALTA — ex: CHEVROLET, FIAT).
 * Lista mantida pequena de propósito, são as marcas que a Átria opera.
 */
const KNOWN_BRANDS = [
  "TOYOTA", "VOLKSWAGEN", "VW", "CHEVROLET", "GM", "HYUNDAI", "BMW", "HONDA",
  "FIAT", "FORD", "JEEP", "RENAULT", "NISSAN", "PEUGEOT", "CITROEN",
  "MITSUBISHI", "AUDI", "MERCEDES", "MERCEDES-BENZ", "KIA", "VOLVO", "SUZUKI",
  "CHERY", "BYD", "RAM", "DODGE", "JAC", "GWM", "HAVAL", "LAND", "PORSCHE",
  "LEXUS", "SUBARU", "CAOA",
];

function parseMotorleadsSlug(slug: string): { marca?: string; modelo?: string } {
  // Remove prefixo "comprar-" e sufixos "-usado-seminovo-campinas-sp", "-usado-seminovo", "-campinas-sp"
  const cleaned = slug
    .toLowerCase()
    .replace(/^comprar-/, "")
    .replace(/-usado-seminovo-campinas-sp$/, "")
    .replace(/-usado-seminovo$/, "")
    .replace(/-campinas-sp$/, "")
    .replace(/-\d{4,}$/, ""); // remove ID numérico no final

  const tokens = cleaned.split("-").filter(Boolean);

  // Procura uma marca conhecida em qualquer posição
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
    return {};
  }

  // Os tokens antes da marca são (provavelmente) o modelo no padrão Motorleads
  // (MODELO-MARCA-ID). Se não houver tokens antes, tenta os tokens depois.
  const modeloTokens = brandIdx > 0 ? tokens.slice(0, brandIdx) : tokens.slice(brandIdx + 1);
  const modelo = modeloTokens.join(" ");

  // Normaliza marca pra capitalizada — Firestore guarda assim (Volkswagen, não VOLKSWAGEN)
  const marcaCapitalized = brand.charAt(0) + brand.slice(1).toLowerCase();

  return { marca: marcaCapitalized, modelo };
}

export default function MotorleadsRedirect() {
  const [, params] = useRoute<{ slug: string }>("/campinas-sp/veiculo-seminovo-usado-atria/:slug");

  useEffect(() => {
    const slug = params?.slug || "";
    if (!slug) {
      window.location.replace(ROUTES.estoque);
      return;
    }

    const { marca, modelo } = parseMotorleadsSlug(slug);

    (async () => {
      try {
        // Tenta buscar veículos da marca extraída
        const vehicles = marca ? await getVehicles({ marca }) : await getVehicles();

        // Match fuzzy por modelo: procura veículo cujo modelo contenha (ou seja contido) no parsed
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

        // Se não achou pelo modelo, pega o primeiro da marca (melhor que mandar pro estoque genérico)
        if (!match && vehicles.length > 0) {
          match = vehicles[0];
        }

        if (match) {
          window.location.replace(vehiclePath(match));
        } else if (marca) {
          // Sem match — pelo menos preserva a marca como filtro
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
