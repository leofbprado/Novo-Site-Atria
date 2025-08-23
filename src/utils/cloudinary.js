/**
 * Cloudinary Image Optimization Utilities
 * Provides automatic image optimization with Brazilian market-focused configurations
 */

// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

/**
 * Build Cloudinary transformation URL
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const buildCloudinaryUrl = (publicId, options = {}) => {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary cloud name not configured');
    return publicId; // Return original URL if Cloudinary not configured
  }

  const {
    width,
    height,
    quality = 'auto:eco',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    fetchFormat = 'auto',
    dpr = 'auto',
    flags = [],
    effects = []
  } = options;

  // Build transformation string
  const transformations = [];
  
  // Quality and format optimization
  transformations.push(`f_${format}`);
  transformations.push(`q_${quality}`);
  
  // Responsive images with DPR
  if (dpr) transformations.push(`dpr_${dpr}`);
  
  // Dimensions and cropping
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  
  // Effects
  effects.forEach(effect => transformations.push(effect));
  
  // Flags
  flags.forEach(flag => transformations.push(`fl_${flag}`));

  const transformationString = transformations.join(',');
  return `${CLOUDINARY_BASE_URL}/image/upload/${transformationString}/${publicId}`;
};

/**
 * Optimize vehicle images for different contexts
 */
export const getVehicleImageUrl = (imageUrl, context = 'listing') => {
  if (!imageUrl) return imageUrl;
  
  // Check if it's an external image (not Cloudinary)
  if (
      imageUrl.includes('lirp.cdn-website.com') ||
      imageUrl.includes('freepik.com') ||
      !imageUrl.includes('cloudinary.com')) {
    // Return external images as-is, don't try to optimize them
    console.log('🌐 External image detected, using original URL:', imageUrl);
    return imageUrl;
  }
  
  // Extract public ID from various URL formats
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return imageUrl;

  const configs = {
    // Vehicle listing thumbnails
    listing: {
      width: 400,
      height: 300,
      quality: 'auto:eco',
      crop: 'fill',
      gravity: 'auto',
      effects: ['e_sharpen:50']
    },
    
    // Vehicle detail page main image
    detail: {
      width: 800,
      height: 600,
      quality: 'auto:good',
      crop: 'fill',
      gravity: 'auto',
      effects: ['e_sharpen:80', 'e_auto_contrast']
    },
    
    // Hero section backgrounds
    hero: {
      width: 1920,
      height: 1080,
      quality: 'auto:good',
      crop: 'fill',
      gravity: 'auto',
      effects: ['e_auto_contrast']
    },
    
    // Gallery thumbnails
    thumbnail: {
      width: 150,
      height: 150,
      quality: 'auto:eco',
      crop: 'thumb',
      gravity: 'auto'
    },
    
    // Mobile optimized
    mobile: {
      width: 600,
      height: 400,
      quality: 'auto:eco',
      crop: 'fill',
      gravity: 'auto',
      dpr: 'auto'
    }
  };

  return buildCloudinaryUrl(publicId, configs[context] || configs.listing);
};

/**
 * Generate responsive image srcSet for different screen sizes
 */
export const generateSrcSet = (imageUrl, sizes = [400, 800, 1200, 1600]) => {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return '';

  return sizes.map(size => {
    const url = buildCloudinaryUrl(publicId, {
      width: size,
      quality: 'auto:eco',
      crop: 'fill',
      gravity: 'auto',
      dpr: 'auto'
    });
    return `${url} ${size}w`;
  }).join(', ');
};

/**
 * Extract public ID from various image URL formats
 */
const extractPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  
  // If already a Cloudinary URL, extract public ID
  if (imageUrl.includes('cloudinary.com')) {
    const match = imageUrl.match(/\/(?:image\/upload\/)?(?:[^\/]+\/)?([^\/\?]+)/);
    return match ? match[1].split('.')[0] : null;
  }
  
  // Map known external URLs to Cloudinary public IDs
  const urlMappings = {
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9': 'atria-veiculos/testimonials/depoimento-joao-carlos',
    'https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/WhatsApp+Image+2025-07-11+at+10.37.01-1920w.jpeg': 'atria-veiculos/blog/blog-gps-perigoso'
  };
  
  if (urlMappings[imageUrl]) {
    return urlMappings[imageUrl];
  }
  
  // For external URLs, return null to use original URL
  return null;
};

/**
 * Optimize blog post images
 */
export const getBlogImageUrl = (imageUrl, context = 'post') => {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return imageUrl;

  const configs = {
    post: {
      width: 800,
      height: 450,
      quality: 'auto:good',
      crop: 'fill',
      gravity: 'auto'
    },
    thumbnail: {
      width: 300,
      height: 200,
      quality: 'auto:eco',
      crop: 'fill',
      gravity: 'auto'
    }
  };

  return buildCloudinaryUrl(publicId, configs[context]);
};

/**
 * Optimize testimonial images
 */
export const getTestimonialImageUrl = (imageUrl) => {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return imageUrl;

  return buildCloudinaryUrl(publicId, {
    width: 80,
    height: 80,
    quality: 'auto:good',
    crop: 'thumb',
    gravity: 'face',
    effects: ['e_improve', 'e_auto_contrast']
  });
};

/**
 * Check if Cloudinary is properly configured
 */
export const isCloudinaryConfigured = () => {
  return !!CLOUDINARY_CLOUD_NAME;
};

/**
 * Log Cloudinary configuration status (for debugging)
 */
export const logCloudinaryStatus = () => {
  console.log('🖼️ Cloudinary Status:', {
    configured: isCloudinaryConfigured(),
    cloudName: CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
    baseUrl: CLOUDINARY_BASE_URL
  });
};