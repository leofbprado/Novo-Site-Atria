import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";

export default function Blogs2() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configurações do carrossel similar aos depoimentos
  const slickOptions = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        // ⚡ Firebase lazy loading - só carrega quando necessário
        const { db } = await import("@/firebase/config");
        const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
        
        const blogRef = collection(db, 'blog_posts');
        const blogQuery = query(blogRef, orderBy('publishedAt', 'desc'));
        const snapshot = await getDocs(blogQuery);
        
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
              date: formatDate(data.publishedAt),
              excerpt: extractExcerpt(data.content)
            });
          }
        });
        
        setBlogPosts(posts);
      } catch (error) {
        console.error('Erro ao carregar posts do blog:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const extractExcerpt = (htmlContent) => {
    // Remove HTML tags e pega os primeiros 150 caracteres
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
  };

  if (loading) {
    return (
      <>
        <style>{`
          .blog-section-four {
            border-bottom-left-radius: 80px !important;
            border-bottom-right-radius: 80px !important;
            overflow: hidden !important;
            position: relative !important;
          }
        `}</style>
        <section 
          className="blog-section-four"
          style={{
            borderBottomLeftRadius: '80px',
            borderBottomRightRadius: '80px',
            backgroundColor: '#fff',
            overflow: 'hidden'
          }}
        >
        <div className="boxcar-container">
          <div className="boxcar-title wow fadeInUp">
            <h2>Blog da Átria Veículos</h2>
            <div className="text">
              Dicas, novidades e informações do mundo automotivo
            </div>
          </div>
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
        </div>
        </section>
      </>
    );
  }

  return (
    <>
      <style>{`
        .blog-section-four {
          border-bottom-left-radius: 80px !important;
          border-bottom-right-radius: 80px !important;
          overflow: hidden !important;
          position: relative !important;
        }
      `}</style>
      <section 
        className="blog-section-four"
        style={{
          borderBottomLeftRadius: '80px',
          borderBottomRightRadius: '80px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}
      >
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <h2>Blog da Átria Veículos</h2>
          <div className="text">
            Dicas, novidades e informações do mundo automotivo
          </div>
        </div>
        
        {blogPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#64748b' }}>
              Nenhum post encontrado. Acesse o painel admin para adicionar posts.
            </p>
          </div>
        ) : (
          <Slider {...slickOptions} className="blog-carousel">
            {blogPosts.map((post, index) => (
              <div key={post.id} className="blog-slide">
                <div className="blog-block-four" style={{ margin: '0 15px' }}>
                  <div className="inner-box wow fadeInUp">
                    <div className="image-box">
                      <figure className="image">
                        <Link to={`/blog-single/${post.slug}`}>
                          <img fetchpriority="low" alt={post.title} width={400} height={250} src={post.coverImage} loading="lazy" decoding="async" style={{ objectFit: 'cover', cursor: 'pointer', width: '100%', height: '250px', borderRadius: '8px 8px 0 0' }} />
                        </Link>
                      </figure>
                    </div>
                    <div className="content-box" style={{ padding: '20px' }}>
                      <ul className="post-info" style={{ marginBottom: '15px' }}>
                        <li style={{ color: '#1A75FF', fontSize: '12px' }}>{post.author}</li>
                        <li style={{ color: '#666', fontSize: '12px' }}>{post.date}</li>
                      </ul>
                      <h6 className="title" style={{ 
                        fontSize: '18px', 
                        lineHeight: '1.4', 
                        marginBottom: '12px',
                        height: '50px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        <Link 
                          to={`/blog-single/${post.slug}`}
                          style={{ color: '#000', textDecoration: 'none' }}
                        >
                          {post.title}
                        </Link>
                      </h6>
                      <div 
                        className="text" 
                        style={{ 
                          fontSize: '14px',
                          color: '#666',
                          lineHeight: '1.5',
                          marginBottom: '15px',
                          height: '60px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {post.excerpt}
                      </div>
                      <Link 
                        to={`/blog-single/${post.slug}`} 
                        className="btn-two"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#1A75FF',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Ler Mais
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={12}
                          height={12}
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_659_14687)">
                            <path
                              d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                              fill="#1A75FF"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_659_14687">
                              <rect width={14} height={14} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
        
        {/* Link para ver todos os posts */}
        <div className="text-center mt-5">
          <Link 
            to="/blog" 
            className="theme-btn btn-style-one"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#1A75FF',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Ver Todos os Posts
          </Link>
        </div>
      </div>
    </section>
    </>
  );
}
