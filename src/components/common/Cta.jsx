import React from "react";
import { Link } from "react-router-dom";

export default function Cta() {
  return (
    <section className="cta-section-simple bg-white">
      <div className="boxcar-container">
        <div className="cta-wrapper d-flex flex-wrap align-items-center">
          {/* Imagem - 50% */}
          <div className="cta-image col-lg-6 col-12 p-0">
            <img height="600" width="800" fetchpriority="low" decoding="async" loading="lazy" src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_480/v1/atria-veiculos/images/misc/sell-car-cta" srcSet="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_480/v1/atria-veiculos/images/misc/sell-car-cta 480w, https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_960/v1/atria-veiculos/images/misc/sell-car-cta 960w" sizes="(max-width: 600px) 100vw, 480px" alt="Venda seu carro com segurança" style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "15px 0 0 15px" }} />
          </div>

          {/* Blue Card - 50% */}
          <div className="cta-content col-lg-6 col-12 p-0">
            <div style={{
              background: "linear-gradient(135deg, #405FF2 0%, #3B51D9 100%)",
              height: "400px",
              padding: "50px 40px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              borderRadius: "0 15px 15px 0"
            }}>
              <h3 style={{
                fontSize: "32px",
                fontWeight: "700",
                marginBottom: "20px",
                lineHeight: "1.2"
              }}>
                Venda Seu Carro com Segurança
              </h3>
              
              <p style={{
                fontSize: "16px",
                marginBottom: "30px",
                opacity: 0.9,
                lineHeight: "1.6"
              }}>
                Avaliação justa e pagamento à vista. Cuidamos de toda a documentação para você.
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <Link 
                  to="/vender" 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "white",
                    color: "#405FF2",
                    padding: "15px 30px",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "16px",
                    transition: "all 0.3s ease"
                  }}
                >
                  Quero Vender
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <svg
                  style={{ opacity: 0.6 }}
                  xmlns="http://www.w3.org/2000/svg"
                  width={60}
                  height={60}
                  viewBox="0 0 110 110"
                  fill="none"
                >
                  <path
                    d="M17.1875 84.2276V25.7724C17.1875 13.9118 26.779 4.29688 38.6109 4.29688H25.5664C13.7008 4.29688 4.08203 13.9156 4.08203 25.7812V84.2188C4.08203 96.0841 13.7008 105.703 25.5664 105.703H38.6109C26.779 105.703 17.1875 96.0882 17.1875 84.2276Z"
                    fill="rgba(255,255,255,0.2)"
                  />
                  <path
                    d="M72.4023 104.506C70.1826 105.281 67.7967 105.703 65.3125 105.703H25.7812C13.9156 105.703 4.29688 96.0841 4.29688 84.2188V25.7812C4.29688 13.9156 13.9156 4.29688 25.7812 4.29688H65.3125C77.1779 4.29688 86.7969 13.9156 86.7969 25.7812V48.3398M54.7852 82.2852H71.1133M21.4844 82.0703L25.4341 86.1614C27.1343 87.8681 29.8912 87.8681 31.5915 86.1614L39.7461 77.7734"
                    stroke="white"
                    strokeWidth={3}
                    strokeMiterlimit={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M105.047 70.0629C100.32 68.2247 97.1951 67.9622 94.8535 67.9622C90.5029 67.9622 87.0117 71.489 87.0117 75.8398C87.0117 80.1906 90.9148 83.7175 96.6917 83.7175C101.681 83.7175 105.703 87.2444 105.703 91.5952C105.703 95.9458 101.961 99.4729 97.6106 99.4729C95.5763 99.4729 91.0458 98.8124 86.582 97.038M96.6797 67.9622V61.0156M96.6797 99.4727V105.703M57.793 57.793V59.5117M34.1602 57.793V59.5117"
                    stroke="white"
                    strokeWidth={3}
                    strokeMiterlimit={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          /* Desktop - lado a lado */
          @media (min-width: 992px) {
            .cta-wrapper {
              margin: 0 auto;
              max-width: 1200px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              border-radius: 15px;
            }
          }
          
          /* Mobile - empilhado */
          @media (max-width: 991px) {
            .cta-image img {
              border-radius: 15px 15px 0 0 !important;
            }
            
            .cta-content > div {
              border-radius: 0 0 15px 15px !important;
            }
            
            .cta-wrapper {
              margin: 0 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              border-radius: 15px;
            }
          }
        `}
      </style>
    </section>
  );
}