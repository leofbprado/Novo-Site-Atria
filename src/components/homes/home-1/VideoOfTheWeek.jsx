import { useState, useEffect } from 'react';
import LazyYouTube from '../../common/LazyYouTube';
import { getFirestore, loadFirestoreOperations } from '../../../utils/firebaseLoader';

export default function VideoOfTheWeek() {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚡ Carregar vídeo da semana do Firebase com lazy loading
  useEffect(() => {
    const loadVideoOfTheWeek = async () => {
      try {
        const db = await getFirestore();
        const { doc, getDoc } = await loadFirestoreOperations();
        
        const videoDoc = await getDoc(doc(db, 'config', 'video_semana'));
        if (videoDoc.exists()) {
          const data = videoDoc.data();
          if (data.video_url) {
            setVideoData(data);
            console.log('✅ Vídeo da semana encontrado:', data);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar vídeo da semana:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideoOfTheWeek();
  }, []);

  // ⚡ Extrair ID do YouTube para componente LazyYouTube
  const extractVideoId = (url) => {
    if (!url || !url.trim()) return '';
    
    try {
      // YouTube (incluindo Shorts)
      const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch && youtubeMatch[1]) {
        return youtubeMatch[1];
      }
      
      return '';
    } catch (error) {
      console.error('Erro ao extrair ID do vídeo:', error);
      return '';
    }
  };

  // Não renderizar se não tiver vídeo ou estiver carregando
  if (loading || !videoData || !videoData.video_url) {
    return null;
  }

  return (
    <section className="layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title-three">
          <ul className="breadcrumb">
            <li><span>Vídeo</span></li>
          </ul>
          <h2 className="title">Vídeo da Semana</h2>
        </div>

        <div className="row">
          <div className="col-lg-8 col-md-10 mx-auto">
            <div className="video-container" style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: '12px',
              backgroundColor: '#f8f9fa',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}>
              <LazyYouTube
                videoId={extractVideoId(videoData.video_url)}
                title="Vídeo da Semana - Átria Veículos"
                className="lazy-youtube-video-semana"
              />
            </div>
            
            <div className="text-center mt-4">
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: 0 }}>
                Confira nosso vídeo semanal com as melhores ofertas e novidades!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}