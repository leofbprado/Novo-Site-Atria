import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <div className="upper-box">
        <div className="boxcar-container">
          <div className="row wow fadeInUp">
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="boxcar-title">
                <ul className="breadcrumb">
                  <li>
                    <Link to={`/`}>Home</Link>
                  </li>
                  <li>
                    <span>Sobre a Átria</span>
                  </li>
                </ul>
                <h2>Sobre a Átria</h2>
                <div className="text">
                  Somos uma equipe apaixonada por automóveis e comprometida em oferecer a melhor experiência de compra para nossos clientes.
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="content-box">
                <div className="text">
                  Com mais de 10 anos de mercado e mais de 12.000 veículos vendidos, a Átria Veículos destaca-se entre as lojas de comércio de seminovos de toda a região metropolitana de Campinas pela excelência de seu atendimento e serviços.
                </div>
                <div className="text">
                  Oferecemos perícia veicular, time de vendas online e serviços de venda delivery, sempre buscando proporcionar a melhor experiência de compra de produtos e serviços do ramo automobilístico, sendo motivo de orgulho para nossos clientes, colaboradores e parceiros.
                </div>
                <div className="text">
                  Nossa missão é estar entre os principais grupos de concessionárias de veículos em Campinas e região, sendo referência em atendimento e qualidade.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* gallery-sec */}
      <div className="galler-section">
        <div className="boxcar-container">
          <div className="row">
            <div className="exp-block col-md-2 col-sm-12">
              <div className="inner-box">
                <div className="exp-box">
                  <h2 className="title">10+</h2>
                  <div className="text">Anos no Mercado</div>
                </div>
                <div className="image-box">
                  <figure className="image">
                    <img fetchpriority="low" alt="Átria Veículos - Anos de experiência" width={210} height={210} src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" loading="lazy" decoding="async" />
                  </figure>
                </div>
              </div>
            </div>
            <div className="image-block style-center col-md-5 col-sm-12">
              <div className="image-box">
                <figure className="image">
                  <img fetchpriority="low" alt="Loja Átria Veículos" width={567} height={540} src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" loading="lazy" decoding="async" />
                </figure>
              </div>
            </div>
            <div className="image-block col-md-5 col-sm-12">
              <div className="image-box two">
                <figure className="image">
                  <img fetchpriority="low" alt="Estoque Átria Veículos" width={567} height={300} src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" loading="lazy" decoding="async" />
                </figure>
              </div>
              <div className="row box-double-img">
                <div className="image-block col-lg-5 col-5">
                  <div className="image-box">
                    <figure className="image">
                      <img fetchpriority="low" alt="Equipe Átria Veículos" width={210} height={210} src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" loading="lazy" decoding="async" />
                    </figure>
                  </div>
                </div>
                <div className="image-block col-lg-7 col-7">
                  <div className="image-box">
                    <figure className="image">
                      <img fetchpriority="low" alt="Atendimento Átria Veículos" width={329} height={210} src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" loading="lazy" decoding="async" />
                    </figure>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missão, Visão e Valores */}
      <div className="mission-vision-values">
        <div className="boxcar-container">
          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="value-box">
                <h3>Missão</h3>
                <div className="text">
                  Proporcionar a melhor experiência de compra de produtos e serviços do ramo automobilístico, sendo motivo de orgulho para nossos clientes, colaboradores e parceiros.
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="value-box">
                <h3>Visão</h3>
                <div className="text">
                  Estar entre os principais grupos de concessionárias de veículos em Campinas e região, sendo referência em atendimento.
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12">
              <div className="value-box">
                <h3>Valores</h3>
                <ul className="values-list">
                  <li><strong>Ética:</strong> Agir com transparência nas relações</li>
                  <li><strong>Conhecimento:</strong> Busca incessante pela excelência</li>
                  <li><strong>Inovação:</strong> Dinamismo e criatividade</li>
                  <li><strong>Responsabilidade:</strong> Integridade e comprometimento</li>
                  <li><strong>Desenvolvimento Humano:</strong> Reconhecer talentos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nossas Lojas */}
      <div className="our-stores">
        <div className="boxcar-container">
          <div className="row">
            <div className="col-lg-12">
              <div className="boxcar-title text-center">
                <h2>Nossas Lojas</h2>
                <div className="text">
                  3 lojas estrategicamente localizadas em Campinas para melhor atendê-lo
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="store-box">
                <h4>R. Abolição</h4>
                <div className="store-info">
                  <p><strong>Endereço:</strong> Rua Abolição Nº 1500 - VL Joaquim Inacio</p>
                  <p><strong>CEP:</strong> 13045-750</p>
                  <p><strong>Telefone:</strong> (19) 3199-2552</p>
                  <p><strong>Horário:</strong> 2ª a Sábado - 08:00 às 18:00</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12">
              <div className="store-box">
                <h4>JD Guanabara</h4>
                <div className="store-info">
                  <p><strong>Endereço:</strong> Avenida Brasil, 1277 - Jardim Guanabara</p>
                  <p><strong>CEP:</strong> 13070-178</p>
                  <p><strong>Telefone:</strong> (19) 3094-0015</p>
                  <p><strong>Horário:</strong> 2ª a Sábado - 08:00 às 18:00</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-12 col-sm-12">
              <div className="store-box">
                <h4>JD Campos Elíseos</h4>
                <div className="store-info">
                  <p><strong>Endereço:</strong> Rua Domicio Pacheco e Silva, 1328</p>
                  <p><strong>CEP:</strong> 13060-190</p>
                  <p><strong>Telefone:</strong> (19) 3500-8271</p>
                  <p><strong>Horário:</strong> 2ª a Sábado - 08:00 às 18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="statistics-section">
        <div className="boxcar-container">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="stat-box">
                <h3>12.000+</h3>
                <div className="text">Veículos Vendidos</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="stat-box">
                <h3>10+</h3>
                <div className="text">Anos de Mercado</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="stat-box">
                <h3>3</h3>
                <div className="text">Lojas em Campinas</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <div className="stat-box">
                <h3>100%</h3>
                <div className="text">Satisfação do Cliente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}