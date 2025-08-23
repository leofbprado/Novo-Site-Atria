import BlogsSingle from "@/components/blogs/BlogsSingle";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

import MetaComponent from "@/components/common/Metacomonent";

export default function BlogSinglePage() {
  const params = useParams();
  const [blogItem, setBlogItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        const blogRef = collection(db, 'blog_posts');
        const blogQuery = query(blogRef, where('slug', '==', params.id));
        const snapshot = await getDocs(blogQuery);
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setBlogItem({
            id: doc.id,
            title: data.title,
            slug: data.slug,
            coverImage: data.coverImage,
            publishedAt: data.publishedAt,
            content: data.content,
            author: 'Átria Veículos',
            date: formatDate(data.publishedAt)
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Erro ao carregar post do blog:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPost();
  }, [params.id]);

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

  const metadata = {
    title: blogItem ? `${blogItem.title} || Átria Veículos` : "Blog || Átria Veículos",
    description: blogItem ? `Leia mais sobre: ${blogItem.title}` : "Blog da Átria Veículos",
  };

  if (loading) {
    return (
      <>
        <MetaComponent meta={metadata} />
        <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
        <div style={{ 
          minHeight: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column' 
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1A75FF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b' }}>Carregando post...</p>
        </div>
        <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
        <FixedBottomMenu />
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <MetaComponent meta={metadata} />
        <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
        <div style={{ 
          minHeight: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column' 
        }}>
          <h2 style={{ color: '#1a2332', marginBottom: '16px' }}>Post não encontrado</h2>
          <p style={{ color: '#64748b' }}>O post que você procura não existe ou foi removido.</p>
        </div>
        <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
        <FixedBottomMenu />
      </>
    );
  }

  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
      <BlogsSingle blogItem={blogItem} />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      <FixedBottomMenu />
    </>
  );
}
