import React, { useState, useEffect, useRef } from 'react';
import { getVehicleImageUrl, generateSrcSet, logCloudinaryStatus } from '../../utils/cloudinary';

/**
 * OptimizedImage Component
 * Provides automatic image optimization using Cloudinary with fallback support
 */
const OptimizedImage = ({
  src,
  alt = '',
  context = 'listing', // 'listing', 'detail', 'hero', 'thumbnail', 'mobile'
  className = '',
  style = {},
  loading = 'lazy',
  onLoad = null,
  onError = null,
  fallbackSrc = null,
  width,
  height,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Log Cloudinary status once on mount (for debugging)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logCloudinaryStatus();
    }
  }, []);

  // Update image source when src prop changes
  useEffect(() => {
    if (src) {
      // Try to get optimized Cloudinary URL first
      const optimizedSrc = getVehicleImageUrl(src, context);
      console.log('🖼️ Image source processing:', {
        originalSrc: src,
        optimizedSrc,
        context,
        fallbackSrc
      });
      setImageSrc(optimizedSrc);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src, context]);

  const handleLoad = (e) => {
    console.log('✅ Image loaded successfully:', imageSrc);
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    console.error('🚨 Image loading error:', {
      failedSrc: imageSrc,
      originalSrc: src,
      fallbackSrc,
      error: e.message || 'Unknown error'
    });
    setIsLoading(false);
    
    // If optimized URL failed, try original URL as fallback
    if (imageSrc !== src && src) {
      console.warn('Cloudinary image failed, falling back to original:', src);
      setImageSrc(src);
      return;
    }
    
    // If original URL also failed, try provided fallback
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      console.warn('Original image failed, using fallback:', fallbackSrc);
      setImageSrc(fallbackSrc);
      return;
    }
    
    // All attempts failed
    console.error('🚨 All image URLs failed:', { src, fallbackSrc });
    setHasError(true);
    if (onError) onError(e);
  };

  // Generate responsive srcSet for better performance
  const srcSet = '';  // Temporarily disable srcSet to isolate the issue

  // Loading placeholder styles
  const loadingStyle = {
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '14px',
    ...style
  };

  // Error placeholder styles
  const errorStyle = {
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#dc2626',
    fontSize: '14px',
    border: '1px solid #fecaca',
    ...style
  };

  // Show loading placeholder
  if (isLoading && !hasError) {
    return (
      <div className={className} style={loadingStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '4px' }}>🖼️</div>
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  // Show error placeholder
  if (hasError) {
    return (
      <div className={className} style={errorStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '4px' }}>⚠️</div>
          <div>Imagem indisponível</div>
        </div>
      </div>
    );
  }

  // Render optimized image
  console.log('🖼️ Rendering image:', {
    imageSrc,
    alt,
    className,
    style: props.style
  });
  
  return (
    <img fetchpriority="low" decoding="async" ref={imgRef} src={imageSrc} srcSet={srcSet || undefined} alt={alt} className={className} style={{ ...style, opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.3s ease' }} loading={loading} width={width} height={height} onLoad={handleLoad} onError={handleError} {...props} />
  );
};

/**
 * VehicleImage - Specialized component for vehicle images
 */
export const VehicleImage = ({ vehicle, context = 'listing', ...props }) => {
  // Get the first available image from vehicle data
  const getVehicleImageSrc = () => {
    if (!vehicle) return null;
    
    const images = vehicle.photos || vehicle.imagens || vehicle.images || [];
    if (images.length > 0) return images[0];
    
    // Fallback to single image properties
    return vehicle.photo || vehicle.imagem || vehicle.image || null;
  };

  const imageSrc = getVehicleImageSrc();
  const vehicleName = vehicle ? `${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim() : '';
  
  return (
    <OptimizedImage
      src={imageSrc}
      alt={vehicleName || 'Veículo'}
      context={context}
      fallbackSrc="/images/no-car-image.jpg" // Add a default car placeholder
      {...props}
    />
  );
};

/**
 * BlogImage - Specialized component for blog post images
 */
export const BlogImage = ({ post, context = 'post', ...props }) => {
  const imageSrc = post?.coverImage || post?.image || null;
  const blogTitle = post?.title || 'Post do blog';
  
  console.log('🔍 BlogImage component rendering:', {
    post,
    imageSrc,
    blogTitle,
    context
  });
  
  return (
    <OptimizedImage
      src={imageSrc}
      alt={blogTitle}
      context={context}
      fallbackSrc="https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/WhatsApp+Image+2025-07-11+at+10.37.01-1920w.jpeg"
      {...props}
    />
  );
};

/**
 * TestimonialImage - Specialized component for testimonial images
 */
export const TestimonialImage = ({ testimonial, ...props }) => {
  const imageSrc = testimonial?.imgSrc || testimonial?.image || null;
  const personName = testimonial?.name || 'Cliente';
  
  console.log('🔍 TestimonialImage component rendering:', {
    testimonial,
    imageSrc,
    personName
  });
  
  return (
    <OptimizedImage
      src={imageSrc}
      alt={`Foto de ${personName}`}
      context="thumbnail"
      fallbackSrc="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9"
      {...props}
    />
  );
};

export default OptimizedImage;