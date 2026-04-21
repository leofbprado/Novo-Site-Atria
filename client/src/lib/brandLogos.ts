// Mapa unificado de logos de marca. Antes existiam dois mapas divergentes
// (Home.BRAND_LOGO_URLS com SVGs locais + Estoque.BRAND_LOGOS com PNGs do
// carlogos.org) que deixavam Jeep/Chevrolet visualmente diferentes entre a
// seção "Escolha por Marca" e o filtro do estoque.
//
// Prioridade: PNGs do carlogos.org (oficiais, coloridos) pras marcas populares.
// Fallback: SVGs locais em /images/brands/ pras marcas chinesas novas que o
// carlogos.org não cobre.
//
// Nota: carlogos.org é host externo. Risco conhecido, aceito hoje porque já era
// usado no Estoque. Backlog: baixar os PNGs localmente num futuro commit.

const CL = "https://www.carlogos.org/car-logos";
const L = "/images/brands";

export const BRAND_LOGOS: Record<string, string> = {
  // Populares — PNGs oficiais do carlogos.org
  "toyota":        `${CL}/toyota-logo.png`,
  "volkswagen":    `${CL}/volkswagen-logo.png`,
  "vw":            `${CL}/volkswagen-logo.png`,
  "chevrolet":     `${CL}/chevrolet-logo.png`,
  "gm":            `${CL}/chevrolet-logo.png`,
  "hyundai":       `${CL}/hyundai-logo.png`,
  "bmw":           `${CL}/bmw-logo.png`,
  "honda":         `${CL}/honda-logo.png`,
  "fiat":          `${CL}/fiat-logo.png`,
  "ford":          `${CL}/ford-logo.png`,
  "jeep":          `${CL}/jeep-logo.png`,
  "renault":       `${CL}/renault-logo.png`,
  "nissan":        `${CL}/nissan-logo.png`,
  "peugeot":       `${CL}/peugeot-logo.png`,
  "citroen":       `${CL}/citroen-logo.png`,
  "citroën":       `${CL}/citroen-logo.png`,
  "mitsubishi":    `${CL}/mitsubishi-logo.png`,
  "audi":          `${CL}/audi-logo.png`,
  "mercedes":      `${CL}/mercedes-benz-logo.png`,
  "mercedes-benz": `${CL}/mercedes-benz-logo.png`,
  "kia":           `${CL}/kia-logo.png`,
  "volvo":         `${CL}/volvo-logo.png`,
  "suzuki":        `${CL}/suzuki-logo.png`,
  "caoa":          `${CL}/chery-logo.png`,
  "caoa chery":    `${CL}/chery-logo.png`,
  "caoa-chery":    `${CL}/chery-logo.png`,
  "chery":         `${CL}/chery-logo.png`,
  "byd":           `${CL}/byd-logo.png`,
  "ram":           `${CL}/ram-trucks-logo.png`,
  "dodge":         `${CL}/dodge-logo.png`,
  "jac":           `${CL}/jac-motors-logo.png`,
  "jac motors":    `${CL}/jac-motors-logo.png`,
  "gwm":           `${CL}/great-wall-logo.png`,
  "haval":         `${CL}/great-wall-logo.png`,
  "land rover":    `${CL}/land-rover-logo.png`,
  "porsche":       `${CL}/porsche-logo.png`,
  "lexus":         `${CL}/lexus-logo.png`,
  "subaru":        `${CL}/subaru-logo.png`,
  "mini":          `${CL}/mini-logo.png`,

  // Marcas chinesas novas — fallback pros SVGs locais (carlogos não cobre)
  "mg":            `${L}/mg.svg`,
  "changan":       `${L}/changan.svg`,
  "jetour":        `${L}/jetour.svg`,
  "jaecoo":        `${L}/jaecoo.svg`,
  "omoda":         `${L}/omoda.svg`,
  "gac":           `${L}/gac.svg`,
  "avatr":         `${L}/avatr.svg`,
  "denza":         `${L}/denza.svg`,
  "xpeng":         `${L}/xpeng.svg`,
  "zeekr":         `${L}/zeekr.svg`,
};

export function brandLogoFor(name: string): string {
  return BRAND_LOGOS[name.trim().toLowerCase()] || "";
}
