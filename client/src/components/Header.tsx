import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Estoque", href: "/vehicles" },
    { label: "Sobre", href: "#about" },
    { label: "Contato", href: "#contact" },
  ];

  const whatsappLink = "https://wa.me/5519999999999";

  return (
    <header className="sticky top-0 z-50 bg-atria-dark/95 backdrop-blur-md border-b border-atria-blue-deep/40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <span className="font-barlow-condensed text-2xl font-bold tracking-wider uppercase text-white">
            Átria
          </span>
          <span className="font-barlow text-2xl font-light tracking-widest text-atria-gold">
            Veículos
          </span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-barlow text-gray-300 hover:text-atria-gold transition-colors text-sm font-medium tracking-wide uppercase"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 bg-atria-blue-deep hover:bg-atria-blue-mid text-white px-5 py-2.5 rounded font-barlow text-sm font-semibold tracking-wide uppercase transition-all border border-atria-gold/30 hover:border-atria-gold/60"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-atria-gold"
          aria-label="Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-atria-blue-deep/40 bg-atria-dark overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-barlow text-gray-300 hover:text-atria-gold hover:bg-atria-blue-deep/20 transition-all py-3 px-2 rounded text-sm font-medium tracking-wide uppercase"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-atria-blue-deep text-white px-4 py-3 rounded font-barlow font-semibold tracking-wide uppercase text-sm mt-3 border border-atria-gold/30"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
