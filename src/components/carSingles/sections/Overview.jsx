import React from "react";

// ✅ SISTEMA DINÂMICO: Ler dados corrigidos pela IA do Firebase (TIPO REMOVIDO da ficha técnica)
const getVehicleDetails = (carItem) => [
  {
    icon: "/images/resource/insep1-2.svg",
    label: "Km",
    value: carItem?.km ? `${carItem.km.toLocaleString()} km` : "Não informado",
    width: 18,
    height: 18,
  },
  {
    icon: "/images/resource/insep1-3.svg",
    label: "Combustível",
    // Campo combustível atualizado pela IA
    value: carItem?.combustivel || "Não informado",
    width: 18,
    height: 18,
  },
  {
    icon: "/images/resource/insep1-4.svg",
    label: "Ano",
    value: carItem?.ano_modelo || carItem?.ano_fabricacao || carItem?.ano || "Não informado",
    width: 16,
    height: 16,
  },
  {
    icon: "/images/resource/insep1-5.svg",
    label: "Transmissão",
    // Campo transmissão atualizado pela IA
    value: carItem?.cambio || "Não informado",
    width: 16,
    height: 16,
  },
];

const vehicleAdditionalDetails = [
  {
    icon: "/images/resource/insep1-7.svg",
    label: "Condition",
    value: "Used",
    width: 18,
    height: 18,
  },
  {
    icon: "/images/resource/insep1-8.svg",
    label: "Engine Size",
    value: "4.8L",
    width: 18,
    height: 18,
  },
  {
    icon: "/images/resource/insep1-9.svg",
    label: "Doors",
    value: "5-door",
    width: 18,
    height: 18,
  },
  {
    icon: "/images/resource/insep1-10.svg",
    label: "Cylinders",
    value: "6",
    width: 18,
    height: 18,
  },
  {
    icon: "/images/resource/insep1-11.svg",
    label: "Color",
    value: "Blue",
    width: 18,
    height: 18,
  },
  {
    icon: "/images/resource/insep1-12.svg",
    label: "VIN",
    value: "ZN682AVA2P7429564",
    width: 18,
    height: 18,
  },
];

export default function Overview({ carItem }) {
  const vehicleDetails = getVehicleDetails(carItem);
  return (
    <>
      <h4 className="title">Ficha Técnica</h4>
      <div className="row">
        <div className="content-column col-lg-12 col-md-12 col-sm-12">
          <div className="inner-column">
            <ul className="list">
              {vehicleDetails.map((detail, index) => (
                <li key={index}>
                  <span>
                    <img fetchpriority="low" decoding="async" loading="lazy" src={detail.icon} width={detail.width} height={detail.height} alt="" />
                    {detail.label}
                  </span>
                  {detail.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
