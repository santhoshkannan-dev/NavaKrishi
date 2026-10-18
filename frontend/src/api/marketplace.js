/**
 * Marketplace API Service
 * Handles all API calls for marketplace functionality
 */

import API from './axios';

const authConfig = () => {
  const stored = (localStorage.getItem('token') || '').trim().replace(/^"|"$/g, '').replace(/^Bearer\s+/i, '');
  const defaultHeader = String(API.defaults?.headers?.common?.Authorization || '').trim();
  const fromDefault = defaultHeader.replace(/^Bearer\s+/i, '');
  const token = stored || fromDefault;

  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// ============= CATEGORIES =============

export const categoriesAPI = {
  // Get all categories
  getAllCategories: async () => {
    const response = await API.get('/categories/');
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await API.get(`/categories/${id}/`);
    return response.data;
  },
};

// ============= PRODUCTS =============

export const productsAPI = {
  // Get all products with optional filters
  getAllProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.search) params.append('search', filters.search);
    if (filters.farmer) params.append('farmer', filters.farmer);

    const queryString = params.toString();
    const url = queryString ? `/products/?${queryString}` : '/products/';
    const response = await API.get(url);
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await API.get(`/products/${id}/`);
    return response.data;
  },

  // Get farmer's products (requires auth)
  getMyProducts: async () => {
    const response = await API.get('/products/my_products/', authConfig());
    return response.data;
  },

  // Create product (farmer only, requires auth)
  createProduct: async (productData) => {
    const response = await API.post('/products/', productData, authConfig());
    return response.data;
  },

  // Update product (farmer only, requires auth)
  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}/`, productData, authConfig());
    return response.data;
  },

  // Partial update product (farmer only, requires auth)
  partialUpdateProduct: async (id, productData) => {
    const response = await API.patch(`/products/${id}/`, productData, authConfig());
    return response.data;
  },

  // Delete product (farmer only, requires auth)
  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}/`, authConfig());
    return response.data;
  },

  // Add product to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await API.post(`/products/${productId}/add_to_cart/`, {
      quantity,
    });
    return response.data;
  },

  // Add/update product review
  addReview: async (productId, payload) => {
    const response = await API.post(`/products/${productId}/add_review/`, payload);
    return response.data;
  },
  // Delete current user's review for a product
  deleteReview: async (productId) => {
    const response = await API.delete(`/products/${productId}/delete_review/`);
    return response.data;
  },
};

// ============= CART =============

export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    const response = await API.get('/cart/my-cart/');
    return response.data;
  },

  // Add item to cart
  addItem: async (productId, quantity = 1) => {
    const response = await API.post('/cart/add-item/', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  // Update item quantity in cart
  updateItem: async (cartItemId, quantity) => {
    const response = await API.post('/cart/update-item/', {
      cart_item_id: cartItemId,
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  removeItem: async (cartItemId) => {
    const response = await API.post('/cart/remove-item/', {
      cart_item_id: cartItemId,
    });
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await API.post('/cart/clear/');
    return response.data;
  },
};

// ============= ORDERS =============

export const ordersAPI = {
  getMyOrders: async () => {
    const response = await API.get('/orders/', authConfig());
    return response.data;
  },

  getFarmerOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.page_size) params.append('page_size', String(filters.page_size));

    const queryString = params.toString();
    const url = queryString ? `/orders/farmer-orders/?${queryString}` : '/orders/farmer-orders/';
    const response = await API.get(url, authConfig());
    return response.data;
  },
  getFarmerRoutes: async () => {
    const response = await API.get('/orders/farmer-routes/', authConfig());
    return response.data;
  },
  getFarmerAnalytics: async () => {
    const response = await API.get('/orders/farmer-analytics/', authConfig());
    return response.data;
  },
  markOrderShipped: async (orderId) => {
    const response = await API.post(`/orders/${orderId}/mark-shipped/`, {}, authConfig());
    return response.data;
  },
  bulkMarkShipped: async (orderIds = []) => {
    const response = await API.post('/orders/bulk-mark-shipped/', { order_ids: orderIds }, authConfig());
    return response.data;
  },
  exportFarmerOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.search) params.append('search', filters.search);
    if (filters.order_ids && Array.isArray(filters.order_ids) && filters.order_ids.length) {
      params.append('order_ids', filters.order_ids.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `/orders/farmer-orders/export/?${queryString}` : '/orders/farmer-orders/export/';
    const response = await API.get(url, { ...authConfig(), responseType: 'blob' });
    return response.data;
  },
};

// ============= PROMOCODES =============

export const promocodeAPI = {
  apply: async (code) => {
    const response = await API.post('/promocodes/apply/', { code });
    return response.data;
  },
};

// ============= SUPPORT =============

export const supportAPI = {
  getArticles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (typeof filters.featured !== 'undefined') params.append('featured', String(filters.featured));

    const queryString = params.toString();
    const url = queryString ? `/support-articles/?${queryString}` : '/support-articles/';
    const response = await API.get(url);
    return response.data;
  },
};

export default {
  categories: categoriesAPI,
  products: productsAPI,
  cart: cartAPI,
  orders: ordersAPI,
  promocode: promocodeAPI,
  support: supportAPI,
};
