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

  getEntityId(entity) {
    return entity?.id || entity?._id || '';
  }

  getDefaultAvatar() {
    return 'https://api.dicebear.com/9.x/initials/svg?seed=Six%20Cities&backgroundColor=3b82f6';
  }

  getUserDisplayName() {
    if (!this.currentUser) {
      return '';
    }

    return `${this.currentUser.firstname} ${this.currentUser.lastname}`.trim() || this.currentUser.email;
  }

  canDeleteOffer(offer) {
    const offerAuthorId = this.getEntityId(offer?.author || offer?.authorId);

    return Boolean(
      this.isAuthenticated &&
      this.currentUser &&
      (
        this.currentUser.userType === 'pro' ||
        offerAuthorId === this.getEntityId(this.currentUser)
      ) &&
      this.getEntityId(offer)
    );
  }

  getCityLocation(city) {
    const locations = {
      Paris: { latitude: 48.85661, longitude: 2.351499 },
      Cologne: { latitude: 50.938361, longitude: 6.959974 },
      Brussels: { latitude: 50.846557, longitude: 4.351697 },
      Amsterdam: { latitude: 52.370216, longitude: 4.895168 },
      Hamburg: { latitude: 53.550341, longitude: 10.000654 },
      Dusseldorf: { latitude: 51.225402, longitude: 6.776314 },
    };

    return locations[city] || locations.Paris;
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
          <button type="button" onclick="app.renderPage('profile')" class="avatar-button">
            <img src="${this.currentUser.avatarPath || this.getDefaultAvatar()}" alt="${this.currentUser.email}" class="user-avatar">
          </button>
          <span class="user-name">${this.getUserDisplayName()}</span>
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
      const page = window.location.hash.slice(1).split('?')[0] || 'home';
      this.renderPage(page);
    });

    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-action]') : null;

      if (!target) {
        return;
      }

      const action = target.getAttribute('data-action');

      if (action === 'delete-offer') {
        event.preventDefault();
        const offerId = target.getAttribute('data-offer-id');

        if (offerId) {
          this.deleteOffer(offerId);
        }
      }
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
        case 'profile':
          if (this.isAuthenticated) {
            this.renderProfile(content);
          } else {
            alert('Please login first');
            this.renderPage('login');
          }
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
          const offerId = new URLSearchParams(window.location.hash.split('?')[1] || '').get('id');
          if (offerId) {
            await this.renderOfferDetails(content, offerId);
          }
          break;
        default:
          await this.renderHome(content);
      }
    } catch (error) {
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

      const premiumCity = offers[0]?.city || 'Paris';
      const premiumOffers = await api.getPremiumOffers(premiumCity);

      let html = '';
      if (premiumOffers.length > 0) {
        html += `<section><h2>Premium in ${premiumCity}</h2><div class="offers-grid">`;
        for (const offer of premiumOffers) {
          const offerId = this.getEntityId(offer);
          html += `
            <div class="offer-card" data-offer-card="${offerId}">
              <img src="${offer.previewImage}" alt="${offer.title}" class="offer-image" onerror="this.onerror=null;this.src='http://localhost:4000/static/apartment-01.jpg';">
              <div class="offer-info">
                <h3>${offer.title}</h3>
                <p class="price">$${offer.price}</p>
                <p class="city">${offer.city}</p>
                <div class="offer-actions">
                  <a href="#offer?id=${offerId}" class="btn btn-info">View Details</a>
                </div>
              </div>
            </div>
          `;
        }
        html += '</div></section>';
      }

      html += '<section><h2>All Offers</h2><div class="offers-grid">';
      for (const offer of offers) {
        const offerId = this.getEntityId(offer);
        const favoriteClass = offer.isFavorite ? 'favorite' : '';
        html += `
          <div class="offer-card ${favoriteClass}" data-offer-card="${offerId}">
            <img src="${offer.previewImage}" alt="${offer.title}" class="offer-image" onerror="this.onerror=null;this.src='http://localhost:4000/static/apartment-01.jpg';">
            <div class="offer-info">
              <h3>${offer.title}</h3>
              <p class="price">$${offer.price}</p>
              <p class="city">${offer.city}</p>
              <p class="type">${offer.type}</p>
              <p class="rating">Rating: ${offer.rating}/5</p>
              <div class="offer-actions">
                <a href="#offer?id=${offerId}" class="btn btn-info">View Details</a>
                ${this.isAuthenticated ? `<button onclick="app.toggleFavorite('${offerId}')" class="btn ${favoriteClass ? 'btn-danger' : 'btn-secondary'}">
                  ${favoriteClass ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>` : ''}
                ${this.canDeleteOffer(offer) ? `<button type="button" data-action="delete-offer" data-offer-id="${offerId}" class="btn btn-danger">Delete</button>` : ''}
              </div>
            </div>
          </div>
        `;
      }
      html += '</div></section>';
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
          <div class="form-group">
            <label for="reg-avatar">Avatar (.jpg, .png):</label>
            <input type="file" id="reg-avatar" accept=".jpg,.jpeg,.png,image/jpeg,image/png">
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

  renderEditOffer(container, offer) {
    container.innerHTML = `
      <div class="offer-form">
        <h2>Edit Offer</h2>
        <form onsubmit="app.handleEditOffer(event, '${this.getEntityId(offer)}')">
          <div class="form-group">
            <label for="edit-offer-title">Title (10-100 chars):</label>
            <input type="text" id="edit-offer-title" minlength="10" maxlength="100" value="${offer.title}" required>
          </div>
          <div class="form-group">
            <label for="edit-offer-description">Description (20-1024 chars):</label>
            <textarea id="edit-offer-description" minlength="20" maxlength="1024" required>${offer.description}</textarea>
          </div>
          <div class="form-group">
            <label for="edit-offer-price">Price:</label>
            <input type="number" id="edit-offer-price" min="100" max="100000" value="${offer.price}" required>
          </div>
          <div class="form-group">
            <label for="edit-offer-premium">Premium:</label>
            <input type="checkbox" id="edit-offer-premium" ${offer.isPremium ? 'checked' : ''}>
          </div>
          <div class="form-group">
            <label for="edit-offer-preview">Preview Image URL:</label>
            <input type="url" id="edit-offer-preview" value="${offer.previewImage}" required>
          </div>
          <button type="submit" class="btn btn-primary">Save Offer</button>
        </form>
      </div>
    `;
  }

  renderProfile(container) {
    container.innerHTML = `
      <div class="auth-form">
        <h2>Profile</h2>
        <div class="profile-card">
          <img src="${this.currentUser?.avatarPath || this.getDefaultAvatar()}" alt="${this.currentUser?.email || 'User'}" class="profile-avatar-large">
          <p class="profile-email">${this.currentUser?.email || ''}</p>
        </div>
        <form onsubmit="app.handleProfileUpdate(event)">
          <div class="form-group">
            <label for="profile-firstname">First Name:</label>
            <input type="text" id="profile-firstname" maxlength="15" value="${this.currentUser?.firstname || ''}" required>
          </div>
          <div class="form-group">
            <label for="profile-lastname">Last Name:</label>
            <input type="text" id="profile-lastname" maxlength="15" value="${this.currentUser?.lastname || ''}" required>
          </div>
          <div class="form-group">
            <label for="profile-email">Email:</label>
            <input type="email" id="profile-email" value="${this.currentUser?.email || ''}" required>
          </div>
          <div class="form-group">
            <label for="profile-password">New Password (optional):</label>
            <input type="password" id="profile-password" minlength="6" maxlength="12" placeholder="Leave blank to keep current password">
          </div>
          <div class="form-group">
            <label for="profile-avatar">New Avatar (.jpg, .png):</label>
            <input type="file" id="profile-avatar" accept=".jpg,.jpeg,.png,image/jpeg,image/png">
          </div>
          <button type="submit" class="btn btn-primary">Save Profile</button>
        </form>
        <div id="profile-extra" class="form-group"></div>
      </div>
    `;
    this.renderProfileExtras();
  }

  async renderProfileExtras() {
    const extra = document.getElementById('profile-extra');
    if (!extra) {
      return;
    }

    try {
      const users = await api.getUsers();
      extra.innerHTML = `<p><strong>Community users:</strong> ${Array.isArray(users) ? users.length : 0}</p>`;
    } catch {
      extra.innerHTML = '';
    }
  }

  async renderOfferDetails(container, offerId) {
    container.innerHTML = '<div class="loading">Loading offer details...</div>';
    try {
      const offer = await api.getOfferById(offerId);
      const comments = await api.getComments(offerId);

      let html = `
        <div class="offer-details">
          <h2>${offer.title}</h2>
          <img src="${offer.previewImage}" alt="${offer.title}" class="offer-image-large" onerror="this.onerror=null;this.src='http://localhost:4000/static/apartment-01.jpg';">
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
            <button onclick="app.startEditOffer('${offerId}')" class="btn btn-secondary">Edit Offer</button>
            ${this.canDeleteOffer(offer) ? `<button type="button" data-action="delete-offer" data-offer-id="${offerId}" class="btn btn-danger">Delete Offer</button>` : ''}
          </div>
        `;
      }

      html += '<h3>Comments</h3>';
      if (comments && comments.length > 0) {
        html += '<div class="comments">';
        for (const comment of comments) {
          const commentAuthor = comment.userId?.email || comment.author?.email || 'Anonymous';
          html += `
            <div class="comment">
              <p><strong>${commentAuthor}</strong> - Rating: ${comment.rating}/5</p>
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
        const offerId = this.getEntityId(offer);
        html += `
          <div class="offer-card favorite" data-offer-card="${offerId}">
            <img src="${offer.previewImage}" alt="${offer.title}" class="offer-image" onerror="this.onerror=null;this.src='http://localhost:4000/static/apartment-01.jpg';">
            <div class="offer-info">
              <h3>${offer.title}</h3>
              <p class="price">$${offer.price}</p>
              <p class="city">${offer.city}</p>
              <div class="offer-actions">
                <a href="#offer?id=${offerId}" class="btn btn-info">View Details</a>
                <button onclick="app.toggleFavorite('${offerId}')" class="btn btn-danger">Remove</button>
                ${this.canDeleteOffer(offer) ? `<button type="button" data-action="delete-offer" data-offer-id="${offerId}" class="btn btn-danger">Delete</button>` : ''}
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
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const avatarFile = document.getElementById('reg-avatar').files[0];
    const userData = {
      email,
      firstname: document.getElementById('reg-firstname').value,
      lastname: document.getElementById('reg-lastname').value,
      password,
      userType: document.getElementById('reg-usertype').value,
    };

    try {
      await api.register(userData);
      await api.login(email, password);

      if (avatarFile) {
        await api.uploadAvatar(avatarFile);
      }

      await this.checkAuthentication();
      alert('Registration successful!');
      this.renderPage('home');
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  }

  async handleAddOffer(event) {
    event.preventDefault();
    const imageUrl = document.getElementById('offer-preview').value;
    const city = document.getElementById('offer-city').value;
    const offerData = {
      title: document.getElementById('offer-title').value,
      description: document.getElementById('offer-description').value,
      postDate: new Date().toISOString(),
      city,
      previewImage: imageUrl,
      images: [imageUrl, imageUrl, imageUrl, imageUrl, imageUrl, imageUrl], // Exactly 6 images required
      isPremium: document.getElementById('offer-premium').checked,
      isFavorite: false,
      type: document.getElementById('offer-type').value,
      rooms: parseInt(document.getElementById('offer-rooms').value),
      guests: parseInt(document.getElementById('offer-guests').value),
      price: parseInt(document.getElementById('offer-price').value),
      goods: ['Breakfast'],
      rating: parseFloat(document.getElementById('offer-rating').value),
      authorId: this.getEntityId(api.currentUser), // Get current user ID
      location: this.getCityLocation(city),
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
    const userId = this.getEntityId(this.currentUser || api.currentUser);

    if (!userId) {
      alert('Please login first');
      return;
    }

    const commentData = {
      offerId,
      userId,
      postDate: new Date().toISOString(),
      text: document.getElementById('comment-text').value,
      rating: parseInt(document.getElementById('comment-rating').value),
    };

    try {
      const createdComment = await api.createComment(commentData);
      await api.getCommentById(createdComment.id);
      alert('Comment added successfully!');
      await this.renderOfferDetails(document.getElementById('content'), offerId);
    } catch (error) {
      alert(`Failed to add comment: ${error.message}`);
    }
  }

  async handleProfileUpdate(event) {
    event.preventDefault();

    const profileData = {
      firstname: document.getElementById('profile-firstname').value.trim(),
      lastname: document.getElementById('profile-lastname').value.trim(),
      email: document.getElementById('profile-email').value.trim(),
    };
    const password = document.getElementById('profile-password').value;
    const avatarFile = document.getElementById('profile-avatar').files[0];

    if (password) {
      profileData.password = password;
    }

    try {
      const result = await api.updateProfile(profileData);
      this.currentUser = result.user;

      if (avatarFile) {
        this.currentUser = await api.uploadAvatar(avatarFile);
      }

      await this.checkAuthentication();
      alert('Profile updated successfully!');
      this.renderPage('profile');
    } catch (error) {
      alert(`Failed to update profile: ${error.message}`);
    }
  }

  async toggleFavorite(offerId) {
    if (!offerId || offerId === 'undefined') {
      alert('Offer id is missing');
      return;
    }

    if (!this.isAuthenticated || !api.token) {
      alert('Please login first');
      this.renderPage('login');
      return;
    }

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

  async deleteOffer(offerId) {
    if (!offerId) {
      return;
    }

    try {
      await api.deleteOffer(offerId);
      document.querySelectorAll(`[data-offer-card="${offerId}"]`).forEach((card) => card.remove());
      alert('Offer deleted successfully');
      window.location.hash = '#home';
      await this.renderPage('home');
    } catch (error) {
      alert(`Failed to delete offer: ${error.message}`);
    }
  }

  async startEditOffer(offerId) {
    try {
      const offer = await api.getOfferById(offerId);
      this.renderEditOffer(document.getElementById('content'), offer);
    } catch (error) {
      alert(`Failed to load offer for edit: ${error.message}`);
    }
  }

  async handleEditOffer(event, offerId) {
    event.preventDefault();

    const previewImage = document.getElementById('edit-offer-preview').value;
    const offerData = {
      title: document.getElementById('edit-offer-title').value,
      description: document.getElementById('edit-offer-description').value,
      price: parseInt(document.getElementById('edit-offer-price').value, 10),
      previewImage,
      images: [previewImage, previewImage, previewImage, previewImage, previewImage, previewImage],
      isPremium: document.getElementById('edit-offer-premium').checked,
    };

    try {
      await api.updateOffer(offerId, offerData);
      alert('Offer updated successfully!');
      window.location.hash = `#offer?id=${offerId}`;
      await this.renderOfferDetails(document.getElementById('content'), offerId);
    } catch (error) {
      alert(`Failed to update offer: ${error.message}`);
    }
  }

  async logout() {
    try {
      await api.logout();
    } catch (error) {
    } finally {
      this.isAuthenticated = false;
      this.currentUser = null;
      api.currentUser = null;
      api.token = null;
      localStorage.removeItem('authToken');
      document.body.classList.remove('authenticated');
      this.updateNavigation();
      window.location.hash = '#home';
      this.renderPage('home');
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SixCitiesApp();
});
