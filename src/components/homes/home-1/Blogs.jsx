import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { BlogImage } from "../../common/OptimizedImage";
import useOnVisible from "@/utils/useOnVisible";

export default function Blogs({ hiddenTitle = false }) {
  const [ref, visible] = useOnVisible();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('🔍 Componente Blogs renderizando...');

  useEffect(() => {
    if (!visible) return;
    const loadBlogPosts = async () => {
      console.log('🔍 Carregando posts do blog do Firebase...');
      
      // Timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⏱️ Timeout ao carregar posts do blog');
        setBlogPosts([]);
        setLoading(false);
      }, 8000); // 8 second timeout
      
      try {
        // ⚡ Firebase lazy loading - só carrega quando necessário
        const { db } = await import("@/firebase/config");
        const { collection, getDocs, query, orderBy, limit } = await import("firebase/firestore");
        
        const blogRef = collection(db, 'blog_posts');
        const blogQuery = query(blogRef, orderBy('publishedAt', 'desc'), limit(3));
        
        // Use Promise.race to implement timeout
        const snapshot = await Promise.race([
          getDocs(blogQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 7000)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        const posts = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (!data.isHidden) { // Só mostra posts publicados
            posts.push({
              id: doc.id,
              title: data.title,
              slug: data.slug,
              coverImage: data.coverImage,
              publishedAt: data.publishedAt,
              content: data.content,
              author: 'Átria Veículos',
              date: formatDate(data.publishedAt)
            });
          }
        });
        
        console.log(`✅ ${posts.length} posts do blog carregados:`, posts);
        setBlogPosts(posts);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Erro ao carregar posts do blog:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, [visible]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const slickOptions = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    // Configurações de acessibilidade
    accessibility: true,
    focusOnSelect: true,
    pauseOnFocus: true,
    pauseOnHover: true,
    useCSS: true,
    useTransform: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text, length = 100) => {
    const cleanText = stripHtml(text);
    return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
  };

  if (!visible) {
    return (
      <>
        <style>{`
          .blog-section-homepage.layout-radius {
            position: relative !important;
            z-index: 2 !important;
            clear: both !important;
          }
        `}</style>
        <section 
          ref={ref}
          className="blog-section-homepage layout-radius"
          style={{ 
            backgroundColor: '#fff', 
            padding: hiddenTitle ? '30px 0 60px 0' : '42px 0 60px 0',
            marginTop: '0px',
            clear: 'both',
            minHeight: '280px'
          }}
        >
          <div className="boxcar-container">
            {!hiddenTitle && (
              <div className="boxcar-title" style={{ textAlign: 'left', marginBottom: '50px' }}>
                <h2 style={{ color: '#1a2332', fontSize: '40px', fontWeight: '700', margin: 0 }}>Últimas do Blog</h2>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <style>{`
        .blog-section-homepage.layout-radius {
          position: relative !important;
          z-index: 2 !important;
          clear: both !important;
        }
        .blog-section-homepage .blog-slider {
          position: relative !important;
          z-index: 3 !important;
        }
      `}</style>
      <section 
        ref={ref}
        className="blog-section-homepage layout-radius"
        style={{ 
          backgroundColor: '#fff', 
          padding: hiddenTitle ? '30px 0 60px 0' : '42px 0 60px 0',
          marginTop: '0px',
          clear: 'both'
        }}
      >
      <div className="boxcar-container">
        {!hiddenTitle && (
          <div className="boxcar-title wow fadeInUp" style={{ textAlign: 'left', marginBottom: '50px' }}>
            <h2 style={{ color: '#1a2332', fontSize: '40px', fontWeight: '700', margin: 0 }}>Últimas do Blog</h2>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #1A75FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#64748b' }}>Carregando posts do blog...</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#64748b' }}>
              Nenhum post disponível no momento.
            </p>
          </div>
        ) : (
          <Slider {...slickOptions} className="blog-slider">
            {blogPosts.map((post, index) => (
              <div key={index} className="blog-card" style={{ padding: '0 15px' }}>
                <article className="blog-block" style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.3s ease'
                }}>
                  <div className="inner-box">
                    <div className="image-box" style={{ position: 'relative' }}>
                      <figure className="image" style={{ margin: 0 }}>
                        <Link to={`/blog-single/${post.slug}`}>
                          <img fetchpriority="low" src={post.coverImage} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover', transition: 'transform 0.3s ease' }} loading="lazy" decoding="async" onLoad={() => {
                              console.log('✅ Blog img loaded:', post.coverImage);
                            }}
                            onError={(e) => {
                              console.error('❌ Blog img error:', post.coverImage);
                              e.target.src = 'https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/WhatsApp+Image+2025-07-11+at+10.37.01-1920w.jpeg';
                            }}
                          />
                        </Link>
                      </figure>
                    </div>
                    <div className="content-box" style={{ padding: '20px' }}>
                      <ul className="post-info" style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: '0 0 15px', 
                        fontSize: '14px', 
                        color: '#666'
                      }}>
                        <li style={{ display: 'inline-block', marginRight: '15px' }}>
                          <i className="fa fa-calendar" style={{ marginRight: '5px' }}></i>
                          {post.date}
                        </li>
                        <li style={{ display: 'inline-block' }}>
                          <i className="fa fa-user" style={{ marginRight: '5px' }}></i>
                          {post.author}
                        </li>
                      </ul>
                      <h4 className="title" style={{ 
                        fontSize: '18px', 
                        margin: '0 0 10px', 
                        lineHeight: '1.4',
                        color: '#1a1a1a'
                      }}>
                        <Link 
                          to={`/blog-single/${post.slug}`}
                          style={{ 
                            color: 'inherit', 
                            textDecoration: 'none',
                            transition: 'color 0.3s ease'
                          }}
                          onMouseOver={(e) => e.target.style.color = '#1A75FF'}
                          onMouseOut={(e) => e.target.style.color = '#1a1a1a'}
                        >
                          {post.title}
                        </Link>
                      </h4>
                      <div className="text" style={{ 
                        fontSize: '14px', 
                        color: '#666', 
                        lineHeight: '1.5',
                        marginBottom: '15px'
                      }}>
                        {truncateText(post.content)}
                      </div>
                      <Link 
                        to={`/blog-single/${post.slug}`}
                        className="read-more"
                        style={{
                          color: '#1A75FF',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#0056cc'}
                        onMouseOut={(e) => e.target.style.color = '#1A75FF'}
                      >
                        Ler mais →
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </section>
    </>
  );
}