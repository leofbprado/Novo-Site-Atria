import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Lead Capture ─────────────────────────────────────────────────────────────
export interface Lead {
  nome?: string;
  whatsapp: string;
  source: string;
  query?: string;
  dados?: Record<string, unknown>;
}

export async function saveLead(lead: Lead): Promise<void> {
  if (!db) {
    console.log("[mock] Lead salvo:", lead);
    return;
  }
  await addDoc(collection(db, "leads"), {
    ...lead,
    createdAt: serverTimestamp(),
  });
}

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  versao?: string;
  titulo?: string;
  tipo?: string;
  portas?: number;
  ano: number;
  preco: number;
  km: number;
  cor: string;
  cambio: "Manual" | "Automática" | "CVT";
  combustivel: "Gasolina" | "Diesel" | "Flex" | "Elétrico" | "Híbrido";
  fotos: string[];
  descricao: string;
  opcionais?: string[];
  destaque: boolean;
  slug: string;
  createdAt: Date;
}

// Generic interior shots reused across vehicles
const INT_A = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&q=80";
const INT_B = "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&q=80";
const INT_C = "https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&q=80";

// Returned when Firebase is not configured
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "1",
    marca: "BMW",
    modelo: "X5",
    versao: "xDrive30d M Sport",
    tipo: "SUV",
    portas: 4,
    ano: 2023,
    preco: 350000,
    km: 5000,
    cor: "Preto",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: [
      "https://images.unsplash.com/photo-1553882900-d5160ca3fc10?w=800&q=80",
      INT_A, INT_B, INT_C,
    ],
    descricao: "BMW X5 xDrive30d M Sport 2023 em estado impecável. Único dono, todas as revisões realizadas na concessionária BMW. Equipado com pacote M Sport completo, bancos em couro Merino, teto solar panorâmico duplo e sistema de som Harman Kardon. Rodas de liga leve 22\" originais BMW.",
    opcionais: [
      "Teto solar panorâmico duplo", "Banco elétrico com memória", "Ar-condicionado trizone",
      "Multifuncional no volante", "Tela iDrive 12.3\"", "Apple CarPlay", "Android Auto",
      "Câmera de ré 360°", "Sensor de estacionamento dianteiro e traseiro",
      "Airbag múltiplos (8)", "ABS + EBD", "Controle de estabilidade DSC",
      "Faróis LED adaptivos", "Rodas de liga leve 22\"", "Piloto automático adaptivo",
      "Bluetooth", "Som Harman Kardon", "Head-up display", "Vidros elétricos", "Travas elétricas",
    ],
    destaque: true,
    slug: "bmw-x5-2023",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    marca: "Mercedes-Benz",
    modelo: "C300",
    versao: "4MATIC AMG Line",
    tipo: "Sedan",
    portas: 4,
    ano: 2022,
    preco: 250000,
    km: 15000,
    cor: "Prata",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Mercedes-Benz C300 4MATIC AMG Line 2022 com interior de luxo e pacote AMG completo. Veículo revisado, com toda a documentação em dia. Sistema MBUX com tela de 10,25\", bancos esportivos AMG em couro Nappa e suspensão esportiva adaptativa.",
    opcionais: [
      "Ar-condicionado bizone", "Banco elétrico aquecido", "Teto solar panorâmico",
      "Tela MBUX 10.25\"", "Apple CarPlay", "Android Auto", "Câmera de ré",
      "Sensor de estacionamento", "Airbag múltiplos", "ABS + ESP",
      "Controle de estabilidade", "Faróis LED High Performance", "Rodas AMG 18\"",
      "Piloto automático", "Bluetooth", "USB", "Vidros elétricos", "Travas elétricas",
    ],
    destaque: true,
    slug: "mercedes-c300-2022",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    marca: "Audi",
    modelo: "A4",
    versao: "2.0 TFSI Prestige Plus S-tronic",
    tipo: "Sedan",
    portas: 4,
    ano: 2023,
    preco: 280000,
    km: 8000,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
      INT_A, INT_B, INT_C,
    ],
    descricao: "Audi A4 2.0 TFSI Prestige Plus 2023 com teto panorâmico, Virtual Cockpit e pacote S-Line. Tecnologia de ponta com assistência de faixas, frenagem de emergência e piloto automático adaptivo. Interior em couro Dakota com costuras em contraste.",
    opcionais: [
      "Teto solar panorâmico", "Virtual Cockpit 12.3\"", "Tela MMI 10.1\"",
      "Apple CarPlay", "Android Auto", "Câmera de ré", "Sensor de estacionamento",
      "Banco elétrico com memória", "Ar-condicionado trizone", "Airbag múltiplos",
      "ABS + ESP", "Lane Assist", "Piloto automático adaptivo", "Faróis LED Matrix",
      "Rodas de liga leve 19\" S-Line", "Bluetooth", "USB", "Som Bang & Olufsen",
      "Vidros elétricos", "Travas elétricas",
    ],
    destaque: true,
    slug: "audi-a4-2023",
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "4",
    marca: "Toyota",
    modelo: "Hilux",
    versao: "SRX 2.8 TDI 4x4 CD Diesel",
    tipo: "Pickup",
    portas: 4,
    ano: 2022,
    preco: 220000,
    km: 28000,
    cor: "Branco",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: [
      "https://images.unsplash.com/photo-1571987502951-3b67e1780c41?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Toyota Hilux SRX 2.8 TDI 4x4 CD Diesel 2022 com 28.000 km rodados. Cabine dupla top de linha, banco em couro, multimídia Toyota com Android Auto e Apple CarPlay. Pneus originais em ótimo estado. Revisões realizadas na concessionária Toyota.",
    opcionais: [
      "Ar-condicionado bizone", "Banco em couro elétrico", "Vidros elétricos",
      "Travas elétricas", "Tela multimídia 8\"", "Apple CarPlay", "Android Auto",
      "Câmera de ré", "Sensor de estacionamento", "Airbag duplo",
      "ABS", "Controle de estabilidade", "Faróis LED", "Rodas de liga leve 17\"",
      "Tração 4x4 com bloqueio de diferencial", "Piloto automático", "Bluetooth",
    ],
    destaque: true,
    slug: "toyota-hilux-2022",
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "5",
    marca: "Jeep",
    modelo: "Compass",
    versao: "Limited 1.3 T270 Flex",
    tipo: "SUV",
    portas: 4,
    ano: 2023,
    preco: 185000,
    km: 12000,
    cor: "Azul",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Jeep Compass Limited 1.3 T270 Flex 2023 com teto solar elétrico e couro bege. SUV completo com tração 4x2 e câmbio automático de 6 marchas. Pacote tecnológico com tela Uconnect 10.1\", câmera de ré e sensor de estacionamento frontal e traseiro.",
    opcionais: [
      "Teto solar elétrico", "Banco em couro bege", "Ar-condicionado bizone",
      "Vidros elétricos", "Travas elétricas", "Tela Uconnect 10.1\"",
      "Apple CarPlay", "Android Auto", "Câmera de ré", "Sensor de estacionamento",
      "Airbag múltiplos (6)", "ABS + EBD", "Controle de estabilidade",
      "Faróis LED", "Rodas de liga leve 18\"", "Piloto automático", "Bluetooth",
    ],
    destaque: true,
    slug: "jeep-compass-2023",
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "6",
    marca: "Honda",
    modelo: "Civic",
    versao: "Touring 1.5 Turbo CVT",
    tipo: "Sedan",
    portas: 4,
    ano: 2022,
    preco: 145000,
    km: 22000,
    cor: "Vermelho",
    cambio: "CVT",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
      INT_A, INT_C,
    ],
    descricao: "Honda Civic Touring 1.5 Turbo CVT 2022, topo de linha. Honda Sensing completo com frenagem autônoma, assistência de faixas e luz de estrada automática. Tela de 9\" com Apple CarPlay e Android Auto sem fio. Banco dianteiro aquecido e ventilado.",
    opcionais: [
      "Ar-condicionado bizone", "Banco dianteiro aquecido e ventilado", "Banco elétrico",
      "Vidros elétricos", "Travas elétricas", "Tela Honda 9\"", "Apple CarPlay sem fio",
      "Android Auto sem fio", "Câmera de ré", "Sensor de estacionamento",
      "Airbag múltiplos (6)", "ABS + EBD", "Honda Sensing (CMBS, ACC, LKA)",
      "Faróis LED adaptivos", "Rodas de liga leve 17\"", "Piloto automático adaptivo",
      "Bluetooth", "USB",
    ],
    destaque: false,
    slug: "honda-civic-2022",
    createdAt: new Date("2023-12-28"),
  },
  {
    id: "7",
    marca: "Volkswagen",
    modelo: "Golf GTI",
    versao: "2.0 TSI DSG 245 cv",
    tipo: "Hatch",
    portas: 4,
    ano: 2022,
    preco: 210000,
    km: 18000,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Gasolina",
    fotos: [
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Volkswagen Golf GTI 2.0 TSI DSG 2022 com 245 cv de potência. Esportivo completo com suspensão adaptativa DCC, diferencial dianteiro XDS+ e modo de condução Individual. Bancos Recaro em couro/alcântara e volante esportivo GTI multifuncional.",
    opcionais: [
      "Suspensão adaptativa DCC", "Bancos Recaro couro/alcântara", "Ar-condicionado bizone",
      "Vidros elétricos", "Travas elétricas", "Tela Discover Pro 9.2\"",
      "Apple CarPlay", "Android Auto", "Câmera de ré", "Sensor de estacionamento",
      "Airbag múltiplos", "ABS + ESP", "Controle de estabilidade",
      "Faróis LED IQ.LIGHT", "Rodas de liga leve 18\" Richmond", "Piloto automático",
      "Bluetooth", "Som Beats Audio", "Saídas de escape duplas GTI",
    ],
    destaque: false,
    slug: "vw-golf-gti-2022",
    createdAt: new Date("2023-12-20"),
  },
  {
    id: "8",
    marca: "Toyota",
    modelo: "Corolla",
    versao: "XEi 2.0 Flex CVT",
    tipo: "Sedan",
    portas: 4,
    ano: 2023,
    preco: 165000,
    km: 9000,
    cor: "Prata",
    cambio: "CVT",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
      INT_A, INT_C,
    ],
    descricao: "Toyota Corolla XEi 2.0 Flex CVT 2023 com Toyota Safety Sense e faróis full LED. Sistema multimídia Toyota com tela de 9\", Apple CarPlay e Android Auto. Banco dianteiro do motorista com ajuste elétrico de 8 posições e memória de posição.",
    opcionais: [
      "Toyota Safety Sense (PCS, LDA, AHB)", "Ar-condicionado bizone",
      "Banco elétrico com memória", "Vidros elétricos", "Travas elétricas",
      "Tela Toyota 9\"", "Apple CarPlay", "Android Auto", "Câmera de ré",
      "Sensor de estacionamento", "Airbag múltiplos (7)", "ABS + EBD",
      "Faróis full LED", "Rodas de liga leve 17\"", "Piloto automático adaptivo",
      "Bluetooth", "USB",
    ],
    destaque: false,
    slug: "toyota-corolla-2023",
    createdAt: new Date("2023-12-15"),
  },
  {
    id: "9",
    marca: "Ford",
    modelo: "Ranger",
    versao: "Limited 3.2 TDCi 4x4 CD",
    tipo: "Pickup",
    portas: 4,
    ano: 2022,
    preco: 195000,
    km: 35000,
    cor: "Preto",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Ford Ranger Limited 3.2 TDCi 4x4 CD Diesel 2022 com acessórios de fábrica. Cabine dupla com banco em couro, multimídia SYNC 3 com tela de 8\", câmera de ré e sensor de estacionamento traseiro. Pneus BFGoodrich em ótimo estado.",
    opcionais: [
      "Ar-condicionado bizone", "Banco em couro", "Vidros elétricos",
      "Travas elétricas", "SYNC 3 com tela 8\"", "Apple CarPlay", "Android Auto",
      "Câmera de ré", "Sensor de estacionamento traseiro", "Airbag duplo",
      "ABS", "Controle de estabilidade", "Tração 4x4",
      "Faróis LED", "Rodas de liga leve 18\"", "Piloto automático", "Bluetooth",
    ],
    destaque: false,
    slug: "ford-ranger-2022",
    createdAt: new Date("2023-12-10"),
  },
  {
    id: "10",
    marca: "Hyundai",
    modelo: "Creta",
    versao: "Platinum 2.0 Flex AT",
    tipo: "SUV",
    portas: 4,
    ano: 2023,
    preco: 132000,
    km: 11000,
    cor: "Branco",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Hyundai Creta Platinum 2.0 Flex AT 2023 com teto solar elétrico e banco em couro. SUV top de linha da Hyundai com SmartSense, câmera surround view 360° e tela de 10.25\". Carregador por indução e banco traseiro aquecido.",
    opcionais: [
      "Teto solar elétrico", "Banco em couro aquecido", "Ar-condicionado bizone",
      "Vidros elétricos", "Travas elétricas", "Tela Hyundai 10.25\"",
      "Apple CarPlay", "Android Auto", "Câmera 360° surround view",
      "Sensor de estacionamento", "Hyundai SmartSense",
      "Airbag múltiplos (6)", "ABS + EBD", "Controle de estabilidade",
      "Faróis LED", "Rodas de liga leve 17\"", "Piloto automático adaptivo",
      "Bluetooth", "USB", "Carregador por indução",
    ],
    destaque: false,
    slug: "hyundai-creta-2023",
    createdAt: new Date("2023-12-08"),
  },
  {
    id: "11",
    marca: "Chevrolet",
    modelo: "Onix Plus",
    versao: "Premier 1.0 Turbo AT",
    tipo: "Sedan",
    portas: 4,
    ano: 2022,
    preco: 89000,
    km: 42000,
    cor: "Vermelho",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
      INT_A, INT_C,
    ],
    descricao: 'Chevrolet Onix Plus Premier 1.0 Turbo AT 2022, tela 8" MyLink com Apple CarPlay e Android Auto. Motor turbo 116 cv com câmbio automático de 6 marchas. Banco em couro, câmera de ré e sensor de estacionamento.',
    opcionais: [
      "Ar-condicionado", "Banco em couro", "Vidros elétricos",
      "Travas elétricas", 'Tela MyLink 8"', "Apple CarPlay", "Android Auto",
      "Câmera de ré", "Sensor de estacionamento", "Airbag duplo",
      "ABS", "Controle de estabilidade", "Faróis LED",
      "Rodas de liga leve 15\"", "Piloto automático", "Bluetooth", "USB",
    ],
    destaque: false,
    slug: "chevrolet-onix-plus-2022",
    createdAt: new Date("2023-12-05"),
  },
  {
    id: "12",
    marca: "Volkswagen",
    modelo: "T-Cross",
    versao: "Highline 1.4 TSI DSG",
    tipo: "SUV",
    portas: 4,
    ano: 2023,
    preco: 152000,
    km: 7500,
    cor: "Cinza",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Volkswagen T-Cross Highline 1.4 TSI DSG 2023 com teto solar, ACC e Lane Assist. SUV compacto top de linha com motor turbo 150 cv e câmbio DSG de 7 marchas. Tela Discover Pro 10.1\" e sistema de som premium.",
    opcionais: [
      "Teto solar", "Ar-condicionado bizone", "Banco elétrico",
      "Vidros elétricos", "Travas elétricas", "Tela Discover Pro 10.1\"",
      "Apple CarPlay", "Android Auto", "Câmera de ré", "Sensor de estacionamento",
      "ACC (piloto automático adaptivo)", "Lane Assist", "Airbag múltiplos",
      "ABS + ESP", "Faróis LED IQ.LIGHT", "Rodas de liga leve 18\"", "Bluetooth", "USB",
    ],
    destaque: false,
    slug: "vw-t-cross-2023",
    createdAt: new Date("2023-12-03"),
  },
  {
    id: "13",
    marca: "Hyundai",
    modelo: "HB20",
    versao: "Vision 1.0 Flex MT",
    tipo: "Hatch",
    portas: 4,
    ano: 2022,
    preco: 78000,
    km: 31000,
    cor: "Azul",
    cambio: "Manual",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=800&q=80",
      INT_A,
    ],
    descricao: "Hyundai HB20 Vision 1.0 Flex MT 2022, econômico e confiável. Revisões realizadas na rede Hyundai em dia. Ótimo para cidade com baixo consumo de combustível. Multimídia com Bluetooth e câmera de ré.",
    opcionais: [
      "Ar-condicionado", "Vidros elétricos", "Travas elétricas",
      "Tela multimídia 7\"", "Bluetooth", "USB", "Câmera de ré",
      "Airbag duplo", "ABS", "Faróis halógenos", "Rodas de liga leve 15\"",
    ],
    destaque: false,
    slug: "hyundai-hb20-2022",
    createdAt: new Date("2023-11-28"),
  },
  {
    id: "14",
    marca: "Chevrolet",
    modelo: "S10",
    versao: "High Country 2.8 Turbo Diesel 4x4 CD",
    tipo: "Pickup",
    portas: 4,
    ano: 2021,
    preco: 175000,
    km: 58000,
    cor: "Prata",
    cambio: "Automática",
    combustivel: "Diesel",
    fotos: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Chevrolet S10 High Country 2.8 Turbo Diesel 4x4 CD 2021 com couro bege e rodas de 20\". Cabine dupla topo de linha com banco elétrico, tela MyLink 8\" e câmera de ré. Tração 4x4 com bloqueio de diferencial central.",
    opcionais: [
      "Ar-condicionado bizone", "Banco em couro bege elétrico", "Vidros elétricos",
      "Travas elétricas", 'Tela MyLink 8"', "Apple CarPlay", "Android Auto",
      "Câmera de ré", "Sensor de estacionamento", "Airbag múltiplos",
      "ABS", "Controle de estabilidade", "Tração 4x4 com bloqueio",
      "Faróis projetores", "Rodas de liga leve 20\"", "Piloto automático", "Bluetooth",
    ],
    destaque: false,
    slug: "chevrolet-s10-2021",
    createdAt: new Date("2023-11-20"),
  },
  {
    id: "15",
    marca: "Chevrolet",
    modelo: "Tracker",
    versao: "Premier 1.2 Turbo AT",
    tipo: "SUV",
    portas: 4,
    ano: 2023,
    preco: 119000,
    km: 14000,
    cor: "Branco",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
      INT_A, INT_C,
    ],
    descricao: "Chevrolet Tracker Premier 1.2 Turbo AT 2023 com teto solar elétrico e Android Auto. Motor turbo 133 cv com câmbio automático CVT. Tela MyLink 9\", carregador sem fio e câmera de ré. Banco dianteiro com ajuste elétrico.",
    opcionais: [
      "Teto solar elétrico", "Ar-condicionado bizone", "Banco elétrico",
      "Vidros elétricos", "Travas elétricas", 'Tela MyLink 9"',
      "Apple CarPlay", "Android Auto", "Câmera de ré",
      "Sensor de estacionamento", "Carregador sem fio", "Airbag múltiplos",
      "ABS + EBD", "Controle de estabilidade", "Faróis LED",
      "Rodas de liga leve 17\"", "Piloto automático", "Bluetooth",
    ],
    destaque: false,
    slug: "chevrolet-tracker-2023",
    createdAt: new Date("2023-11-15"),
  },
  {
    id: "16",
    marca: "Honda",
    modelo: "HR-V",
    versao: "EXL 1.5 VTEC Turbo CVT",
    tipo: "SUV",
    portas: 4,
    ano: 2022,
    preco: 138000,
    km: 19000,
    cor: "Cinza",
    cambio: "CVT",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Honda HR-V EXL 1.5 VTEC Turbo CVT 2022 com câmera 360° e Honda Sensing. SUV compacto premium com banco em couro, tela de 9\" e pacote de segurança completo. Pneus em ótimo estado, revisões todas na rede Honda.",
    opcionais: [
      "Ar-condicionado bizone", "Banco em couro", "Banco elétrico",
      "Vidros elétricos", "Travas elétricas", "Tela Honda 9\"",
      "Apple CarPlay sem fio", "Android Auto sem fio", "Câmera 360°",
      "Sensor de estacionamento", "Honda Sensing", "Airbag múltiplos (6)",
      "ABS + EBD", "Controle de estabilidade", "Faróis LED",
      "Rodas de liga leve 18\"", "Piloto automático adaptivo", "Bluetooth", "USB",
    ],
    destaque: false,
    slug: "honda-hrv-2022",
    createdAt: new Date("2023-11-10"),
  },
  {
    id: "17",
    marca: "Fiat",
    modelo: "Pulse",
    versao: "Impetus 1.3 Turbo 270 AT",
    tipo: "SUV",
    portas: 4,
    ano: 2023,
    preco: 108000,
    km: 22000,
    cor: "Vermelho",
    cambio: "Automática",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      INT_A, INT_C,
    ],
    descricao: "Fiat Pulse Impetus 1.3 Turbo 270 AT 2023, topo de linha com motor turbo 185 cv. Teto panorâmico elétrico, som JBL 8 alto-falantes e câmera de ré. Tela Uconnect de 10.1\" com Apple CarPlay e Android Auto wireless.",
    opcionais: [
      "Teto panorâmico elétrico", "Ar-condicionado bizone", "Banco em couro",
      "Vidros elétricos", "Travas elétricas", "Tela Uconnect 10.1\"",
      "Apple CarPlay wireless", "Android Auto wireless", "Câmera de ré",
      "Sensor de estacionamento", "Som JBL 8 alto-falantes",
      "Airbag múltiplos (6)", "ABS + EBD", "Controle de estabilidade",
      "Faróis LED", "Rodas de liga leve 17\"", "Piloto automático", "Bluetooth",
    ],
    destaque: false,
    slug: "fiat-pulse-2023",
    createdAt: new Date("2023-11-05"),
  },
  {
    id: "18",
    marca: "Nissan",
    modelo: "Kicks",
    versao: "Advance 1.6 16V Flex CVT",
    tipo: "SUV",
    portas: 4,
    ano: 2022,
    preco: 115000,
    km: 27000,
    cor: "Prata",
    cambio: "CVT",
    combustivel: "Flex",
    fotos: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
      INT_A, INT_B,
    ],
    descricao: "Nissan Kicks Advance 1.6 CVT 2022, ProPilot e tela de 9 polegadas. Sistema de assistência à condução ProPilot com manutenção de faixa e frenagem de emergência. Câmera de ré com guias dinâmicos e sensor de estacionamento dianteiro e traseiro.",
    opcionais: [
      "Ar-condicionado bizone", "Banco em couro", "Vidros elétricos",
      "Travas elétricas", "Tela NissanConnect 9\"", "Apple CarPlay",
      "Android Auto", "Câmera de ré", "Sensor de estacionamento",
      "ProPilot (piloto automático adaptivo)", "Airbag múltiplos",
      "ABS + EBD", "Controle de estabilidade", "Faróis LED",
      "Rodas de liga leve 17\"", "Bluetooth", "USB",
    ],
    destaque: false,
    slug: "nissan-kicks-2022",
    createdAt: new Date("2023-11-01"),
  },
];

export async function getVehicles(
  filters?: Partial<{
    marca?: string;
    modelo?: string;
    anoMin?: number;
    anoMax?: number;
    precoMin?: number;
    precoMax?: number;
  }>
): Promise<Vehicle[]> {
  if (!db) return MOCK_VEHICLES;

  const constraints: QueryConstraint[] = [];
  if (filters?.marca) constraints.push(where("marca", "==", filters.marca));
  if (filters?.modelo) constraints.push(where("modelo", "==", filters.modelo));
  if (filters?.anoMin) constraints.push(where("ano", ">=", filters.anoMin));
  if (filters?.anoMax) constraints.push(where("ano", "<=", filters.anoMax));
  if (filters?.precoMin) constraints.push(where("preco", ">=", filters.precoMin));
  if (filters?.precoMax) constraints.push(where("preco", "<=", filters.precoMax));
  constraints.push(orderBy("createdAt", "desc"));

  const snap = await getDocs(query(collection(db, "vehicles"), ...constraints));
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Vehicle, "id">) }));
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!db) return MOCK_VEHICLES.find((v) => v.slug === slug) ?? null;

  const snap = await getDocs(
    query(collection(db, "vehicles"), where("slug", "==", slug))
  );
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<Vehicle, "id">) };
}

export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  if (!db) return MOCK_VEHICLES.filter((v) => v.destaque);

  const snap = await getDocs(
    query(
      collection(db, "vehicles"),
      where("destaque", "==", true),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Vehicle, "id">) }));
}
