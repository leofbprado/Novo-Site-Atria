/**
 * Analytics System - GTM + GA4 + Meta Pixel Integration
 * Utiliza dataLayer.push() para enviar eventos para GTM
 */

// Initialize dataLayer if not exists
if (typeof window !== 'undefined' && !window.dataLayer) {
  window.dataLayer = [];
}

/**
 * Push event to dataLayer (GTM)
 */
const pushToDataLayer = (event, data = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event,
      ...data
    });
    console.log(`🔍 Analytics Event: ${event}`, data);
  }
};

/**
 * Enhanced ecommerce tracking helper
 */
const formatVehicleItem = (vehicle) => ({
  item_id: vehicle.vehicle_uuid || vehicle.id,
  item_name: `${vehicle.marca} ${vehicle.modelo}`,
  item_category: vehicle.categoria || 'Veículo',
  item_brand: vehicle.marca,
  price: vehicle.preco || 0,
  currency: 'BRL'
});

/**
 * Analytics Events Implementation
 */
export const analytics = {
  
  /**
   * Search Submit Event
   * Dispara quando usuário executa uma busca
   */
  searchSubmit: (searchQuery, resultsCount) => {
    pushToDataLayer('search_submit', {
      search_term: searchQuery.trim(),
      results_count: resultsCount || 0,
      search_timestamp: Date.now()
    });
  },

  /**
   * View Item List Event
   * Dispara quando lista de veículos é carregada
   */
  viewItemList: (listName, vehicles, resultsCount) => {
    const items = vehicles.slice(0, 10).map(formatVehicleItem); // Primeiros 10 para performance
    
    pushToDataLayer('view_item_list', {
      item_list_name: listName,
      items,
      list_results_count: resultsCount,
      view_timestamp: Date.now()
    });
  },

  /**
   * Select Item Event
   * Dispara quando usuário clica em um veículo da lista
   */
  selectItem: (vehicle, listPosition, listName) => {
    pushToDataLayer('select_item', {
      item_list_name: listName || 'Estoque',
      items: [formatVehicleItem(vehicle)],
      item_list_position: listPosition,
      click_timestamp: Date.now()
    });
  },

  /**
   * View Item Event
   * Dispara quando usuário visualiza página individual do veículo
   */
  viewItem: (vehicle, source) => {
    pushToDataLayer('view_item', {
      currency: 'BRL',
      value: vehicle.preco || 0,
      items: [formatVehicleItem(vehicle)],
      page_referrer: source || document.referrer,
      view_timestamp: Date.now()
    });
  },

  /**
   * Add to Wishlist Event  
   * Dispara quando veículo é adicionado aos favoritos
   */
  addToWishlist: (vehicle) => {
    pushToDataLayer('add_to_wishlist', {
      currency: 'BRL',
      value: vehicle.preco || 0,
      items: [formatVehicleItem(vehicle)],
      wishlist_timestamp: Date.now()
    });
  },

  /**
   * Generate Lead Event
   * Dispara quando formulário de lead é enviado
   */
  generateLead: (formType, vehicleId, leadData) => {
    pushToDataLayer('generate_lead', {
      form_type: formType,
      vehicle_id: vehicleId,
      lead_source: window.location.pathname,
      lead_timestamp: Date.now(),
      ...leadData
    });
  },

  /**
   * Click WhatsApp Event
   * Dispara quando usuário clica no botão WhatsApp
   */
  clickWhatsApp: (vehicleId, source, vehicleData) => {
    pushToDataLayer('click_whatsapp', {
      vehicle_id: vehicleId,
      click_source: source || 'unknown',
      vehicle_brand: vehicleData?.marca,
      vehicle_model: vehicleData?.modelo,
      vehicle_price: vehicleData?.preco,
      click_timestamp: Date.now()
    });
  },

  /**
   * Click Phone Event
   * Dispara quando usuário clica para ligar
   */
  clickPhone: (phoneNumber, source, vehicleId) => {
    pushToDataLayer('click_phone', {
      phone_number: phoneNumber,
      click_source: source || 'unknown',
      vehicle_id: vehicleId,
      click_timestamp: Date.now()
    });
  },

  /**
   * Page View Event
   * Para tracking de página via GTM
   */
  pageView: (pageTitle, pagePath) => {
    pushToDataLayer('page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
      page_timestamp: Date.now()
    });
  },

  /**
   * Custom Event Helper
   * Para eventos customizados
   */
  customEvent: (eventName, parameters = {}) => {
    pushToDataLayer(eventName, {
      ...parameters,
      event_timestamp: Date.now()
    });
  },

  /**
   * Enhanced Ecommerce - Begin Checkout
   * Para simulador de financiamento
   */
  beginCheckout: (vehicle, financingType) => {
    pushToDataLayer('begin_checkout', {
      currency: 'BRL',
      value: vehicle.preco || 0,
      items: [formatVehicleItem(vehicle)],
      checkout_step: 'financing_calculator',
      financing_type: financingType,
      checkout_timestamp: Date.now()
    });
  }
};

/**
 * Initialize Analytics
 * Call this once when app loads
 */
export const initAnalytics = () => {
  // GTM will be loaded via HTML snippets
  console.log('🚀 Analytics system initialized');
  
  // Track initial page view
  analytics.pageView(document.title, window.location.pathname);
};

/**
 * Direct dataLayer access for advanced usage
 */
export const dataLayer = {
  push: pushToDataLayer,
  get: () => typeof window !== 'undefined' ? window.dataLayer : []
};

export default analytics;