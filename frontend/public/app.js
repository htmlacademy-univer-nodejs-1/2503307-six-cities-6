/**
 * Main application file for Six Cities Frontend
 */

import { api } from './api.js';

class SixCitiesApp {
  constructor() {
    this.currentPage = 'home';
    this.isAuthenticated = false;
    this.currentUser = null;
    this.init();
  }

  async init() {
    this.renderNavigation();
    await this.checkAuthentication();
    this.setupEventListeners();
    this.renderPage('home');
  }

  async checkAuthentication() {
    try {
      const user = await api.checkAuth();
      if (user) {
        this.isAuthenticated = true;
        this.currentUser = user;
        document.body.classList.add('authenticated');
      } else {
        this.isAuthenticated = false;
        document.body.classList.remove('authenticated');
      }
    } catch (error) {
      this.isAuthenticated = false;
      document.body.classList.remove('authenticated');
    }
    this.updateNavigation();
  }

  renderNavigation() {
    const nav = document.getElementById('navigation');
    nav.innerHTML = `
      <nav class="navbar">
        <div class="navbar-brand">
          <a href="#" onclick="app.renderPage('home')">Six Cities</a>
        </div>
        <div class="navbar-menu">
          <div id="auth-menu" class="navbar-item">
            <!-- Will be updated by updateNavigation() -->
          </div>
        </div>
      </nav>
    `;
  }

  updateNavigation() {
    const authMenu = document.getElementById('auth-menu');
    if (this.isAuthenticated && this.currentUser) {
      authMenu.innerHTML = `
        <div class="user-menu">
          <span class="user-name">${this.currentUser.email}</span>
          <button onclick="app.renderPage('add-offer')" class="btn btn-primary">Add Offer</button>
          <button onclick="app.renderPage('favorites')" class="btn btn-secondary">Favorites</button>
          <button onclick="app.logout()" class="btn btn-danger">Logout</button>
        </div>
      `;
    } else {
      authMenu.innerHTML = `
        <div class="auth-links">
          <button onclick="app.renderPage('login')" class="btn btn-primary">Login</button>
          <button onclick="app.renderPage('register')" class="btn btn-secondary">Register</button>
        </div>
      `;
    }
  }

  setupEventListeners() {
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.slice(1) || 'home';
      this.renderPage(page);
    });
  }

  async renderPage(page) {
    const content = document.getElementById('content');
    this.currentPage = page;

    try {
      switch (page) {
        case 'home':
          await this.renderHome(content);
          break;
        case 'login':
          this.renderLogin(content);
          break;
        case 'register':
          this.renderRegister(content);
          break;
        case 'add-offer':
          if (this.isAuthenticated) {
            this.renderAddOffer(content);
          } else {
            alert('Please login first');
            this.renderPage('login');
          }
          break;
        case 'favorites':
          if (this.isAuthenticated) {
            await this.renderFavorites(content);
          } else {
            alert('Please login first');
            this.renderPage('login');
          }
          break;
        case 'offer':
          const offerId = new URLSearchParams(window.location.search).get('id');
          if (offerId) {
            await this.renderOfferDetails(content, offerId);
          }
          break;
        default:
          await this.renderHome(content);
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      content.innerHTML = `<div class="error">Error loading page: ${error.message}</div>`;
    }
  }

  async renderHome(container) {
    container.innerHTML = '<div class="loading">Loading offers...</div>';
    try {
      const offers = await api.getOffers();
      
      if (!offers || offers.length === 0) {
        container.innerHTML = '<div class="no-offers">No offers available</div>';
        return;
      }

      let html = '<div class="offers-grid">';
      for (const offer of offers) {
        const favoriteClass = offer.isFavorite ? 'favorite' : '';
        html += `
          <div class="offer-card ${favoriteClass}">
            <img src="${offer.previewImage}" alt="${offer.title}" class="offer-image">
            <div class="offer-info">
              <h3>${offer.title}</h3>
              <p class="price">$${offer.price}</p>
              <p class="city">${offer.city}</p>
              <p class="type">${offer.type}</p>
              <p class="rating">Rating: ${offer.rating}/5</p>
              <div class="offer-actions">
                <a href="#offer?id=${offer.id}" class="btn btn-info">View Details</a>
                ${this.isAuthenticated ? `<button onclick="app.toggleFavorite('${offer.id}')" class="btn ${favoriteClass ? 'btn-danger' : 'btn-secondary'}">
                  ${favoriteClass ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>` : ''}
              </div>
            </div>
          </div>
        `;
      }
      html += '</div>';
      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = `<div class="error">Error loading offers: ${error.message}</div>`;
    }
  }

  renderLogin(container) {
    container.innerHTML = `
      <div class="auth-form">
        <h2>Login</h2>
        <form onsubmit="app.handleLogin(event)">
          <div class="form-group">
            <label for="login-email">Email:</label>
            <input type="email" id="login-email" required>
          </div>
          <div class="form-group">
            <label for="login-password">Password:</label>
            <input type="password" id="login-password" required>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
    `;
  }

  renderRegister(container) {
    container.innerHTML = `
      <div class="auth-form">
        <h2>Register</h2>
        <form onsubmit="app.handleRegister(event)">
          <div class="form-group">
            <label for="reg-firstname">First Name:</label>
            <input type="text" id="reg-firstname" maxlength="15" required>
          </div>
          <div class="form-group">
            <label for="reg-lastname">Last Name:</label>
            <input type="text" id="reg-lastname" maxlength="15" required>
          </div>
          <div class="form-group">
            <label for="reg-email">Email:</label>
            <input type="email" id="reg-email" required>
          </div>
          <div class="form-group">
            <label for="reg-password">Password (6-12 chars):</label>
            <input type="password" id="reg-password" minlength="6" maxlength="12" required>
          </div>
          <div class="form-group">
            <label for="reg-usertype">User Type:</label>
            <select id="reg-usertype">
              <option value="ordinary">Ordinary</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
        </form>
      </div>
    `;
  }

  renderAddOffer(container) {
    container.innerHTML = `
      <div class="offer-form">
        <h2>Add New Offer</h2>
        <form onsubmit="app.handleAddOffer(event)">
          <div class="form-group">
            <label for="offer-title">Title (10-100 chars):</label>
            <input type="text" id="offer-title" minlength="10" maxlength="100" required>
          </div>
          <div class="form-group">
            <label for="offer-description">Description (20-1024 chars):</label>
            <textarea id="offer-description" minlength="20" maxlength="1024" required></textarea>
          </div>
          <div class="form-group">
            <label for="offer-city">City:</label>
            <select id="offer-city" required>
              <option value="Paris">Paris</option>
              <option value="Cologne">Cologne</option>
              <option value="Brussels">Brussels</option>
              <option value="Amsterdam">Amsterdam</option>
              <option value="Hamburg">Hamburg</option>
              <option value="Dusseldorf">Dusseldorf</option>
            </select>
          </div>
          <div class="form-group">
            <label for="offer-price">Price (100-100000):</label>
            <input type="number" id="offer-price" min="100" max="100000" required>
          </div>
          <div class="form-group">
            <label for="offer-type">Type:</label>
            <select id="offer-type" required>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="room">Room</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>
          <div class="form-group">
            <label for="offer-rooms">Rooms (1-8):</label>
            <input type="number" id="offer-rooms" min="1" max="8" required>
          </div>
          <div class="form-group">
            <label for="offer-guests">Max Guests (1-10):</label>
            <input type="number" id="offer-guests" min="1" max="10" required>
          </div>
          <div class="form-group">
            <label for="offer-premium">Premium:</label>
            <input type="checkbox" id="offer-premium">
          </div>
          <div class="form-group">
            <label for="offer-rating">Rating (1-5):</label>
            <input type="number" id="offer-rating" min="1" max="5" step="0.1" required>
          </div>
          <div class="form-group">
            <label for="offer-preview">Preview Image URL:</label>
            <input type="url" id="offer-preview" required>
          </div>
          <button type="submit" class="btn btn-primary">Create Offer</button>
        </form>
      </div>
    `;
  }

  async renderOfferDetails(container, offerId) {
    container.innerHTML = '<div class="loading">Loading offer details...</div>';
    try {
      const offer = await api.getOfferById(offerId);
      const comments = await api.getComments(offerId);

      let html = `
        <div class="offer-details">
          <h2>${offer.title}</h2>
          <img src="${offer.previewImage}" alt="${offer.title}" class="offer-image-large">
          <div class="offer-info">
            <p><strong>Price:</strong> $${offer.price}</p>
            <p><strong>City:</strong> ${offer.city}</p>
            <p><strong>Type:</strong> ${offer.type}</p>
            <p><strong>Rooms:</strong> ${offer.rooms}</p>
            <p><strong>Max Guests:</strong> ${offer.guests}</p>
            <p><strong>Rating:</strong> ${offer.rating}/5</p>
            <p><strong>Premium:</strong> ${offer.isPremium ? 'Yes' : 'No'}</p>
            <p><strong>Description:</strong></p>
            <p>${offer.description}</p>
          </div>
      `;

      if (this.isAuthenticated) {
        html += `
          <div class="actions">
            <button onclick="app.toggleFavorite('${offerId}')" class="btn ${offer.isFavorite ? 'btn-danger' : 'btn-secondary'}">
              ${offer.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        `;
      }

      html += '<h3>Comments</h3>';
      if (comments && comments.length > 0) {
        html += '<div class="comments">';
        for (const comment of comments) {
          html += `
            <div class="comment">
              <p><strong>${comment.author?.email || 'Anonymous'}</strong> - Rating: ${comment.rating}/5</p>
              <p>${comment.text}</p>
            </div>
          `;
        }
        html += '</div>';
      } else {
        html += '<p>No comments yet</p>';
      }

      if (this.isAuthenticated) {
        html += `
          <div class="add-comment">
            <h4>Add Comment</h4>
            <form onsubmit="app.handleAddComment(event, '${offerId}')">
              <div class="form-group">
                <label for="comment-text">Comment (5-1024 chars):</label>
                <textarea id="comment-text" minlength="5" maxlength="1024" required></textarea>
              </div>
              <div class="form-group">
                <label for="comment-rating">Rating (1-5):</label>
                <input type="number" id="comment-rating" min="1" max="5" required>
              </div>
              <button type="submit" class="btn btn-primary">Post Comment</button>
            </form>
          </div>
        `;
      }

      html += '</div>';
      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = `<div class="error">Error loading offer: ${error.message}</div>`;
    }
  }

  async renderFavorites(container) {
    container.innerHTML = '<div class="loading">Loading favorites...</div>';
    try {
      const favorites = await api.getFavorites();
      
      if (!favorites || favorites.length === 0) {
        container.innerHTML = '<div class="no-offers">No favorites yet</div>';
        return;
      }

      let html = '<div class="offers-grid"><h2>My Favorites</h2>';
      for (const offer of favorites) {
        html += `
          <div class="offer-card favorite">
            <img src="${offer.previewImage}" alt="${offer.title}" class="offer-image">
            <div class="offer-info">
              <h3>${offer.title}</h3>
              <p class="price">$${offer.price}</p>
              <p class="city">${offer.city}</p>
              <div class="offer-actions">
                <a href="#offer?id=${offer.id}" class="btn btn-info">View Details</a>
                <button onclick="app.toggleFavorite('${offer.id}')" class="btn btn-danger">Remove</button>
              </div>
            </div>
          </div>
        `;
      }
      html += '</div>';
      container.innerHTML = html;
    } catch (error) {
      container.innerHTML = `<div class="error">Error loading favorites: ${error.message}</div>`;
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await api.login(email, password);
      await this.checkAuthentication();
      alert('Login successful!');
      this.renderPage('home');
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const userData = {
      email: document.getElementById('reg-email').value,
      firstname: document.getElementById('reg-firstname').value,
      lastname: document.getElementById('reg-lastname').value,
      password: document.getElementById('reg-password').value,
      userType: document.getElementById('reg-usertype').value,
    };

    try {
      await api.register(userData);
      alert('Registration successful! Please login.');
      this.renderPage('login');
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  }

  async handleAddOffer(event) {
    event.preventDefault();
    const offerData = {
      title: document.getElementById('offer-title').value,
      description: document.getElementById('offer-description').value,
      postDate: new Date(),
      city: document.getElementById('offer-city').value,
      previewImage: document.getElementById('offer-preview').value,
      images: [document.getElementById('offer-preview').value], // Placeholder
      isPremium: document.getElementById('offer-premium').checked,
      isFavorite: false,
      type: document.getElementById('offer-type').value,
      rooms: parseInt(document.getElementById('offer-rooms').value),
      guests: parseInt(document.getElementById('offer-guests').value),
      price: parseInt(document.getElementById('offer-price').value),
      goods: [], // Correct field name for backend
      rating: parseFloat(document.getElementById('offer-rating').value),
      categories: [],
      authorId: api.currentUser?.id || '', // Get current user ID
      location: { latitude: 0, longitude: 0 }, // Default location
    };

    try {
      await api.createOffer(offerData);
      alert('Offer created successfully!');
      this.renderPage('home');
    } catch (error) {
      alert(`Failed to create offer: ${error.message}`);
    }
  }

  async handleAddComment(event, offerId) {
    event.preventDefault();
    const commentData = {
      offerId,
      text: document.getElementById('comment-text').value,
      rating: parseInt(document.getElementById('comment-rating').value),
    };

    try {
      await api.createComment(commentData);
      alert('Comment added successfully!');
      await this.renderOfferDetails(document.getElementById('content'), offerId);
    } catch (error) {
      alert(`Failed to add comment: ${error.message}`);
    }
  }

  async toggleFavorite(offerId) {
    try {
      const isFavorite = await api.checkIsFavorite(offerId);
      if (isFavorite) {
        await api.removeFromFavorites(offerId);
        alert('Removed from favorites');
      } else {
        await api.addToFavorites(offerId);
        alert('Added to favorites');
      }
      this.renderPage(this.currentPage);
    } catch (error) {
      alert(`Error updating favorites: ${error.message}`);
    }
  }

  async logout() {
    try {
      await api.logout();
      this.isAuthenticated = false;
      this.currentUser = null;
      api.token = null;
      localStorage.removeItem('authToken');
      alert('Logged out successfully');
      this.renderPage('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SixCitiesApp();
});
