import React from "react";

import SelectComponent from "../common/SelectComponent";
export default function DropdownFilter() {
  return (
    <section className="inventory-pager style-1">
      <div className="boxcar-container">
        <form onSubmit={(e) => e.preventDefault()} className="inventory-form">
          <div className="form_boxes line-r">
            <SelectComponent options={["Carros Usados", "Audi", "Honda"]} />
          </div>
          <div className="form_boxes line-r">
            <SelectComponent options={["Todas as Marcas", "Audi", "Honda", "CAOA Chery", "Fiat", "Jeep"]} />
          </div>
          <div className="form_boxes line-r">
            <SelectComponent options={["Todos os Modelos", "A3", "Accord"]} />
          </div>
          <div className="form_boxes line-r">
            <SelectComponent options={["Qualquer Preço", "R$ 20.000", "R$ 30.000"]} />
          </div>
          <div className="form_boxes">
            <a href="#" title="" className="filter-popup">
              <img fetchpriority="low" decoding="async" loading="lazy" alt="" src="/images/icons/filter.svg" width={24} height={24} />
              Mais Filtros
            </a>
          </div>
          <div className="form-submit">
            <button type="submit" className="theme-btn">
              <i className="flaticon-search" />
              Buscar 9451 Carros
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
