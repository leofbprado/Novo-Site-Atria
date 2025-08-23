import React, { useState } from "react";
import SelectComponent from "../common/SelectComponent";

// import Slider from "rc-slider";
import Slider from "../common/SimpleSlider";
export default function Sidebar() {
  const [price, setPrice] = useState([5000, 35000]);
  const handlePrice = (value) => {
    setPrice(value);
  };
  return (
    <div className="wrap-fixed-sidebar">
      <div className="sidebar-backdrop" />
      <div className="widget-sidebar-filter">
        <div className="fixed-sidebar-title">
          <h3>Mais Filtros</h3>
          <a href="#" title="" className="close-filters">
            <img fetchpriority="low" decoding="async" loading="lazy" alt="" src="/images/icons/close.svg" width={30} height={30} />
          </a>
        </div>
        <div className="inventory-sidebar">
          <div className="inventroy-widget widget-location">
            <div className="row">
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Localização</label>

                  <SelectComponent
                    options={["São Paulo", "Rio de Janeiro", "Belo Horizonte"]}
                  />
                </div>
              </div>
              <div className="col-lg-7">
                <div className="form_boxes">
                  <label>Buscar em um raio de</label>

                  <SelectComponent options={["50 km", "100 km", "200 km"]} />
                </div>
              </div>
              <div className="col-lg-5">
                <div className="form_boxes">
                  <label>CEP</label>

                  <SelectComponent
                    options={["01000-000", "20000-000", "30000-000"]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Condição</label>

                  <SelectComponent
                    options={[
                      "Novo e Usado",
                      "Apenas Novos",
                      "Apenas Usados",
                      "Seminovos",
                    ]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="categories-box">
                  <h6 className="title">Tipo</h6>
                  <div className="cheak-box">
                    <label className="contain">
                      SUV (1,456)
                      <input type="checkbox" defaultChecked="checked" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Sedã (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Hatchback (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Cupê (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Conversível (1,456)
                      <input type="checkbox" defaultChecked="checked" />
                      <span className="checkmark" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Marca</label>

                  <SelectComponent
                    options={["Toyota", "Honda", "Ford", "Chevrolet", "CAOA Chery", "Fiat", "Jeep"]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Modelo</label>

                  <SelectComponent
                    options={[
                      "Adicionar Modelo",
                      "Corolla",
                      "Civic",
                      "Fiesta",
                    ]}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form_boxes">
                  <label>Ano mín.</label>

                  <SelectComponent options={["2019", "2020", "2021", "2022"]} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="form_boxes">
                  <label>Ano máx.</label>

                  <SelectComponent options={["2023", "2020", "2021", "2022"]} />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Quilometragem</label>

                  <SelectComponent
                    options={[
                      "Qualquer Quilometragem",
                      "0 - 20.000 km",
                      "20.000 - 50.000 km",
                      "50.000+ km",
                    ]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Tipo de Tração</label>

                  <SelectComponent
                    options={[
                      "Qualquer Tipo",
                      "Tração Dianteira",
                      "Tração Traseira",
                      "Tração Integral",
                    ]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="price-box">
                  <h6 className="title">Preço</h6>
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="row g-0"
                  >
                    <div className="form-column col-lg-6">
                      <div className="form_boxes">
                        <label>Preço mín.</label>
                        <div className="drop-menu">R$ {price[0].toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="form-column v2 col-lg-6">
                      <div className="form_boxes">
                        <label>Preço máx.</label>
                        <div className="drop-menu">R$ {price[1].toLocaleString()}</div>
                      </div>
                    </div>
                  </form>
                  <div className="widget-price">
                    <Slider
                      formatLabel={() => ``}
                      range
                      max={50000}
                      min={0}
                      defaultValue={price}
                      onChange={(value) => handlePrice(value)}
                      id="slider"
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="categories-box border-none-bottom">
                  <h6 className="title">Transmissão</h6>
                  <div className="cheak-box">
                    <label className="contain">
                      Automática (1,456)
                      <input type="checkbox" defaultChecked="checked" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Manual (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      CVT (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="categories-box border-none-bottom">
                  <h6 className="title">Combustível</h6>
                  <div className="cheak-box">
                    <label className="contain">
                      Diesel (1,456)
                      <input type="checkbox" defaultChecked="checked" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Gasolina (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Híbrido (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Elétrico (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Cor Externa</label>

                  <SelectComponent
                    options={["Azul", "Branco", "Preto", "Prata"]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Cor Interna</label>

                  <SelectComponent
                    options={["Preto", "Bege", "Cinza", "Marrom"]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Portas</label>

                  <SelectComponent
                    options={["2", "3", "4", "5"]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form_boxes">
                  <label>Cilindros</label>

                  <SelectComponent
                    options={["4", "6", "8", "12"]}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="categories-box border-none-bottom m-0">
                  <h6 className="title">Características Principais</h6>
                  <div className="cheak-box">
                    <label className="contain">
                      Câmera 360 graus (1,456)
                      <input type="checkbox" defaultChecked="checked" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Bluetooth (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Partida sem chave (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Sistema de Navegação (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Apoios de cabeça ativos (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Assistente de frenagem (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                    <label className="contain">
                      Sistemas de assistência ao estacionamento (1,456)
                      <input type="checkbox" />
                      <span className="checkmark" />
                    </label>
                  </div>
                  <a href="#" title="" className="show-more">
                    Mostrar mais 8
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/*widget end*/}
        </div>
      </div>
    </div>
  );
}
