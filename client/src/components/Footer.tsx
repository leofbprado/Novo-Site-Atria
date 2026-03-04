import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappLink = "https://wa.me/5519999999999";

  return (
    <footer className="bg-[#080e1c] border-t border-atria-blue-deep/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Empresa */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="font-barlow-condensed text-2xl font-bold tracking-wider uppercase text-white">
                Átria
              </span>
              <span className="font-barlow text-2xl font-light tracking-widest text-atria-gold ml-2">
                Veículos
              </span>
            </div>
            <p className="font-barlow text-gray-400 text-sm leading-relaxed">
              Confiança, qualidade e excelência em veículos premium. Referência
              em Campinas desde 2010.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-barlow-condensed text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Links Rápidos
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Início", href: "/" },
                { label: "Estoque", href: "/vehicles" },
                { label: "Sobre", href: "#about" },
                { label: "Contato", href: "#contact" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="font-barlow text-gray-400 hover:text-atria-gold text-sm transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-barlow-condensed text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-atria-gold flex-shrink-0" />
                <a
                  href="tel:+5519999999999"
                  className="font-barlow text-gray-400 hover:text-atria-gold text-sm transition-colors"
                >
                  +55 (19) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-atria-gold flex-shrink-0" />
                <a
                  href="mailto:contato@atriaveiculos.com.br"
                  className="font-barlow text-gray-400 hover:text-atria-gold text-sm transition-colors"
                >
                  contato@atriaveiculos.com.br
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-atria-gold flex-shrink-0 mt-0.5" />
                <span className="font-barlow text-gray-400 text-sm">
                  Campinas, São Paulo, Brasil
                </span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-barlow-condensed text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Redes Sociais
            </h4>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/atriaveiculos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2.5 bg-atria-blue-deep/30 rounded border border-atria-blue-deep/50 hover:bg-atria-blue-deep hover:border-atria-gold/50 text-gray-400 hover:text-atria-gold transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com/atriaveiculos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2.5 bg-atria-blue-deep/30 rounded border border-atria-blue-deep/50 hover:bg-atria-blue-deep hover:border-atria-gold/50 text-gray-400 hover:text-atria-gold transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="p-2.5 bg-atria-blue-deep/30 rounded border border-atria-blue-deep/50 hover:bg-atria-blue-deep hover:border-atria-gold/50 text-gray-400 hover:text-atria-gold transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-atria-blue-deep/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-barlow text-gray-500 text-sm">
            © {currentYear} Átria Veículos. Todos os direitos reservados.
          </p>
          <p className="font-barlow text-gray-600 text-xs">
            Campinas, São Paulo — CNPJ 00.000.000/0001-00
          </p>
        </div>
      </div>
    </footer>
  );
}
