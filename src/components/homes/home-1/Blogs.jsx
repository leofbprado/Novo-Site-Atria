import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Blogs({ hiddenTitle = false }) {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega posts ao montar (nenhum hook extra)
  useEffect(() => {
    let alive = true;

    const load = async () => {
      const timeoutId = setTimeout(() => {
        if (!alive) return;
        console.warn("⏱️ Timeout ao carregar posts do blog");
        setBlogPosts([]);
        setLoading(false);
      }, 8000);

      try {
        const { db } = await import("@/firebase/config");
        const { collection, getDocs, query, orderBy, limit } = await import("firebase/firestore");

        const blogRef = collection(db, "blog_posts");
        const q = query(blogRef, orderBy("publishedAt", "desc"), limit(3));

        const snap = await Promise.race([
          getDocs(q),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Query timeout")), 7000)),
        ]);

        clearTimeout(timeoutId);
        if (!alive) return;

        const posts = [];
        snap.forEach((doc) => {
          const data = doc.data() || {};
          if (!data.isHidden) {
            posts.push({
              id: doc.id,
              title: data.title || "Sem título",
              slug: data.slug || doc.id,
              coverImage: data.coverImage || "",
              publishedAt: data.publishedAt || "",
              content: data.content || "",
              author: data.author || "Átria Veículos",
              date: formatDate(data.publishedAt),
            });
          }
        });

        setBlogPosts(posts);
      } catch (e) {
        console.error("❌ Erro ao carregar posts do blog:", e);
        setBlogPosts([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch {
      return "Data inválida";
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html || "";
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text, length = 110) => {
    const clean = stripHtml(text);
    return clean.length > length ? clean.substring(0, length) + "..." : clean;
  };

  return (
    <>
      <style>{`
        .blog-section-homepage.layout-radius { position: relative; z-index: 2; clear: both; }
      `}</style>
      <section
        className="blog-section-homepage layout-radius"
        style={{
          backgroundColor: "#fff",
          padding: hiddenTitle ? "30px 0 60px 0" : "42px 0 60px 0",
          marginTop: "0px",
          clear: "both",
        }}
      >
        <div className="boxcar-container">
          {!hiddenTitle && (
            <div className="boxcar-title" style={{ textAlign: "left", marginBottom: 50 }}>
              <h2 style={{ color: "#1a2332", fontSize: 40, fontWeight: 700, margin: 0 }}>Últimas do Blog</h2>
            </div>
          )}

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
              <p style={{ color: "#64748b" }}>Carregando posts do blog...</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "#64748b" }}>Nenhum post disponível no momento.</p>
            </div>
          ) : (
            <div className="row">
              {blogPosts.map((post) => (
                <div key={post.id || post.slug} className="col-lg-4 col-md-6 col-sm-12" style={{ marginBottom: 24 }}>
                  <article
                    className="blog-block"
                    style={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", transition: "transform 0.3s ease" }}
                  >
                    <div className="inner-box">
                      <div className="image-box" style={{ position: "relative" }}>
                        <figure className="image" style={{ margin: 0 }}>
                          <Link to={`/blog-single/${post.slug}`}>
                            <img
                              fetchpriority="low"
                              src={post.coverImage}
                              alt={post.title}
                              style={{ width: "100%", height: 200, objectFit: "cover", transition: "transform 0.3s ease" }}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/WhatsApp+Image+2025-07-11+at+10.37.01-1920w.jpeg";
                              }}
                            />
                          </Link>
                        </figure>
                      </div>
                      <div className="content-box" style={{ padding: 20 }}>
                        <ul className="post-info" style={{ listStyle: "none", padding: 0, margin: "0 0 15px", fontSize: 14, color: "#666" }}>
                          <li style={{ display: "inline-block", marginRight: 15 }}>{post.date}</li>
                          <li style={{ display: "inline-block" }}>{post.author}</li>
                        </ul>
                        <h4 className="title" style={{ fontSize: 18, margin: "0 0 10px", lineHeight: 1.4, color: "#1a1a1a" }}>
                          <Link
                            to={`/blog-single/${post.slug}`}
                            style={{ color: "inherit", textDecoration: "none", transition: "color 0.3s ease" }}
                            onMouseOver={(e) => (e.currentTarget.style.color = "#1A75FF")}
                            onMouseOut={(e) => (e.currentTarget.style.color = "#1a1a1a")}
                          >
                            {post.title}
                          </Link>
                        </h4>
                        <div className="text" style={{ fontSize: 14, color: "#666", lineHeight: 1.5, marginBottom: 15 }}>
                          {truncateText(post.content)}
                        </div>
                        <Link
                          to={`/blog-single/${post.slug}`}
                          className="read-more"
                          style={{ color: "#1A75FF", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.3s ease" }}
                          onMouseOver={(e) => (e.currentTarget.style.color = "#0056cc")}
                          onMouseOut={(e) => (e.currentTarget.style.color = "#1A75FF")}
                        >
                          Ler mais →
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
