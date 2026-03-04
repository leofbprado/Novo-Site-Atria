import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Phone, MessageCircle, Shield, Star, Clock, Award } from "lucide-react";
import { getFeaturedVehicles, type Vehicle } from "@/lib/firestore";

// Mock data for fallback when Firebase is not configured
const mockVehicles: Vehicle[] = [
  {
    id: "1",
    marca: "BMW",
    modelo: "X5",
    ano: 2023,
    preco: 350000,
    km: 5000,
    cor: "Preto",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: ["https://images.unsplash.com/photo-1553882900-d5160ca3fc10?w=600&q=80"],
    descricao: "BMW X5 2023 impecável, revisões em dia, único dono",
    destaque: true,
    slug: "bmw-x5-2023",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    marca: "Mercedes-Benz",
    modelo: "C300",
    ano: 2022,
    preco: 250000,
    km: 15000,
    cor: "Prata",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80"],
    descricao: "Mercedes-Benz C300 2022, interior de luxo, pacote AMG",
    destaque: true,
    slug: "mercedes-c300-2022",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    marca: "Audi",
    modelo: "A4",
    ano: 2023,
    preco: 280000,
    km: 8000,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80"],
    descricao: "Audi A4 2023 com tecnologia de ponta, teto panorâmico",
    destaque: true,
    slug: "audi-a4-2023",
    createdAt: new Date("2024-01-05"),
  },
];

const diferenciais = [
  { icon: Shield, title: "Garantia Inclusa", desc: "Todos os veículos com garantia de procedência" },
  { icon: Star, title: "Qualidade Premium", desc: "Seleção rigorosa e inspeção técnica completa" },
  { icon: Clock, title: "Atendimento Ágil", desc: "Resposta rápida via WhatsApp 24/7" },
  { icon: Award, title: "13+ Anos", desc: "Referência em Campinas desde 2010" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

export function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedVehicles()
      .then((data) => setVehicles(data.length > 0 ? data : mockVehicles))
      .catch(() => setVehicles(mockVehicles))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-atria-dark">
        <div className="absolute inset-0 bg-gradient-to-br from-atria-blue-deep/30 via-atria-dark to-[#080e1c]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-atria-blue-deep rounded-full filter blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-atria-gold/40 rounded-full filter blur-[100px]" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-atria-gold to-transparent" />

        <div className="relative container mx-auto px-4 py-24 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl"
          >
            <motion.p
              variants={fadeUp}
              className="font-barlow-condensed text-atria-gold text-sm uppercase tracking-[0.3em] mb-4"
            >
              Campinas · São Paulo · Brasil
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-barlow-condensed text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight uppercase tracking-tight"
            >
              <span className="text-white">Veículos </span>
              <span className="text-atria-gold">Premium</span>
              <br />
              <span className="text-white text-4xl md:text-6xl lg:text-7xl font-light tracking-widest">
                com Confiança
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="font-barlow text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Há mais de 13 anos oferecemos os melhores veículos semi-novos e novos
              para você. Qualidade, transparência e atendimento excepcional.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="/vehicles"
                className="inline-flex items-center justify-center gap-2 bg-atria-blue-deep hover:bg-atria-blue-mid text-white px-8 py-4 rounded font-barlow font-semibold text-base uppercase tracking-widest transition-all border border-atria-gold/40 hover:border-atria-gold shadow-lg shadow-atria-blue-deep/30"
              >
                Ver Estoque
                <ChevronRight size={18} />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="https://wa.me/5519999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-atria-gold text-atria-gold hover:bg-atria-gold hover:text-atria-dark px-8 py-4 rounded font-barlow font-semibold text-base uppercase tracking-widest transition-all"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="w-5 h-9 border-2 border-atria-gold/50 rounded-full flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-atria-gold rounded-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== DIFERENCIAIS ===== */}
      <section className="py-16 bg-atria-blue-deep border-y border-atria-gold/20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {diferenciais.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="p-3 bg-atria-gold/10 rounded-full border border-atria-gold/30">
                  <Icon size={24} className="text-atria-gold" />
                </div>
                <h3 className="font-barlow-condensed text-white font-semibold uppercase tracking-wide text-sm">
                  {title}
                </h3>
                <p className="font-barlow text-blue-200/60 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== DESTAQUES ===== */}
      <section className="py-20 bg-atria-dark">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-barlow-condensed text-atria-gold text-xs uppercase tracking-[0.3em] mb-3">
              Seleção especial
            </p>
            <h2 className="font-barlow-condensed text-4xl md:text-5xl font-bold uppercase text-white">
              Veículos em <span className="text-atria-gold">Destaque</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-atria-blue-deep/10 border border-atria-blue-deep/30 rounded-lg h-80 animate-pulse"
                  />
                ))
              : vehicles.slice(0, 3).map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    className="group bg-[#0d1530] border border-atria-blue-deep/40 rounded-lg overflow-hidden hover:border-atria-gold/50 transition-all duration-300"
                  >
                    <div className="relative h-52 overflow-hidden bg-atria-blue-deep/20">
                      <img
                        src={
                          vehicle.fotos[0] ||
                          "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&q=80"
                        }
                        alt={`${vehicle.marca} ${vehicle.modelo}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-atria-blue-deep/90 backdrop-blur-sm text-atria-gold px-2.5 py-1 rounded text-xs font-barlow-condensed font-semibold uppercase tracking-wider border border-atria-gold/30">
                        {vehicle.ano}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1530] via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="p-5">
                      <h3 className="font-barlow-condensed text-xl font-bold text-white uppercase tracking-wide mb-1">
                        {vehicle.marca} {vehicle.modelo}
                      </h3>
                      <p className="font-barlow text-gray-400 text-sm mb-4 line-clamp-2">
                        {vehicle.descricao}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-barlow">
                        <div className="bg-atria-blue-deep/20 rounded px-2 py-1.5">
                          <p className="text-gray-500 mb-0.5">KM</p>
                          <p className="text-white font-semibold">
                            {vehicle.km.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className="bg-atria-blue-deep/20 rounded px-2 py-1.5">
                          <p className="text-gray-500 mb-0.5">Câmbio</p>
                          <p className="text-white font-semibold">{vehicle.cambio}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-atria-blue-deep/40 pt-4">
                        <div>
                          <p className="font-barlow text-gray-500 text-xs mb-0.5">Preço</p>
                          <p className="font-barlow-condensed text-2xl font-bold text-atria-gold">
                            R$ {vehicle.preco.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <a
                          href={`/vehicles/${vehicle.slug}`}
                          className="bg-atria-blue-deep hover:bg-atria-blue-mid text-white px-4 py-2 rounded font-barlow text-sm font-semibold uppercase tracking-wider transition-colors border border-atria-gold/20 hover:border-atria-gold/50"
                        >
                          Ver
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <a
              href="/vehicles"
              className="inline-flex items-center gap-2 font-barlow text-atria-gold hover:text-white font-semibold uppercase tracking-widest text-sm transition-colors group"
            >
              Ver todo o estoque
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ===== SOBRE ===== */}
      <section
        id="about"
        className="py-20 bg-[#080e1c] border-t border-atria-blue-deep/30"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="font-barlow-condensed text-atria-gold text-xs uppercase tracking-[0.3em] mb-3">
                Nossa história
              </p>
              <h2 className="font-barlow-condensed text-4xl md:text-5xl font-bold uppercase text-white mb-6">
                Sobre a <span className="text-atria-gold">Átria Veículos</span>
              </h2>
              <p className="font-barlow text-gray-300 text-base mb-4 leading-relaxed">
                Desde 2010, a Átria Veículos é sinônimo de confiança e qualidade na região
                de Campinas. Com mais de uma década de experiência, oferecemos uma seleção
                premium de veículos cuidadosamente inspecionados.
              </p>
              <p className="font-barlow text-gray-400 text-base mb-8 leading-relaxed">
                Nossa missão é proporcionar a melhor experiência de compra, com transparência
                total e suporte em cada etapa. Trabalhamos com marcas premium e garantimos
                a procedência de cada veículo.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "13+", label: "Anos de Experiência" },
                  { value: "800+", label: "Clientes Satisfeitos" },
                  { value: "100%", label: "Transparência" },
                  { value: "24/7", label: "Suporte WhatsApp" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="bg-atria-blue-deep/20 border border-atria-blue-deep/50 rounded-lg p-4 hover:border-atria-gold/40 transition-colors"
                  >
                    <p className="font-barlow-condensed text-3xl font-bold text-atria-gold">
                      {value}
                    </p>
                    <p className="font-barlow text-gray-400 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative bg-gradient-to-br from-atria-blue-deep/30 to-atria-dark rounded-lg border border-atria-blue-deep/40 overflow-hidden p-8">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-atria-gold to-transparent" />
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Qualidade", desc: "Inspeção rigorosa em todos os veículos" },
                    { label: "Confiança", desc: "Garantia incluída na compra" },
                    { label: "Suporte", desc: "Atendimento personalizado" },
                    { label: "Transparência", desc: "Histórico completo do veículo" },
                  ].map(({ label, desc }) => (
                    <div
                      key={label}
                      className="bg-atria-dark/60 rounded-lg p-4 border border-atria-blue-deep/30"
                    >
                      <p className="font-barlow-condensed text-atria-gold text-sm font-semibold uppercase tracking-wide mb-1">
                        {label}
                      </p>
                      <p className="font-barlow text-gray-300 text-sm">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA WHATSAPP ===== */}
      <section id="contact" className="py-20 bg-atria-blue-deep relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-atria-blue-deep via-atria-blue-mid to-atria-blue-deep" />
        <div className="absolute top-0 left-0 right-0 h-px bg-atria-gold/40" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-atria-gold/40" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-atria-gold rounded-full filter blur-[80px]" />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <p className="font-barlow-condensed text-atria-gold text-xs uppercase tracking-[0.3em] mb-4">
              Fale conosco
            </p>
            <h2 className="font-barlow-condensed text-4xl md:text-5xl font-bold uppercase text-white mb-4">
              Pronto para o seu próximo veículo?
            </h2>
            <p className="font-barlow text-blue-100/80 text-lg mb-10">
              Nossa equipe está pronta para te ajudar a encontrar o veículo ideal.
              Resposta rápida garantida!
            </p>

            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/5519999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-atria-gold hover:bg-atria-gold-hover text-atria-dark px-10 py-4 rounded font-barlow font-bold text-lg uppercase tracking-widest transition-all shadow-xl shadow-atria-gold/20"
            >
              <MessageCircle size={22} />
              Iniciar Conversa
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ===== LOCALIZAÇÃO ===== */}
      <section className="py-20 bg-atria-dark border-t border-atria-blue-deep/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="font-barlow-condensed text-atria-gold text-xs uppercase tracking-[0.3em] mb-3">
              Onde estamos
            </p>
            <h2 className="font-barlow-condensed text-4xl md:text-5xl font-bold uppercase text-white">
              Nos Encontre em <span className="text-atria-gold">Campinas</span>
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-[#0d1530] border border-atria-blue-deep/40 rounded-lg overflow-hidden"
          >
            <div className="h-px bg-gradient-to-r from-atria-blue-deep via-atria-gold to-atria-blue-deep" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 border-b md:border-b-0 md:border-r border-atria-blue-deep/30">
                <h3 className="font-barlow-condensed text-xl font-bold text-white uppercase tracking-wide mb-6">
                  Endereço
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-atria-gold mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-barlow text-gray-500 text-xs mb-1">Localização</p>
                      <p className="font-barlow text-white text-sm font-medium">
                        Campinas, SP
                        <br />
                        CEP 13013-000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-atria-gold mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-barlow text-gray-500 text-xs mb-1">Telefone</p>
                      <a
                        href="tel:+5519999999999"
                        className="font-barlow text-white text-sm font-medium hover:text-atria-gold transition-colors"
                      >
                        +55 (19) 99999-9999
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="text-atria-gold mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-barlow text-gray-500 text-xs mb-1">WhatsApp</p>
                      <a
                        href="https://wa.me/5519999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-barlow text-atria-gold text-sm font-medium hover:text-white transition-colors"
                      >
                        Abrir Chat →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="font-barlow-condensed text-xl font-bold text-white uppercase tracking-wide mb-6">
                  Horário
                </h3>
                <div className="space-y-3 font-barlow text-sm">
                  {[
                    { dia: "Segunda a Sexta", hora: "09:00 – 19:00" },
                    { dia: "Sábado", hora: "09:00 – 17:00" },
                    { dia: "Domingo", hora: "Fechado" },
                  ].map(({ dia, hora }) => (
                    <div
                      key={dia}
                      className="flex justify-between items-center py-2 border-b border-atria-blue-deep/20 last:border-0"
                    >
                      <span className="text-gray-400">{dia}</span>
                      <span
                        className={
                          hora === "Fechado"
                            ? "text-gray-600 font-medium"
                            : "text-atria-gold font-semibold"
                        }
                      >
                        {hora}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-atria-blue-deep/20 border border-atria-blue-deep/40 rounded-lg">
                  <p className="font-barlow-condensed text-atria-gold text-xs font-semibold uppercase tracking-wider mb-1">
                    WhatsApp 24/7
                  </p>
                  <p className="font-barlow text-gray-400 text-sm">
                    Dúvidas e agendamentos a qualquer hora.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
