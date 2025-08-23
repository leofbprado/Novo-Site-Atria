/**
 * Vehicle Path Utilities
 * Gera URLs canônicas para veículos usando apenas shortId
 */

// Função para normalizar texto (remover acentos e caracteres especiais)
function normalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Gera URL canônica para veículo usando apenas shortId
 * Formato: /carros/{marca}/{modelo}/{ano}-{shortId}
 */
export function buildVehicleCanonicalPath(vehicle) {
  if (!vehicle) return null;
  
  const marca = normalize(vehicle.marca);
  const modelo = normalize(vehicle.modelo);
  const ano = vehicle.ano_modelo || vehicle.ano_fabricacao || '';
  const id = vehicle.shortId || vehicle.codigo; // apenas shortId
  
  if (!marca || !modelo || !ano || !id) {
    console.warn('Dados insuficientes para gerar URL:', { marca, modelo, ano, id });
    return null;
  }
  
  return `/carros/${marca}/${modelo}/${ano}-${id}`;
}

/**
 * Extrai informações da URL do veículo
 * Retorna: { marca, modelo, ano, idRaw }
 */
export function parseVehicleUrl(params) {
  const { marca, modelo, slug } = params;
  
  if (!slug) return null;
  
  // Separar ano + id do slug (formato: ano-id)
  const slugParts = slug.split('-');
  if (slugParts.length < 2) return null;
  
  const ano = slugParts[0];
  const idRaw = slugParts.slice(1).join('-'); // Reagrupar caso o ID tenha hífen
  
  return {
    marca: marca,
    modelo: modelo,
    ano: ano,
    idRaw: idRaw
  };
}

/**
 * Verifica se um ID é um UUID legado (36 caracteres com hífens)
 */
export function isLegacyUUID(id) {
  if (!id || typeof id !== 'string') return false;
  
  // UUID format: 8-4-4-4-12 = 36 characters total
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Verifica se um ID é um shortId válido (5 caracteres alfanuméricos)
 */
export function isValidShortId(id) {
  if (!id || typeof id !== 'string') return false;
  
  // ShortId: 5 caracteres alfanuméricos
  return /^[A-Z0-9]{5}$/i.test(id) && id.length === 5;
}