import SmartSearchInput from "@/components/common/SmartSearchInput";
import { carTypes } from "@/data/categories";
import { Link, useNavigate } from "react-router-dom";
import { useFilters } from "@/contexts/FilterContext";
import React, { useRef, useEffect, useState } from "react";

export default function Hero() {
  const { updateFilters } = useFilters();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      console.log("🎬 Tentando iniciar vídeo...");

      const playVideo = async () => {
        try {
          await video.play();
          console.log("✅ Vídeo iniciado com sucesso");
        } catch (error) {
          console.warn("⚠️ Autoplay bloqueado:", error);
          // Tentar novamente após interação do usuário
          document.addEventListener(
            "click",
            async () => {
              try {
                await video.play();
                console.log("✅ Vídeo iniciado após clique");
              } catch (err) {
                console.error("❌ Erro ao iniciar vídeo:", err);
              }
            },
            { once: true },
          );
        }
      };

      // Tentar tocar quando canplay acontecer
      video.addEventListener("canplay", playVideo);

      // Fallback: forçar play após 2s se canplay não ocorrer
      const fallbackTimer = setTimeout(async () => {
        console.log("⏱️ Fallback: forçando play após 2s");
        try {
          await video.play();
          console.log("✅ Vídeo iniciado via fallback");
        } catch (error) {
          console.warn("⚠️ Fallback play falhou:", error);
        }
      }, 2000);

      // Cleanup
      return () => {
        clearTimeout(fallbackTimer);
        video.removeEventListener("canplay", playVideo);
      };
    }
  }, []);

  const handleCarTypeClick = (carType) => {
    // Mapear tipos de veículos para filtros
    const typeMapping = {
      Hatch: ["Hatchback", "Hatch"],
      Sedan: ["Sedan"],
      SUV: ["SUV", "Crossover"],
      Pickup: ["Pick-up", "Pickup", "Picape"],
    };

    const filterTypes = typeMapping[carType] || [carType];

    // Limpar filtros existentes e aplicar novo filtro de tipo
    updateFilters({
      search: "",
      brands: [],
      models: [],
      carTypes: filterTypes,
      category: filterTypes,
    });

    // Navegar para o estoque
    navigate("/inventory-list-01");

    console.log(`${carType} clicked - filtro aplicado:`, filterTypes);
  };
  return (
    <section
      className={`boxcar-banner-section-v1 ${isMobile ? "mobile-banner" : ""}`}
      data-wow-offset="9999"
    >
      <div
        className="relative w-full h-auto md:h-screen flex items-center justify-center overflow-visible pb-12 md:pb-0"
        style={{
          height: isMobile ? "80vh" : "100vh",
        }}
      >
        {/* Desktop Video */}
        {!isMobile && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            poster=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => console.error("❌ Erro no vídeo desktop:", e)}
            onCanPlay={() => console.log("✅ Vídeo desktop pode reproduzir")}
            onLoadStart={() =>
              console.log("🔄 Iniciando carregamento do vídeo desktop")
            }
            onLoadedData={() =>
              console.log("📊 Dados do vídeo desktop carregados")
            }
            onPlaying={() => console.log("▶️ Vídeo desktop reproduzindo")}
            style={{
              zIndex: 1,
              pointerEvents: "none",
              opacity: 1,
            }}
          >
            <source
              src="https://res.cloudinary.com/dyngqkiyl/video/upload/v1752837807/freepik__use-the-uploaded-19201080-image-as-the-base-for-a-__30900_yx1po1.mp4"
              type="video/mp4"
            />
            Seu navegador não suporta vídeos HTML5.
          </video>
        )}

        {/* Mobile Video - Cloudinary Embedded */}
        {isMobile && (
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=dyngqkiyl&public_id=WhatsApp_Video_2025-07-30_at_18.07.30_wudayl&profile=cld-looping"
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)", // Centraliza perfeitamente
              minWidth: "100%",
              minHeight: "100%",
              width: "120%", // Ligeiramente maior para cobertura total
              height: "120%",
              border: "none",
              zIndex: 1,
              pointerEvents: "none",
              margin: 0,
              padding: 0,
              objectFit: "cover",
            }}
            allow="autoplay; fullscreen"
            title="Banner Mobile Átria Veículos"
          />
        )}
        {/* Overlay escuro para melhorar contraste do texto */}
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: isMobile ? 0.4 : 0.3,
            zIndex: 2,
          }}
        />
        {/* Content */}
        <div className="container">
          <div
            className="banner-content"
            style={{
              position: !isMobile ? "absolute" : "relative",
              top: !isMobile ? "50%" : "auto",
              left: !isMobile ? "50%" : "auto",
              transform: !isMobile ? "translate(-50%, -50%)" : "none",
              zIndex: 1000,
              visibility: "visible !important",
              opacity: "1 !important",
              display: "block !important",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: isMobile ? "1.1rem" : "1rem",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Compra segura, preço justo e carros de qualidade.
            </span>
            <h2
              style={{
                color: "#ffffff",
                fontSize: isMobile ? "2.5rem" : "3.5rem",
                lineHeight: isMobile ? "1.2" : "1.1",
                marginBottom: "20px",
              }}
            >
              Encontre seu carro perfeito.
            </h2>
            <div className="form-tabs">
              <div className="form-tab-content">
                <div className="form-tab-pane current" id="tab-1">
                  <SmartSearchInput />
                </div>
              </div>
              {!isMobile && (
                <>
                  <span style={{ color: "#ffffff" }}>
                    Ou navegue por modelo em destaque
                  </span>
                  <div className="custom-car-buttons">
                    <button
                      className="car-button"
                      onClick={() => handleCarTypeClick("Hatch")}
                    >
                      <img src="/hatch-button.png" alt="Hatch" />
                    </button>
                    <button
                      className="car-button"
                      onClick={() => handleCarTypeClick("Sedan")}
                    >
                      <img src="/sedan-button-new.png" alt="Sedan" />
                    </button>
                    <button
                      className="car-button"
                      onClick={() => handleCarTypeClick("SUV")}
                    >
                      <img src="/suv-button.png" alt="SUV" />
                    </button>
                    <button
                      className="car-button"
                      onClick={() => handleCarTypeClick("Pickup")}
                    >
                      <img src="/pickup-button.png" alt="Pickup" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
