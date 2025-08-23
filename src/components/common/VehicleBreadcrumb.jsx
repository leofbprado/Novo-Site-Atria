import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function VehicleBreadcrumb({ vehicle }) {
  // Extract year from vehicle data or title
  const year = vehicle?.year || (vehicle?.title?.match(/(20\d{2}|19\d{2})/)?.[1] ?? "");
  
  // Handle JSON-LD structured data
  useEffect(() => {
    const id = 'jsonld-breadcrumb';
    const brand = vehicle.brand || vehicle.marca || '';
    const model = vehicle.model || vehicle.modelo || '';
    const year  = vehicle.year  || vehicle.ano  || (vehicle.title?.match(/(20\d{2}|19\d{2})/)?.[1] ?? '');
    const data = {
      "@context":"https://schema.org","@type":"BreadcrumbList",
      "itemListElement":[
        {"@type":"ListItem","position":1,"name":"Início","item":"https://www.atriaveiculos.com/"},
        {"@type":"ListItem","position":2,"name":"Estoque de Veículos","item":"https://www.atriaveiculos.com/estoque"},
        {"@type":"ListItem","position":3,"name":`${brand} ${model} ${year}`.trim(),"item":window.location.href}
      ]
    };
    let s = document.getElementById(id);
    if(!s){ s=document.createElement('script'); s.id=id; s.type='application/ld+json'; document.head.appendChild(s); }
    s.text = JSON.stringify(data);
    return () => { const n=document.getElementById(id); if(n) n.remove(); };
  }, [vehicle?.brand, vehicle?.marca, vehicle?.model, vehicle?.modelo, vehicle?.year, vehicle?.ano, vehicle?.title]);
  
  if (!vehicle) return null;
  
  const brand = vehicle.brand || vehicle.marca || '';
  const model = vehicle.model || vehicle.modelo || '';
  
  return (
    <nav id="bc-veiculo" aria-label="breadcrumb" className="breadcrumb">
      <ol>
        <li><Link to="/">Início</Link></li>
        <li className="bc-sep" aria-hidden="true">/</li>
        <li><Link to="/estoque">Estoque de Veículos</Link></li>
        <li className="bc-sep" aria-hidden="true">/</li>
        <li aria-current="page">{brand} {model} {year}</li>
      </ol>
    </nav>
  );
}