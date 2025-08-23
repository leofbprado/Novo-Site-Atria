// ✅ SISTEMA DINÂMICO: Ler opcionais salvos pela IA do Firebase
const getDynamicFeatures = (carItem) => {
  // Tentar ler opcionais da estrutura da IA primeiro (equipamentos = campo principal)
  if (carItem?.equipamentos && typeof carItem.equipamentos === 'object') {
    const features = [];
    
    // INTERIOR
    if (carItem.equipamentos.INTERIOR && Array.isArray(carItem.equipamentos.INTERIOR)) {
      features.push({
        title: "Interior",
        items: carItem.equipamentos.INTERIOR
      });
    }
    
    // EXTERIOR
    if (carItem.equipamentos.EXTERIOR && Array.isArray(carItem.equipamentos.EXTERIOR)) {
      features.push({
        title: "Exterior", 
        items: carItem.equipamentos.EXTERIOR
      });
    }
    
    // SEGURANÇA
    if (carItem.equipamentos.SEGURANÇA && Array.isArray(carItem.equipamentos.SEGURANÇA)) {
      features.push({
        title: "Segurança",
        items: carItem.equipamentos.SEGURANÇA
      });
    }
    
    // CONFORTO
    if (carItem.equipamentos.CONFORTO && Array.isArray(carItem.equipamentos.CONFORTO)) {
      features.push({
        title: "Conforto",
        items: carItem.equipamentos.CONFORTO
      });
    }
    
    if (features.length > 0) {
      return features;
    }
  }
  
  // Fallback para estrutura legada (opcionais antigos)
  if (carItem?.opcionais && typeof carItem.opcionais === 'object') {
    const features = [];
    
    if (carItem.opcionais.INTERIOR && Array.isArray(carItem.opcionais.INTERIOR)) {
      features.push({
        title: "Interior",
        items: carItem.opcionais.INTERIOR
      });
    }
    
    if (carItem.opcionais.EXTERIOR && Array.isArray(carItem.opcionais.EXTERIOR)) {
      features.push({
        title: "Exterior",
        items: carItem.opcionais.EXTERIOR
      });
    }
    
    if (carItem.opcionais.SEGURANÇA && Array.isArray(carItem.opcionais.SEGURANÇA)) {
      features.push({
        title: "Segurança", 
        items: carItem.opcionais.SEGURANÇA
      });
    }
    
    if (carItem.opcionais.CONFORTO && Array.isArray(carItem.opcionais.CONFORTO)) {
      features.push({
        title: "Conforto",
        items: carItem.opcionais.CONFORTO
      });
    }
    
    if (features.length > 0) {
      return features;
    }
  }
  
  // Fallback padrão caso não tenha dados
  return [
    {
      title: "Interior",
      items: ["Ar-condicionado", "Direção elétrica", "Vidros elétricos"]
    },
    {
      title: "Exterior", 
      items: ["Rodas de liga leve", "Faróis de neblina", "Retrovisores elétricos"]
    },
    {
      title: "Segurança",
      items: ["Airbags frontais", "ABS + EBD", "Travas elétricas"]
    },
    {
      title: "Conforto",
      items: ["Banco regulável", "Apoio de braço", "Entrada USB"]
    }
  ];
};

export default function Features({ carItem }) {
  const features = getDynamicFeatures(carItem);
  
  return (
    <>
      <h4 className="title">Opcionais</h4>
      <div className="row">
        {features.map((feature, index) => (
          <div className="list-column col-lg-3 col-md-6 col-sm-12" key={index}>
            <div className="inner-column">
              <h6 className="title">{feature.title}</h6>
              <ul className="feature-list">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <i className="fa-solid fa-check" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
