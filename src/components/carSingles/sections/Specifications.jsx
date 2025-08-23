import React from "react";

// ✅ SISTEMA DINÂMICO: Ler especificações técnicas salvas pela IA do Firebase
const getDynamicSpecifications = (carItem) => {
  const specs = [];
  

  
  // Priorizar especificações corrigidas pela IA
  const techSpecs = carItem?.especificacoes_tecnicas;
  
  if (techSpecs) {
    if (techSpecs.comprimento) {
      specs.push({
        label: "Comprimento",
        value: `${techSpecs.comprimento} mm`
      });
    }
    
    if (techSpecs.largura) {
      specs.push({
        label: "Largura", 
        value: `${techSpecs.largura} mm`
      });
    }
    
    if (techSpecs.altura) {
      specs.push({
        label: "Altura",
        value: `${techSpecs.altura} mm`
      });
    }
    
    if (techSpecs.porta_malas) {
      specs.push({
        label: "Porta-malas",
        value: `${techSpecs.porta_malas} litros`
      });
    }
    
    if (techSpecs.capacidade) {
      specs.push({
        label: "Capacidade",
        value: `${techSpecs.capacidade} lugares`
      });
    }
    
    if (techSpecs.peso) {
      specs.push({
        label: "Peso",
        value: `${techSpecs.peso} kg`
      });
    }
    
    // Novos campos técnicos
    if (techSpecs.potencia_maxima) {
      specs.push({
        label: "Potência Máxima",
        value: `${techSpecs.potencia_maxima} cv`
      });
    }
    
    if (techSpecs.torque_maximo) {
      specs.push({
        label: "Torque Máximo",
        value: `${techSpecs.torque_maximo} kgfm`
      });
    }
    
    if (techSpecs.consumo_urbano) {
      specs.push({
        label: "Consumo Urbano",
        value: `${techSpecs.consumo_urbano} km/l`
      });
    }
    
    if (techSpecs.consumo_rodoviario) {
      specs.push({
        label: "Consumo Rodoviário",
        value: `${techSpecs.consumo_rodoviario} km/l`
      });
    }
    
    if (techSpecs.autonomia_urbana) {
      specs.push({
        label: "Autonomia Urbana",
        value: `${techSpecs.autonomia_urbana} km`
      });
    }
    
    if (techSpecs.autonomia_rodoviaria) {
      specs.push({
        label: "Autonomia Rodoviária",
        value: `${techSpecs.autonomia_rodoviaria} km`
      });
    }
  }
  
  // Se não há especificações da IA, usar dados padrão mínimos
  if (specs.length === 0) {
    specs.push(
      { label: "Comprimento", value: "Não informado" },
      { label: "Largura", value: "Não informado" },
      { label: "Altura", value: "Não informado" },
      { label: "Porta-malas", value: "Não informado" },
      { label: "Capacidade", value: "Não informado" },
      { label: "Peso", value: "Não informado" }
    );
  }
  
  return specs;
};

export default function Specifications({ carItem }) {
  const specifications = getDynamicSpecifications(carItem);

  return (
    <>
      <div className="row">
        <div className="content-column col-lg-12 col-md-12 col-sm-12">
          <div className="inner-column">
            <h6 className="title">Especificações Técnicas</h6>
            <ul className="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {specifications.map((spec, index) => (
                <li key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}
                  >
                    <path 
                      d="M20 6L9 17L4 12" 
                      stroke="#6366f1" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ 
                    color: '#374151', 
                    fontWeight: '400',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <span>{spec.label}</span>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{spec.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}