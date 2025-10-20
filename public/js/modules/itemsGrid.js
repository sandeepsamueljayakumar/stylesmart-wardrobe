// public/js/modules/itemsGrid.js
export class ItemsGrid {
  constructor(api) {
    this.api = api;
    this.container = document.getElementById('items-grid');
    this.items = [];
    this.setupEventDelegation();
  }

  setupEventDelegation() {
    // Use event delegation for dynamically added items
    this.container.addEventListener('click', (e) => {
      const itemCard = e.target.closest('.item-card');
      if (!itemCard) return;

      const itemId = itemCard.dataset.itemId;
      
      if (e.target.closest('.item-delete')) {
        e.stopPropagation();
        this.handleDelete(itemId);
      } else if (e.target.closest('.item-edit')) {
        e.stopPropagation();
        this.handleEdit(itemId);
      } else if (e.target.closest('.item-worn')) {
        e.stopPropagation();
        this.handleMarkWorn(itemId);
      } else {
        this.showItemDetail(itemId);
      }
    });
  }

  render(items) {
    this.items = items;
    this.container.innerHTML = items.map(item => this.createItemCard(item)).join('');
    this.addAnimations();
  }

  appendItems(items) {
    this.items = [...this.items, ...items];
    const newCards = items.map(item => this.createItemCard(item)).join('');
    this.container.insertAdjacentHTML('beforeend', newCards);
    this.addAnimations();
  }

  createItemCard(item) {
    const lastWornText = item.last_worn 
      ? `Worn ${this.formatDate(item.last_worn)}` 
      : 'Never worn';
    
    const weatherIcons = this.getWeatherIcons(item.weather_suitable);
    const occasionTags = item.occasions.map(occ => 
      `<span class="occasion-tag">${this.formatOccasion(occ)}</span>`
    ).join('');

    return `
      <div class="item-card" data-item-id="${item._id}">
        <div class="item-image">
          ${item.image_url 
            ? `<img src="${item.image_url}" alt="${item.name}" loading="lazy">`
            : `<div class="item-placeholder">${this.getCategoryIcon(item.category)}</div>`
          }
          <div class="item-overlay">
            <button class="item-action item-worn" title="Mark as worn">
              <span>👕</span>
            </button>
            <button class="item-action item-edit" title="Edit">
              <span>✏️</span>
            </button>
            <button class="item-action item-delete" title="Delete">
              <span>🗑️</span>
            </button>
          </div>
        </div>
        <div class="item-info">
          <h4 class="item-name">${this.escapeHtml(item.name)}</h4>
          <div class="item-meta">
            <span class="item-brand">${item.brand || 'No brand'}</span>
            <span class="item-color">
              <span class="color-dot" style="background-color: ${item.color || '#ccc'}"></span>
              ${item.color || 'No color'}
            </span>
          </div>
          <div class="item-weather">
            ${weatherIcons}
            <span class="temp-range">${item.weather_suitable.min_temp}°-${item.weather_suitable.max_temp}°F</span>
          </div>
          <div class="item-occasions">
            ${occasionTags}
          </div>
          <div class="item-footer">
            <span class="wear-count">${item.times_worn || 0} wears</span>
            <span class="last-worn">${lastWornText}</span>
          </div>
        </div>
      </div>
    `;
  }

  getCategoryIcon(category) {
    const icons = {
      tops: '👔',
      bottoms: '👖',
      dresses: '👗',
      outerwear: '🧥',
      shoes: '👟',
      accessories: '👜'
    };
    return icons[category] || '👕';
  }

  getWeatherIcons(weather) {
    let icons = [];
    if (weather.rain_ok) icons.push('<span class="weather-icon" title="Rain OK">🌧️</span>');
    if (weather.snow_ok) icons.push('<span class="weather-icon" title="Snow OK">❄️</span>');
    if (weather.max_temp >= 75) icons.push('<span class="weather-icon" title="Hot weather">☀️</span>');
    if (weather.min_temp <= 45) icons.push('<span class="weather-icon" title="Cold weather">🥶</span>');
    return icons.join('');
  }

  formatOccasion(occasion) {
    const formatted = {
      work: '👔 Work',
      casual: '👕 Casual',
      formal: '🎩 Formal',
      athletic: '🏃 Athletic',
      date: '💕 Date',
      party: '🎉 Party'
    };
    return formatted[occasion] || occasion;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async handleDelete(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await this.api.deleteItem(itemId);
      this.removeItemFromGrid(itemId);
      this.showNotification('Item deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      this.showNotification('Failed to delete item', 'error');
    }
  }

  async handleEdit(itemId) {
    const item = this.items.find(i => i._id === itemId);
    if (!item) return;
    
    // Trigger edit modal in formHandler
    const event = new CustomEvent('editItem', { detail: item });
    document.dispatchEvent(event);
  }

  async handleMarkWorn(itemId) {
    try {
      const event = prompt('What was the occasion? (optional)');
      await this.api.markItemWorn(itemId, { 
        date: new Date(), 
        event: event || '' 
      });
      
      // Update the item in the grid
      const updatedItem = await this.api.getItem(itemId);
      this.updateItemInGrid(updatedItem);
      this.showNotification('Item marked as worn!', 'success');
    } catch (error) {
      console.error('Error marking item as worn:', error);
      this.showNotification('Failed to update item', 'error');
    }
  }

  async showItemDetail(itemId) {
    try {
      const item = await this.api.getItem(itemId);
      const modal = document.getElementById('detail-modal');
      const content = document.getElementById('item-detail-content');
      
      content.innerHTML = `
        <div class="detail-container">
          <div class="detail-image">
            ${item.image_url 
              ? `<img src="${item.image_url}" alt="${item.name}">`
              : `<div class="detail-placeholder">${this.getCategoryIcon(item.category)}</div>`
            }
          </div>
          <div class="detail-info">
            <h2>${this.escapeHtml(item.name)}</h2>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Brand:</strong> ${item.brand || 'No brand'}
              </div>
              <div class="detail-item">
                <strong>Size:</strong> ${item.size || 'Not specified'}
              </div>
              <div class="detail-item">
                <strong>Color:</strong> 
                <span class="color-display">
                  <span class="color-dot" style="background-color: ${item.color || '#ccc'}"></span>
                  ${item.color || 'No color'}
                </span>
              </div>
              <div class="detail-item">
                <strong>Category:</strong> ${item.category}
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Weather Suitability</h3>
              <p>Temperature range: ${item.weather_suitable.min_temp}°F - ${item.weather_suitable.max_temp}°F</p>
              <p>${item.weather_suitable.rain_ok ? '✅' : '❌'} Rain suitable</p>
              <p>${item.weather_suitable.snow_ok ? '✅' : '❌'} Snow suitable</p>
            </div>
            
            <div class="detail-section">
              <h3>Occasions</h3>
              <div class="occasion-tags">
                ${item.occasions.map(occ => 
                  `<span class="occasion-tag">${this.formatOccasion(occ)}</span>`
                ).join('')}
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Wear History</h3>
              <p>Times worn: ${item.times_worn || 0}</p>
              <p>Last worn: ${item.last_worn ? this.formatDate(item.last_worn) : 'Never'}</p>
              <p>Added: ${this.formatDate(item.created_at)}</p>
            </div>
            
            ${item.notes ? `
              <div class="detail-section">
                <h3>Notes</h3>
                <p>${this.escapeHtml(item.notes)}</p>
              </div>
            ` : ''}
            
            <div class="detail-actions">
              <button class="btn btn-primary" onclick="window.styleSmartApp.formHandler.openEditModal('${item._id}')">
                Edit Item
              </button>
              <button class="btn btn-secondary" onclick="window.styleSmartApp.itemsGrid.handleMarkWorn('${item._id}')">
                Mark as Worn
              </button>
              <button class="btn btn-danger" onclick="window.styleSmartApp.itemsGrid.handleDelete('${item._id}')">
                Delete Item
              </button>
            </div>
          </div>
        </div>
      `;
      
      modal.classList.add('show');
    } catch (error) {
      console.error('Error showing item detail:', error);
      this.showNotification('Failed to load item details', 'error');
    }
  }

  removeItemFromGrid(itemId) {
    const card = this.container.querySelector(`[data-item-id="${itemId}"]`);
    if (card) {
      card.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => card.remove(), 300);
    }
    this.items = this.items.filter(item => item._id !== itemId);
  }

  updateItemInGrid(updatedItem) {
    const index = this.items.findIndex(item => item._id === updatedItem._id);
    if (index !== -1) {
      this.items[index] = updatedItem;
      const card = this.container.querySelector(`[data-item-id="${updatedItem._id}"]`);
      if (card) {
        const newCard = this.createItemCard(updatedItem);
        const temp = document.createElement('div');
        temp.innerHTML = newCard;
        card.replaceWith(temp.firstElementChild);
      }
    }
  }

  addAnimations() {
    const cards = this.container.querySelectorAll('.item-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.05}s`;
      card.classList.add('fade-in');
    });
  }

  showNotification(message, type) {
    const event = new CustomEvent('notification', { 
      detail: { message, type } 
    });
    document.dispatchEvent(event);
  }

  getItems() {
    return this.items;
  }

  clear() {
    this.items = [];
    this.container.innerHTML = '';
  }
}