// Cliente API Seguro - Frontend
// Todas as operações sensíveis são feitas via backend

class SecureAPIClient {
  constructor() {
    this.baseURL = 'https://www.carregado.store/api';
    this.token = localStorage.getItem('auth_token');
  }

  // ========================================
  // CONFIGURAÇÃO DE REQUISIÇÕES
  // ========================================
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Adicionar token de autenticação se disponível
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      throw error;
    }
  }

  // ========================================
  // AUTENTICAÇÃO
  // ========================================
  
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async register(name, email, password, phone = null) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('⚠️ Erro no logout:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  async verifyToken() {
    if (!this.token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await this.request('/auth/verify');
      return response;
    } catch (error) {
      this.logout();
      return { success: false, error: 'Token inválido' };
    }
  }

  // ========================================
  // PRODUTOS
  // ========================================
  
  async getProducts() {
    return await this.request('/api/products');
  }

  async getProduct(productId) {
    return await this.request(`/products/${productId}`);
  }

  async getModels() {
    return await this.request('/products/models/list');
  }

  async hasUserPurchasedProduct(productId) {
    return await this.request(`/products/${productId}/purchased`);
  }

  async getProductDownload(productId) {
    return await this.request(`/products/${productId}/download`);
  }

  // ========================================
  // PAGAMENTOS
  // ========================================
  
  async getUserPurchases() {
    return await this.request('/payment/purchases');
  }

  // ========================================
  // USUÁRIO
  // ========================================
  
  async getUserProfile() {
    return await this.request('/user/profile');
  }

  async updateUserProfile(updates) {
    return await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getUserStats() {
    return await this.request('/user/stats');
  }

  async getPurchaseStatus(purchaseId) {
    return await this.request(`/user/purchases/${purchaseId}/status`);
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================
  
  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

// Instância global
const apiClient = new SecureAPIClient();

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.apiClient = apiClient;
  window.SecureAPIClient = SecureAPIClient;
}

// Exportar para global (já feito acima)
