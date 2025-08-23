import { useState, useCallback, memo } from 'react';
import './LazyYouTube.css';

// ⚡ LAZY YOUTUBE COMPONENT - Reduces initial load by 943KB
const LazyYouTube = ({ videoId, title = "Video", thumbnail, className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url) => {
    if (!url) return videoId;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return videoId;
  };

  const finalVideoId = extractVideoId(videoId);
  
  // Generate YouTube thumbnail URL if not provided
  const getThumbnailUrl = useCallback(() => {
    if (thumbnail) return thumbnail;
    return `https://img.youtube.com/vi/${finalVideoId}/hqdefault.jpg`;
  }, [finalVideoId, thumbnail]);

  const loadVideo = useCallback(() => {
    setIsLoaded(true);
    
    // Performance tracking
    if (window.ATRIA_PERF) {
      window.ATRIA_PERF.mark('YouTube Video Loaded');
      console.log('📺 YouTube player carregado sob demanda');
    }
  }, []);

  if (!finalVideoId) {
    console.warn('⚠️ LazyYouTube: videoId é obrigatório');
    return null;
  }

  return (
    <div className={`lazy-youtube-container ${className}`}>
      {!isLoaded ? (
        <div 
          className="lazy-youtube-placeholder"
          onClick={loadVideo}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            backgroundImage: `url(${getThumbnailUrl()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
        >
          {/* Play button overlay */}
          <div className="play-button-overlay">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="white"
              style={{ marginLeft: '4px' }}
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          
          {/* Title overlay */}
          {title && (
            <div 
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                padding: '20px 10px 10px',
                borderRadius: '4px'
              }}
            >
              {title}
            </div>
          )}
        </div>
      ) : (
        <div className="lazy-youtube-iframe-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${finalVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '8px'
            }}
          />
        </div>
      )}
      

    </div>
  );
};

export default memo(LazyYouTube);