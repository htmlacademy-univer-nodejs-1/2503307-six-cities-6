/**
 * API Module for Six Cities Frontend
 * Handles communication with the REST API backend
 */

const API_BASE_URL = 'http://localhost:4000/api';

class SixCitiesAPI {
  constructor() {
    this.token = localStorage.getItem('authToken') || null;
    this.currentUser = null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: this.getAuthHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/users', 'POST', userData);
  }

  async login(email, password) {
    const data = await this.request('/auth/login', 'POST', { email, password });
    if (data && data.token) {
      this.setToken(data.token);
      this.currentUser = data.user;
    }
    return data;
  }

  async logout() {
    return this.request('/auth/logout', 'POST');
  }

  async checkAuth() {
    try {
      const user = await this.request('/users/me');
      this.currentUser = user;
      return user;
    } catch (error) {
      this.token = null;
      localStorage.removeItem('authToken');
      return null;
    }
  }

  // Offers endpoints
  async getOffers(limit = 60) {
    return this.request(`/offers?limit=${limit}`);
  }

  async getOfferById(offerId) {
    return this.request(`/offers/${offerId}`);
  }

  async createOffer(offerData) {
    return this.request('/offers', 'POST', offerData);
  }

  async updateOffer(offerId, offerData) {
    return this.request(`/offers/${offerId}`, 'PATCH', offerData);
  }

  async deleteOffer(offerId) {
    return this.request(`/offers/${offerId}`, 'DELETE');
  }

  // Premium offers
  async getPremiumOffers(city) {
    return this.request(`/offers/premium/${city}`);
  }

  // Comments endpoints
  async getComments(offerId) {
    return this.request(`/offers/${offerId}/comments`);
  }

  async createComment(commentData) {
    return this.request('/comments', 'POST', commentData);
  }

  // Favorites endpoints
  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(offerId) {
    return this.request(`/favorites/${offerId}`, 'POST');
  }

  async removeFromFavorites(offerId) {
    return this.request(`/favorites/${offerId}`, 'DELETE');
  }

  async checkIsFavorite(offerId) {
    return this.request(`/favorites/${offerId}/check`);
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }
}

export const api = new SixCitiesAPI();
