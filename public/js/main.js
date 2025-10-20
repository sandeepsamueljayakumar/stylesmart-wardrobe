// public/js/main.js
import { ItemsAPI } from './modules/api.js';
import { ItemsGrid } from './modules/itemsGrid.js';
import { FilterManager } from './modules/filterManager.js';
import { FormHandler } from './modules/formHandler.js';
import { WeatherService } from './modules/weatherService.js';
import { Router } from './modules/router.js';

class StyleSmartApp {
  constructor() {
    this.api = new ItemsAPI();
    this.itemsGrid = new ItemsGrid(this.api);
    this.filterManager = new FilterManager(this.itemsGrid);
    this.formHandler = new FormHandler(this.api, this.itemsGrid);
    this.weatherService = new WeatherService();
    this.router = new Router();
    
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.totalItems = 0;
  }

  async init() {
    console.log('Initializing StyleSmart Wardrobe...');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial data
    await this.loadItems();
    
    // Display weather
    this.displayWeather();
    
    // Initialize router
    this.router.init();
    
    // Update welcome message with time-based greeting
    this.updateWelcomeMessage();
  }

  setupEventListeners() {
    // Header buttons
    document.getElementById('add-item-btn').addEventListener('click', () => {
      this.formHandler.openAddModal();
    });

    document.getElementById('outfit-builder-btn').addEventListener('click', () => {
      alert('Outfit Builder coming soon!');
    });

    // Search
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    searchBtn.addEventListener('click', () => this.handleSearch());
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // Quick filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => this.handleQuickFilter(e));
    });

    // Advanced filters
    document.getElementById('apply-filters').addEventListener('click', () => {
      this.applyAdvancedFilters();
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
      this.filterManager.clearFilters();
      this.loadItems();
    });

    // Temperature range sliders
    const minTempSlider = document.getElementById('min-temp');
    const maxTempSlider = document.getElementById('max-temp');
    
    minTempSlider.addEventListener('input', (e) => {
      document.getElementById('min-temp-value').textContent = e.target.value;
    });
    
    maxTempSlider.addEventListener('input', (e) => {
      document.getElementById('max-temp-value').textContent = e.target.value;
    });

    // Sort select
    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.handleSort(e.target.value);
    });

    // Load more button
    document.getElementById('load-more-btn').addEventListener('click', () => {
      this.loadMoreItems();
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('show');
      });
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });

    // Form submission
    document.getElementById('item-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.formHandler.handleSubmit(e);
    });
  }

  async loadItems(filters = {}) {
    try {
      const params = {
        ...filters,
        limit: this.itemsPerPage,
        skip: 0
      };

      const response = await this.api.getItems(params);
      this.totalItems = response.total;
      this.currentPage = 1;
      
      this.itemsGrid.render(response.items);
      this.updateItemsCount(response.total);
      
      // Show/hide load more button
      const loadMoreBtn = document.getElementById('load-more-btn');
      if (response.total > this.itemsPerPage) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading items:', error);
      this.showNotification('Failed to load items', 'error');
    }
  }

  async loadMoreItems() {
    try {
      const filters = this.filterManager.getActiveFilters();
      const skip = this.currentPage * this.itemsPerPage;
      
      const params = {
        ...filters,
        limit: this.itemsPerPage,
        skip
      };

      const response = await this.api.getItems(params);
      this.currentPage++;
      
      this.itemsGrid.appendItems(response.items);
      
      // Hide button if no more items
      if (skip + this.itemsPerPage >= response.total) {
        document.getElementById('load-more-btn').style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading more items:', error);
      this.showNotification('Failed to load more items', 'error');
    }
  }

  async handleSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    if (!searchTerm) {
      this.loadItems();
      return;
    }

    await this.loadItems({ search: searchTerm });
  }

  handleQuickFilter(event) {
    const chip = event.target;
    const isActive = chip.classList.contains('active');
    
    // Toggle active state
    chip.classList.toggle('active');
    
    // Get filter type and value
    const weatherFilter = chip.dataset.weather;
    const occasionFilter = chip.dataset.occasion;
    
    const filters = {};
    
    if (weatherFilter) {
      switch (weatherFilter) {
        case 'sunny':
          filters.minTemp = 70;
          filters.maxTemp = 95;
          break;
        case 'rainy':
          filters.rainOk = true;
          break;
        case 'cold':
          filters.maxTemp = 45;
          break;
        case 'hot':
          filters.minTemp = 75;
          break;
      }
    }
    
    if (occasionFilter) {
      filters.occasion = occasionFilter;
    }
    
    // Apply or clear filter
    if (!isActive) {
      this.loadItems(filters);
    } else {
      this.loadItems();
    }
  }

  applyAdvancedFilters() {
    const filters = {};
    
    // Temperature range
    filters.minTemp = document.getElementById('min-temp').value;
    filters.maxTemp = document.getElementById('max-temp').value;
    
    // Weather conditions
    if (document.getElementById('rain-suitable').checked) {
      filters.rainOk = true;
    }
    if (document.getElementById('snow-suitable').checked) {
      filters.snowOk = true;
    }
    
    // Categories
    const categories = [];
    document.querySelectorAll('.filter-group input[type="checkbox"][value]:checked').forEach(cb => {
      if (['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'].includes(cb.value)) {
        categories.push(cb.value);
      }
    });
    if (categories.length > 0) {
      filters.category = categories.join(',');
    }
    
    // Color
    const color = document.getElementById('color-filter').value;
    if (color) filters.color = color;
    
    // Last worn
    const lastWorn = document.querySelector('input[name="last-worn"]:checked');
    if (lastWorn && lastWorn.value) {
      filters.lastWorn = lastWorn.value;
    }
    
    this.loadItems(filters);
  }

  handleSort(sortBy) {
    const items = this.itemsGrid.getItems();
    let sortedItems;
    
    switch (sortBy) {
      case 'newest':
        sortedItems = items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        sortedItems = items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'most-worn':
        sortedItems = items.sort((a, b) => (b.times_worn || 0) - (a.times_worn || 0));
        break;
      case 'least-worn':
        sortedItems = items.sort((a, b) => (a.times_worn || 0) - (b.times_worn || 0));
        break;
      default:
        sortedItems = items;
    }
    
    this.itemsGrid.render(sortedItems);
  }

  updateItemsCount(count) {
    document.getElementById('items-count').textContent = `(${count} items)`;
  }

  updateWelcomeMessage() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    document.getElementById('welcome-message').textContent = `${greeting}! What will you wear today?`;
  }

  displayWeather() {
    const weatherDisplay = document.getElementById('weather-display');
    const weather = this.weatherService.getCurrentWeather();
    
    weatherDisplay.innerHTML = `
      <div class="weather-card">
        <span class="weather-icon">${weather.icon}</span>
        <span class="weather-temp">${weather.temperature}°F</span>
        <span class="weather-desc">${weather.description}</span>
      </div>
    `;
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new StyleSmartApp();
  app.init();
  
  // Make app available globally for debugging
  window.styleSmartApp = app;
});