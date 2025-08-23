/**
 * Cloudinary Upload Utilities
 * Upload de imagens externas para o Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

/**
 * Upload de imagem para Cloudinary usando upload preset não-autenticado
 * @param {string} imageUrl - URL da imagem externa
 * @param {Object} options - Opções de upload
 * @returns {Promise<string>} URL da imagem no Cloudinary
 */
export const uploadToCloudinary = async (imageUrl, options = {}) => {
  try {
    const {
      folder = 'atria-veiculos',
      publicId,
      transformation = {}
    } = options;

    // Usar upload preset não-autenticado (precisa ser configurado no Cloudinary)
    const uploadPreset = 'atria_upload'; // Você precisa criar este preset no Cloudinary

    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('upload_preset', uploadPreset);
    
    if (folder) formData.append('folder', folder);
    if (publicId) formData.append('public_id', publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Imagem enviada para Cloudinary:', result.secure_url);
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Erro no upload para Cloudinary:', error);
    return imageUrl; // Retorna URL original em caso de erro
  }
};

/**
 * Upload em lote de imagens de veículos
 */
export const uploadVehicleImages = async (vehicle) => {
  if (!vehicle.fotos || vehicle.fotos.length === 0) return vehicle;

  console.log(`📤 Fazendo upload de ${vehicle.fotos.length} imagens para o veículo ${vehicle.marca} ${vehicle.modelo}`);

  const uploadedPhotos = [];
  
  for (let i = 0; i < vehicle.fotos.length; i++) {
    const foto = vehicle.fotos[i];
    if (typeof foto === 'string' && !foto.includes('cloudinary.com')) {
      // Gerar public_id baseado no veículo
      const publicId = `veiculo-${vehicle.placa || vehicle.id || Date.now()}-foto-${i + 1}`;
      
      const cloudinaryUrl = await uploadToCloudinary(foto, {
        folder: 'atria-veiculos/veiculos',
        publicId: publicId
      });
      
      uploadedPhotos.push(cloudinaryUrl);
    } else {
      uploadedPhotos.push(foto);
    }
    
    // Pequena pausa para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return {
    ...vehicle,
    fotos: uploadedPhotos
  };
};

/**
 * Verificar se o upload preset existe
 */
export const checkUploadPreset = async () => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: new FormData() // Requisição vazia para testar
      }
    );
    
    return response.status !== 401; // Se não for 401, preset está configurado
  } catch (error) {
    return false;
  }
};

/**
 * Criar URL de transformação para imagem já no Cloudinary
 */
export const getCloudinaryTransformUrl = (cloudinaryUrl, transformations = {}) => {
  if (!cloudinaryUrl.includes('cloudinary.com')) return cloudinaryUrl;

  const {
    width,
    height,
    quality = 'auto:eco',
    format = 'auto',
    crop = 'fill'
  } = transformations;

  // Extrair o public_id da URL
  const urlParts = cloudinaryUrl.split('/');
  const uploadIndex = urlParts.findIndex(part => part === 'upload');
  
  if (uploadIndex === -1) return cloudinaryUrl;

  // Construir transformações
  const transforms = [];
  transforms.push(`f_${format}`);
  transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);

  // Inserir transformações na URL
  const beforeUpload = urlParts.slice(0, uploadIndex + 1);
  const afterUpload = urlParts.slice(uploadIndex + 1);
  
  return [
    ...beforeUpload,
    transforms.join(','),
    ...afterUpload
  ].join('/');
};