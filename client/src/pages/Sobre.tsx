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
function useSEO() {
  useEffect(() => {
    document.title = "Sobre | Atria Veiculos - Ha mais de 12 anos em Campinas SP";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Atria Veiculos: ha mais de 12 anos no mercado automotivo em Campinas-SP. 4 lojas, mais de 10.000 veiculos vendidos. Confianca e transparencia.");
  }, []);
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
          <p className="font-inter text-atria-yellow text-xs uppercase tracking-widest font-bold mb-4">Sobre Nos</p>
          <h1 className="font-barlow-condensed font-black text-4xl md:text-6xl text-white uppercase leading-none mb-4">
            Sobre a <span className="text-atria-yellow">Atria Veiculos</span>
          </h1>
          <p className="font-inter text-white/70 text-lg max-w-xl mx-auto">
            Ha mais de 12 anos guiando voce na melhor escolha
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
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Nossa Historia</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase mb-6">
            De uma Loja a Referencia em Campinas
          </h2>
          <div className="font-inter text-atria-text-gray text-base leading-relaxed space-y-4 max-w-3xl mx-auto text-left md:text-center">
            <p>
              Fundada em Campinas, a Atria Veiculos nasceu com o proposito de transformar a experiencia de compra de veiculos seminovos.
              O que comecou como uma unica loja, com dedicacao e compromisso com o cliente, cresceu para se tornar uma das principais
              revendas da regiao.
            </p>
            <p>
              Com mais de <strong className="text-atria-text-dark">12 anos de mercado</strong>, ja sao mais de{" "}
              <strong className="text-atria-text-dark">10.000 veiculos vendidos</strong> e{" "}
              <strong className="text-atria-text-dark">4 lojas para atendimento</strong> em Campinas:
              Abolicao, Campos Eliseos, Guanabara e Novo Campos Eliseos.
            </p>
            <p>
              Nosso diferencial esta na transparencia: cada veiculo passa por rigorosa pericia veicular, com laudo e garantia.
              Contamos ainda com um time de vendas online e servicos delivery, para que voce tenha total comodidade e seguranca na sua escolha.
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
      title: "Missao",
      desc: "Proporcionar a melhor experiencia de compra de produtos e servicos do ramo automobilistico, sendo motivo de orgulho para nossos clientes, colaboradores e parceiros.",
    },
    {
      icon: <Eye size={28} />,
      title: "Visao",
      desc: "Estar entre os principais grupos de concessionarias de veiculos em Campinas e regiao, sendo referencia em atendimento.",
    },
  ];

  const valores = [
    { icon: <Heart size={22} />, title: "Etica", desc: "Agir com transparencia nas relacoes com colaboradores, clientes, parceiros e comunidade." },
    { icon: <BookOpen size={22} />, title: "Conhecimento", desc: "Conquistar a confianca de todos atraves da busca incessante pela excelencia do conhecimento dos nossos produtos, servicos e negocio." },
    { icon: <Lightbulb size={22} />, title: "Inovacao", desc: "Atuar com dinamismo e criatividade, sempre buscando eficiencia que agregue valor ao negocio." },
    { icon: <ShieldCheck size={22} />, title: "Responsabilidade", desc: "Integridade, dedicacao, disciplina e comprometimento com o negocio, em base de resultados." },
    { icon: <Users size={22} />, title: "Desenvolvimento Humano", desc: "Reconhecer a diversidade de nossos talentos atraves de iniciativas e liderancas, proporcionando oportunidades para desenvolvimento, treinamento e crescimento." },
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
    let start = 0;
    const step = (target / 1800) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function Numeros() {
  const stats = [
    { icon: <Award size={24} />, label: "Anos no mercado", value: 12, suffix: "+" },
    { icon: <Car size={24} />, label: "Veiculos vendidos", value: 10000, suffix: "+" },
    { icon: <Store size={24} />, label: "Veiculos em estoque", value: 200, suffix: "+" },
    { icon: <MapPin size={24} />, label: "Lojas em Campinas", value: 4, suffix: "" },
    { icon: <Star size={24} />, label: "Satisfacao", value: 98, suffix: "%" },
  ];

  return (
    <section className="py-16 bg-atria-navy">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
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

// ---- Equipe ----------------------------------------------------------------
function Equipe() {
  const membros = [
    { nome: "Diretoria", cargo: "Gestao e estrategia", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face" },
    { nome: "Gerente Comercial", cargo: "Negociacao e estoque", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face" },
    { nome: "Consultor de Vendas", cargo: "Atendimento ao cliente", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face" },
    { nome: "Financeiro", cargo: "Financiamento e documentacao", foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face" },
  ];

  return (
    <section id="equipe" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Equipe</p>
          <h2 className="font-barlow-condensed font-black text-3xl md:text-4xl text-atria-text-dark uppercase">
            Nossa Equipe
          </h2>
          <p className="font-inter text-atria-text-gray mt-3 max-w-lg mx-auto">
            Profissionais dedicados a encontrar o melhor veiculo para voce.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {membros.map((m) => (
            <motion.div
              key={m.nome}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-atria-gray-light rounded-xl p-6 text-center"
            >
              <img src={m.foto} alt={m.nome} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-md" loading="lazy" />
              <h3 className="font-barlow-condensed font-bold text-lg text-atria-text-dark">{m.nome}</h3>
              <p className="font-inter text-sm text-atria-text-gray mt-1">{m.cargo}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Lojas -----------------------------------------------------------------
const LOJAS = [
  {
    nome: "Loja Abolicao",
    endereco: "Rua Abolicao, 1500 - VL Joaquim Inacio",
    cidade: "Campinas-SP",
    cep: "CEP 13045-750",
    telefone: "(19) 3199-2552",
  },
  {
    nome: "Loja Campos Eliseos",
    endereco: "R. Domicio Pacheco e Silva, 1328 - Jd Campos Eliseos",
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
  {
    nome: "Loja Novo Campos Eliseos",
    endereco: "Jd Campos Eliseos",
    cidade: "Campinas-SP",
    cep: "",
    telefone: "(19) 3500-8271",
  },
];

function NossasLojas() {
  return (
    <section className="py-20 bg-atria-gray-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-inter text-atria-navy text-xs uppercase tracking-widest font-bold mb-2">Localizacao</p>
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
          Venha conhecer nossas lojas e encontrar o veiculo ideal para voce.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={waLink("Ola! Gostaria de agendar uma visita presencial na loja Atria.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-xl transition-colors"
          >
            <Phone size={18} />
            Falar via WhatsApp
          </a>
          <a href="/estoque" className="inline-flex items-center justify-center gap-2 bg-atria-yellow hover:bg-atria-yellow-dark text-atria-navy font-inter font-bold uppercase tracking-wider text-sm px-8 py-4 rounded-xl transition-colors">
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
  useSEO();

  return (
    <>
      <Hero />
      <Historia />
      <MissaoVisaoValores />
      <Numeros />
      <Equipe />
      <NossasLojas />
      <CTA />
    </>
  );
}
