// Canonical aponta pro .com.br (domínio oficial). Site .com (Firebase) é um espelho
// técnico usado pra validação paralela enquanto o Motorleads ainda roda no .com.br.
// Quando virarmos o DNS do .com.br pro Firebase, esta constant continua igual.
export const SITE_URL = "https://www.atriaveiculos.com.br";

export const ROUTES = {
  home: "/",
  estoque: "/estoque-carros-usados-seminovos-campinas-sp",
  venderCarro: "/vender-carro-usado-campinas-sp",
  financiamento: "/financiamento-carro-usado-seminovo-campinas-sp",
  sobre: "/sobre-atria-veiculos-campinas-sp",
  blog: "/blog",
  admin: "/admin",
} as const;
