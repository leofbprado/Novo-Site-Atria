import React, { useEffect, useState } from "react";
import LucideIcon from "@/components/icons/LucideIcon";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega depoimentos ao montar (sem hooks com useRef)
  useEffect(() => {
    let alive = true;
    const run = async () => {
      const timeoutId = setTimeout(() => {
        if (!alive) return;
        console.warn("⏱️ Timeout ao carregar depoimentos");
        setTestimonials([]);
        setLoading(false);
      }, 8000);

      try {
        const { db } = await import("@/firebase/config");
        const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
        const q = query(collection(db, "depoimentos"), orderBy("created_at", "desc"));
        const snap = await Promise.race([
          getDocs(q),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Query timeout")), 7000)),
        ]);

        clearTimeout(timeoutId);
        if (!alive) return;

        const items = [];
        snap.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            imgSrc: data.foto || data.foto_url || "/images/resource/test-1.jpg",
            rating: data.rating || data.avaliacao || 5,
            name: data.nome || "Cliente",
            position: data.profissao || data.cidade || "Cliente",
            review: data.depoimento || "",
          });
        });

        setTestimonials(items);
      } catch (e) {
        console.error("❌ Erro ao carregar depoimentos:", e);
        setTestimonials([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, []);

  const Card = ({ t }) => (
    <div className="testimonial-card" style={{ padding: "0 15px" }}>
      <div
        className="testimonial-block"
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          transition: "transform 0.3s ease",
        }}
      >
        <div className="inner-box">
          <div className="row" style={{ alignItems: "center", margin: 0 }}>
            <div className="image-column col-lg-4 col-md-12 col-sm-12" style={{ padding: 20 }}>
              <div className="inner-column">
                <div className="image-box">
                  <figure className="image" style={{ margin: 0 }}>
                    <img
                      fetchpriority="low"
                      decoding="async"
                      src={t.imgSrc}
                      alt={`Foto de ${t.name}`}
                      style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8 }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9";
                      }}
                    />
                  </figure>
                </div>
              </div>
            </div>
            <div className="content-column col-lg-8 col-md-12 col-sm-12" style={{ padding: 20 }}>
              <div className="inner-column">
                <ul
                  className="rating"
                  style={{ display: "flex", alignItems: "center", marginBottom: 20, padding: 0, listStyle: "none" }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} style={{ marginRight: 5 }}>
                      <LucideIcon name="star" size={14} color="#e1c03f" />
                    </li>
                  ))}
                  <span
                    style={{
                      marginLeft: 10,
                      backgroundColor: "#e1c03f",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: 50,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {t.rating}
                  </span>
                </ul>
                <h6 className="title" style={{ fontSize: 18, fontWeight: 500, lineHeight: "32px", marginBottom: 8, color: "#1a2332" }}>
                  {t.name}
                </h6>
                <span style={{ color: "#616670", fontSize: 14, lineHeight: "24px", marginBottom: 15, display: "block" }}>
                  {t.position}
                </span>
                <div className="text" style={{ fontSize: 16, lineHeight: "28px", color: "#1a2332", fontFamily: "DM Sans, sans-serif" }}>
                  {t.review}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="testimonials-section-homepage" style={{ backgroundColor: "#fff", padding: "42px 0" }}>
      <div className="boxcar-container">
        <div className="boxcar-title" style={{ textAlign: "left", marginBottom: 50 }}>
          <h2 style={{ color: "#1a2332", fontSize: 40, fontWeight: 700, margin: 0 }}>O que nossos clientes dizem</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "4px solid #e2e8f0",
                borderTop: "4px solid #1A75FF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "#64748b" }}>Carregando depoimentos...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#64748b" }}>Nenhum depoimento disponível no momento.</p>
          </div>
        ) : (
          // Grid estático, sem slider e sem hooks extras
          <div className="row">
            {testimonials.map((t) => (
              <div key={t.id || t.name} className="col-lg-6 col-md-12" style={{ marginBottom: 24 }}>
                <Card t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
