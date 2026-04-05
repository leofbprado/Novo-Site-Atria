import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin, Phone, Clock, Target, Eye, Heart,
  Award, Car, Store, Star, Calendar,
  BookOpen, Lightbulb, ShieldCheck, Users,
} from "lucide-react";

const WA_NUMBER = "5519996525211";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

// ---- SEO -------------------------------------------------------------------
import { useSEO } from "@/hooks/useSEO";
import { ROUTES } from "@/lib/constants";

function usePageSEO() {
  useSEO({
    title: "Sobre a Átria Veículos | Loja de Seminovos em Campinas SP há 13 Anos",
    description: "Átria Veículos: há mais de 13 anos no mercado automotivo em Campinas-SP. 3 lojas, mais de 10.000 veículos vendidos. Confiança e transparência.",
    path: ROUTES.sobre,
  });
}

// ---- Hero ------------------------------------------------------------------
function Hero() {
  return (
    <section className="relative bg-atria-navy py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1562141961-b5d1980713c0?w=1200&h=600&fit=crop)" }}
      />
      <div className="absolute inset-0 bg-atria-navy/80" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="font-inter text-atria-yellow text-xs uppercase tracking-widest font-bold mb-4">Sobre Nós</p>
          <h1 className="font-barlow-condensed font-black text-4xl md:text-6xl text-white uppercase leading-none mb-4">
            Sobre a <span className="text-atria-yellow">Átria Veículos</span>
          </h1>
          <p className="font-inter text-white/70 text-lg max-w-xl mx-auto">
            Há mais de 13 anos guiando você na melhor escolha
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Historia --------------------------------------------------------------
function Historia() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Nossa História</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase mb-6">
            De uma Loja a Referência em Campinas
          </h2>
          <div className="font-inter text-atria-text-gray text-base leading-relaxed space-y-4 max-w-3xl mx-auto text-left md:text-center">
            <p>
              Fundada em Campinas, a Átria Veículos nasceu com o propósito de transformar a experiência de compra de veículos seminovos.
              O que começou como uma única loja, com dedicação e compromisso com o cliente, cresceu para se tornar uma das principais
              revendas da região.
            </p>
            <p>
              Com mais de <strong className="text-atria-text-dark">13 anos de mercado</strong>, já são mais de{" "}
              <strong className="text-atria-text-dark">10.000 veículos vendidos</strong> e{" "}
              <strong className="text-atria-text-dark">3 lojas para atendimento</strong> em Campinas:
              Abolição, Campos Elíseos e Guanabara.
            </p>
            <p>
              Nosso diferencial está na transparência: cada veículo passa por rigorosa perícia veicular, com laudo e garantia.
              Contamos ainda com um time de vendas online e serviços delivery, para que você tenha total comodidade e segurança na sua escolha.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---- Missao/Visao/Valores --------------------------------------------------
function MissaoVisaoValores() {
  const missaoVisao = [
    {
      icon: <Target size={28} />,
      title: "Missão",
      desc: "Proporcionar a melhor experiência de compra de produtos e serviços do ramo automobilístico, sendo motivo de orgulho para nossos clientes, colaboradores e parceiros.",
    },
    {
      icon: <Eye size={28} />,
      title: "Visão",
      desc: "Estar entre os principais grupos de concessionárias de veículos em Campinas e região, sendo referência em atendimento.",
    },
  ];

  const valores = [
    { icon: <Heart size={22} />, title: "Ética", desc: "Agir com transparência nas relações com colaboradores, clientes, parceiros e comunidade." },
    { icon: <BookOpen size={22} />, title: "Conhecimento", desc: "Conquistar a confiança de todos através da busca incessante pela excelência do conhecimento dos nossos produtos, serviços e negócio." },
    { icon: <Lightbulb size={22} />, title: "Inovação", desc: "Atuar com dinamismo e criatividade, sempre buscando eficiência que agregue valor ao negócio." },
    { icon: <ShieldCheck size={22} />, title: "Responsabilidade", desc: "Integridade, dedicação, disciplina e comprometimento com o negócio, em base de resultados." },
    { icon: <Users size={22} />, title: "Desenvolvimento Humano", desc: "Reconhecer a diversidade de nossos talentos através de iniciativas e lideranças, proporcionando oportunidades para desenvolvimento, treinamento e crescimento." },
  ];

  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        {/* Missao e Visao */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
          {missaoVisao.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-8 text-center shadow-sm"
            >
              <div className="w-14 h-14 rounded-full bg-atria-navy/10 text-atria-navy flex items-center justify-center mx-auto mb-4">
                {c.icon}
              </div>
              <h3 className="font-barlow-condensed font-bold text-xl text-atria-text-dark mb-3 uppercase">{c.title}</h3>
              <p className="font-inter text-sm text-atria-text-gray leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Valores */}
        <div className="max-w-5xl mx-auto">
          <h3 className="font-barlow-condensed font-black text-2xl text-atria-text-dark uppercase text-center mb-6">Nossos Valores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {valores.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-atria-navy/10 text-atria-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                  {v.icon}
                </div>
                <div>
                  <h4 className="font-barlow-condensed font-bold text-base text-atria-text-dark uppercase mb-1">{v.title}</h4>
                  <p className="font-inter text-sm text-atria-text-gray leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Numeros ---------------------------------------------------------------
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function Numeros() {
  const stats = [
    { icon: <Award size={24} />, label: "Anos no mercado", value: 13, suffix: "+" },
    { icon: <Car size={24} />, label: "Veículos vendidos", value: 10000, suffix: "+" },
    { icon: <Store size={24} />, label: "Veículos em estoque", value: 200, suffix: "+" },
    { icon: <MapPin size={24} />, label: "Lojas em Campinas", value: 3, suffix: "" },
  ];

  return (
    <section className="py-16 bg-atria-navy">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-atria-yellow mx-auto mb-2 flex justify-center">{s.icon}</div>
              <p className="font-barlow-condensed font-black text-4xl md:text-5xl text-atria-yellow">
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="font-inter text-xs text-white/60 mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Lojas -----------------------------------------------------------------
const LOJAS = [
  {
    nome: "Loja Abolição",
    endereco: "Rua Abolição, 1500 - VL Joaquim Inácio",
    cidade: "Campinas-SP",
    cep: "CEP 13045-750",
    telefone: "(19) 3199-2552",
  },
  {
    nome: "Loja Campos Elíseos",
    endereco: "R. Domício Pacheco e Silva, 1328 - Jd Campos Elíseos",
    cidade: "Campinas-SP",
    cep: "CEP 13060-190",
    telefone: "(19) 3500-8271",
  },
  {
    nome: "Loja Guanabara",
    endereco: "Av. Brasil, 1277 - Jd Guanabara",
    cidade: "Campinas-SP",
    cep: "CEP 13070-178",
    telefone: "(19) 3094-0015",
  },
];

function NossasLojas() {
  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Localização</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Nossas Lojas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {LOJAS.map((loja) => (
            <motion.div
              key={loja.nome}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-atria-navy text-white flex items-center justify-center mb-4">
                <MapPin size={20} />
              </div>
              <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark mb-3">{loja.nome}</h3>
              <div className="space-y-2">
                <p className="font-inter text-sm text-atria-text-gray flex items-start gap-2">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5 text-atria-navy" />
                  {loja.endereco}, {loja.cidade}, {loja.cep}
                </p>
                <p className="font-inter text-sm text-atria-text-gray flex items-center gap-2">
                  <Phone size={14} className="flex-shrink-0 text-atria-navy" />
                  {loja.telefone}
                </p>
                <p className="font-inter text-sm text-atria-text-gray flex items-center gap-2">
                  <Clock size={14} className="flex-shrink-0 text-atria-navy" />
                  Seg a Sex 9h-19h, Sab 9h-17h
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- CTA -------------------------------------------------------------------
function CTA() {
  return (
    <section className="py-20 bg-atria-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#002BB5_0%,_#001066_60%)]" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <Calendar size={40} className="text-atria-yellow mx-auto mb-4" />
        <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-white uppercase mb-4">
          Visite-nos
        </h2>
        <p className="font-inter text-white/70 mb-8 max-w-lg mx-auto">
          Venha conhecer nossas lojas e encontrar o veículo ideal para você.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={waLink("Olá! Gostaria de agendar uma visita presencial na loja Átria.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-xl transition-colors"
          >
            <Phone size={18} />
            Falar via WhatsApp
          </a>
          <a href={ROUTES.estoque} className="inline-flex items-center justify-center gap-2 bg-atria-yellow hover:bg-atria-yellow-dark text-atria-navy font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-xl transition-colors">
            <Car size={18} />
            Ver Estoque
          </a>
        </div>
      </div>
    </section>
  );
}

// ---- Page ------------------------------------------------------------------
export default function Sobre() {
  usePageSEO();

  return (
    <>
      <Hero />
      <Historia />
      <MissaoVisaoValores />
      <Numeros />
      <NossasLojas />
      <CTA />
    </>
  );
}
