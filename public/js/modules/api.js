// public/js/modules/api.js
export class ItemsAPI {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Items endpoints
  async getItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/items${queryString ? '?' + queryString : ''}`);
  }

  async getItem(id) {
    return this.request(`/items/${id}`);
  }

  async createItem(itemData) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async updateItem(id, itemData) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: 'DELETE'
    });
  }

  async markItemWorn(id, data = {}) {
    return this.request(`/items/${id}/worn`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getItemStats() {
    return this.request('/items/stats/summary');
  }

  // Outfits endpoints
  async getOutfits(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/outfits${queryString ? '?' + queryString : ''}`);
  }

  async getOutfit(id) {
    return this.request(`/outfits/${id}`);
  }

  async createOutfit(outfitData) {
    return this.request('/outfits', {
      method: 'POST',
      body: JSON.stringify(outfitData)
    });
  }

  async updateOutfit(id, outfitData) {
    return this.request(`/outfits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(outfitData)
    });
  }

  async deleteOutfit(id) {
    return this.request(`/outfits/${id}`, {
      method: 'DELETE'
    });
  }
}

export class OutfitsAPI {
  constructor() {
    this.baseURL = '/api/outfits';
  }

  async request(endpoint = '', options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Outfits API request failed:', error);
      throw error;
    }
  }

  async getAllOutfits() {
    return this.request();
  }

  async getOutfit(id) {
    return this.request(`/${id}`);
  }

  async createOutfit(outfit) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(outfit)
    });
  }

  async updateOutfit(id, outfit) {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(outfit)
    });
  }

  async deleteOutfit(id) {
    return this.request(`/${id}`, {
      method: 'DELETE'
    });
  }

  async markOutfitWorn(id, date = new Date(), event = '') {
    return this.request(`/${id}/worn`, {
      method: 'POST',
      body: JSON.stringify({ date, event })
    });
  }
}