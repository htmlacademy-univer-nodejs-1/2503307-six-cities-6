/**
 * API Module for Six Cities Frontend
 * Handles communication with the REST API backend
 */

const API_BASE_URL = 'http://localhost:4000/api';
const API_ORIGIN = 'http://localhost:4000';

class SixCitiesAPI {
  constructor() {
    this.token = localStorage.getItem('authToken') || null;
    this.currentUser = null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  resolveAssetUrl(url) {
    if (!url) {
      return url;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${API_ORIGIN}${url}`;
  }

  normalizeUser(user) {
    if (!user) {
      return user;
    }

    return {
      ...user,
      avatarPath: this.resolveAssetUrl(user.avatarPath),
    };
  }

  normalizeOffer(offer) {
    if (!offer) {
      return offer;
    }

    return {
      ...offer,
      previewImage: this.resolveAssetUrl(offer.previewImage),
      images: Array.isArray(offer.images) ? offer.images.map((image) => this.resolveAssetUrl(image)) : offer.images,
      author: offer.author ? this.normalizeUser(offer.author) : offer.author,
    };
  }

  normalizeComment(comment) {
    if (!comment) {
      return comment;
    }

    return {
      ...comment,
      author: comment.author ? this.normalizeUser(comment.author) : comment.author,
    };
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
        throw new Error(error.message || error.error || `HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.normalizeUser(await this.request('/users', 'POST', userData));
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || error.error || `HTTP ${response.status}`);
    }

    const data = this.normalizeUser(await response.json());
    this.currentUser = data;
    return data;
  }

  async updateProfile(profileData) {
    const data = await this.request('/users/me', 'PATCH', profileData);
    if (data?.token) {
      this.setToken(data.token);
      this.currentUser = this.normalizeUser(data.user);
    }
    return {
      ...data,
      user: this.normalizeUser(data.user),
    };
  }

  async login(email, password) {
    const data = await this.request('/auth/login', 'POST', { email, password });
    if (data && data.token) {
      this.setToken(data.token);
      this.currentUser = this.normalizeUser(data.user);
    }
    return {
      ...data,
      user: this.normalizeUser(data.user),
    };
  }

  async logout() {
    return this.request('/auth/logout', 'POST');
  }

  async checkAuth() {
    try {
      const user = this.normalizeUser(await this.request('/users/me'));
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
    const offers = await this.request(`/offers?limit=${limit}`);
    return offers.map((offer) => this.normalizeOffer(offer));
  }

  async getOfferById(offerId) {
    return this.normalizeOffer(await this.request(`/offers/${offerId}`));
  }

  async createOffer(offerData) {
    return this.normalizeOffer(await this.request('/offers', 'POST', offerData));
  }

  async updateOffer(offerId, offerData) {
    return this.normalizeOffer(await this.request(`/offers/${offerId}`, 'PATCH', offerData));
  }

  async deleteOffer(offerId) {
    return this.request(`/offers/${offerId}`, 'DELETE');
  }

  // Premium offers
  async getPremiumOffers(city) {
    const offers = await this.request(`/offers/premium/${city}`);
    return offers.map((offer) => this.normalizeOffer(offer));
  }

  async getUsers() {
    return this.request('/users');
  }

  // Comments endpoints
  async getComments(offerId) {
    const comments = await this.request(`/offers/${offerId}/comments`);
    return comments.map((comment) => this.normalizeComment(comment));
  }

  async createComment(commentData) {
    return this.normalizeComment(await this.request('/comments', 'POST', commentData));
  }

  async getCommentById(commentId) {
    return this.normalizeComment(await this.request(`/comments/${commentId}`));
  }

  // Favorites endpoints
  async getFavorites() {
    const offers = await this.request('/favorites');
    return offers.map((offer) => this.normalizeOffer(offer));
  }

  async addToFavorites(offerId) {
    return this.request(`/favorites/${offerId}`, 'POST');
  }

  async removeFromFavorites(offerId) {
    return this.request(`/favorites/${offerId}`, 'DELETE');
  }

  async checkIsFavorite(offerId) {
    const data = await this.request(`/favorites/${offerId}/check`);
    return Boolean(data?.isFavorite);
  }
}

export const api = new SixCitiesAPI();
