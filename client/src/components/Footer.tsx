import { ROUTES } from "@/lib/constants";

const LOGO_BRANCO = "https://i.postimg.cc/25m34dvJ/Logo_%C3%81tria_Branco.png";
const WA = "https://wa.me/5519996525211";

const LOJAS = [
  {
    nome: "Loja Abolição",
    endereco: "Rua Abolição, 1500 – VL Joaquim Inácio",
    cidade: "Campinas-SP · CEP 13045-750",
    tel: "(19) 3199-2552",
  },
  {
    nome: "Loja Campos Elíseos",
    endereco: "R. Domício Pacheco e Silva, 1328 – Jd Campos Elíseos",
    cidade: "Campinas-SP · CEP 13060-190",
    tel: "(19) 3500-8271",
  },
  {
    nome: "Loja Guanabara",
    endereco: "Av. Brasil, 1277 – Jd Guanabara",
    cidade: "Campinas-SP · CEP 13070-178",
    tel: "(19) 3094-0015",
  },
];

const LINKS = {
  institucional: [
    { label: "Sobre a Átria", href: ROUTES.sobre },
    { label: "Nossas Lojas", href: `${ROUTES.sobre}#lojas` },
    { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
    { label: "Blog", href: "/blog" },
  ],
  atendimento: [
    { label: "WhatsApp", href: WA },
    { label: "Contato", href: `${ROUTES.sobre}#contato` },
    { label: "Financiamento", href: ROUTES.financiamento },
    { label: "Avaliação do Seu Carro", href: "/avaliacao" },
  ],
  veiculos: [
    { label: "Todos os Veículos", href: ROUTES.estoque },
    { label: "SUVs e Crossovers", href: `${ROUTES.estoque}?tipo=suv` },
    { label: "Sedans", href: `${ROUTES.estoque}?tipo=sedan` },
    { label: "Picapes", href: `${ROUTES.estoque}?tipo=pickup` },
  ],
};

export function Footer() {
  return (
    <footer className="bg-atria-navy-dark text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img src={LOGO_BRANCO} alt="Átria Veículos" className="h-10 w-auto object-contain" />
            </div>
            <p className="font-inter text-sm text-white/60 leading-relaxed mb-5">
              Há mais de 12 anos levando qualidade, transparência e as melhores condições para quem quer comprar um veículo em Campinas.
            </p>
            <div className="flex gap-3">
              {[
                {
                  label: "Instagram",
                  href: "https://instagram.com/atriaveiculosoficial",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  href: "https://facebook.com/atriaveiculos",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  href: WA,
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                    </svg>
                  ),
                },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 border border-white/20 rounded hover:border-atria-yellow hover:text-atria-yellow text-white/60 transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-barlow-condensed font-bold uppercase tracking-widest text-sm text-atria-yellow mb-5">
              Institucional
            </h4>
            <ul className="space-y-2.5">
              {LINKS.institucional.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="font-inter text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Veículos */}
          <div>
            <h4 className="font-barlow-condensed font-bold uppercase tracking-widest text-sm text-atria-yellow mb-5">
              Veículos
            </h4>
            <ul className="space-y-2.5">
              {LINKS.veiculos.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="font-inter text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Lojas */}
          <div>
            <h4 className="font-barlow-condensed font-bold uppercase tracking-widest text-sm text-atria-yellow mb-5">
              Nossas Lojas
            </h4>
            <div className="space-y-5">
              {LOJAS.map((loja) => (
                <div key={loja.nome}>
                  <p className="font-inter font-semibold text-sm text-white mb-0.5">{loja.nome}</p>
                  <p className="font-inter text-xs text-white/50 leading-relaxed">
                    {loja.endereco}
                    <br />
                    {loja.cidade}
                  </p>
                  <a
                    href={`tel:${loja.tel.replace(/\D/g, "")}`}
                    className="font-inter text-xs text-atria-yellow hover:text-atria-yellow-light transition-colors mt-0.5 inline-block"
                  >
                    {loja.tel}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-white/40 text-xs font-inter">
          <p>© {new Date().getFullYear()} Átria Veículos. Todos os direitos reservados.</p>
          <p>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="hover:text-atria-yellow transition-colors">
              (19) 99652-5211
            </a>
            {" · "}Campinas, São Paulo
          </p>
        </div>
      </div>
    </footer>
  );
}
