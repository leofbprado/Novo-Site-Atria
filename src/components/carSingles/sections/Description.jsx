import React from "react";

const getVehicleDescription = (carItem) => {
  // Priorizar descrição corrigida pela IA (salva no campo 'informacoes')
  if (carItem?.informacoes && carItem.informacoes.trim()) {
    return carItem.informacoes;
  }
  
  // Fallback para descrição original
  if (carItem?.descricao && carItem.descricao.trim()) {
    return carItem.descricao;
  }
  
  // Descrição padrão
  return "Este é um veículo de excelente qualidade, revisado e pronto para uso. Entre em contato conosco para mais informações sobre este modelo.";
};

export default function Description({ carItem }) {
  const description = getVehicleDescription(carItem);
  
  return (
    <>
      <h4 className="title">Informações</h4>
      <div className="text two">
        {description}
      </div>
      {carItem?.versao && (
        <div className="text">
          <strong>Versão:</strong> {carItem.versao}
        </div>
      )}
    </>
  );
}
