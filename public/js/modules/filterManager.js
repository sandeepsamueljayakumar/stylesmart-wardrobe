// public/js/modules/filterManager.js
export class FilterManager {
  constructor(itemsGrid) {
    this.itemsGrid = itemsGrid;
    this.activeFilters = {};
    this.init();
  }

  init() {
    this.setupFilterListeners();
    this.loadSavedFilters();
  }

  setupFilterListeners() {
    // Temperature range listeners
    const minTempSlider = document.getElementById('min-temp');
    const maxTempSlider = document.getElementById('max-temp');
    
    minTempSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('min-temp-value').textContent = value;
      
      // Ensure min is not greater than max
      const maxValue = parseInt(maxTempSlider.value);
      if (value > maxValue) {
        maxTempSlider.value = value;
        document.getElementById('max-temp-value').textContent = value;
      }
    });
    
    maxTempSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('max-temp-value').textContent = value;
      
      // Ensure max is not less than min
      const minValue = parseInt(minTempSlider.value);
      if (value < minValue) {
        minTempSlider.value = value;
        document.getElementById('min-temp-value').textContent = value;
      }
    });

    // Category checkboxes
    document.querySelectorAll('.filter-group input[type="checkbox"][value]').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateCategoryCount());
    });

    // Color filter
    document.getElementById('color-filter').addEventListener('change', () => {
      this.updateActiveFilters();
    });

    // Last worn radio buttons
    document.querySelectorAll('input[name="last-worn"]').forEach(radio => {
      radio.addEventListener('change', () => this.updateActiveFilters());
    });

    // Weather suitability checkboxes
    document.getElementById('rain-suitable').addEventListener('change', () => {
      this.updateActiveFilters();
    });
    
    document.getElementById('snow-suitable').addEventListener('change', () => {
      this.updateActiveFilters();
    });

    // Mobile filter toggle
    this.setupMobileFilterToggle();
  }

  setupMobileFilterToggle() {
    // Create mobile filter button if on mobile
    if (window.innerWidth <= 768) {
      const filterToggle = document.createElement('button');
      filterToggle.className = 'mobile-filter-toggle btn btn-secondary';
      filterToggle.innerHTML = '🔧 Filters';
      filterToggle.addEventListener('click', () => {
        document.getElementById('filters-sidebar').classList.toggle('show');
      });
      
      const searchSection = document.querySelector('.search-section');
      searchSection.appendChild(filterToggle);
    }

    // Close filters when clicking outside on mobile
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('filters-sidebar');
      const toggle = document.querySelector('.mobile-filter-toggle');
      
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !toggle?.contains(e.target) &&
          sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
      }
    });
  }

  getActiveFilters() {
    const filters = {};
    
    // Temperature range
    const minTemp = document.getElementById('min-temp').value;
    const maxTemp = document.getElementById('max-temp').value;
    
    if (minTemp !== '32') filters.minTemp = minTemp;
    if (maxTemp !== '95') filters.maxTemp = maxTemp;
    
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
      const validCategories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
      if (validCategories.includes(cb.value)) {
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
    
    // Quick filters (if any are active)
    document.querySelectorAll('.filter-chip.active').forEach(chip => {
      if (chip.dataset.occasion) {
        filters.occasion = chip.dataset.occasion;
      }
    });
    
    this.activeFilters = filters;
    return filters;
  }

  clearFilters() {
    // Reset all filter inputs
    document.getElementById('min-temp').value = 32;
    document.getElementById('max-temp').value = 95;
    document.getElementById('min-temp-value').textContent = '32';
    document.getElementById('max-temp-value').textContent = '95';
    
    document.getElementById('rain-suitable').checked = false;
    document.getElementById('snow-suitable').checked = false;
    
    document.querySelectorAll('.filter-group input[type="checkbox"][value]').forEach(cb => {
      cb.checked = false;
    });
    
    document.getElementById('color-filter').value = '';
    
    document.querySelectorAll('input[name="last-worn"]').forEach(radio => {
      radio.checked = false;
    });
    document.querySelector('input[name="last-worn"][value=""]').checked = true;
    
    // Clear quick filters
    document.querySelectorAll('.filter-chip.active').forEach(chip => {
      chip.classList.remove('active');
    });
    
    this.activeFilters = {};
    this.saveFilters();
    this.updateFilterIndicator();
  }

  updateActiveFilters() {
    this.getActiveFilters();
    this.updateFilterIndicator();
  }

  updateFilterIndicator() {
    const filterCount = Object.keys(this.activeFilters).length;
    const clearButton = document.getElementById('clear-filters');
    
    if (filterCount > 0) {
      clearButton.style.display = 'inline';
      clearButton.textContent = `Clear All (${filterCount})`;
      
      // Add active indicator to filter sidebar
      const sidebar = document.getElementById('filters-sidebar');
      sidebar.classList.add('has-active-filters');
    } else {
      clearButton.style.display = 'none';
      
      const sidebar = document.getElementById('filters-sidebar');
      sidebar.classList.remove('has-active-filters');
    }
  }

  updateCategoryCount() {
    const checkedCategories = document.querySelectorAll('.filter-group input[type="checkbox"][value]:checked');
    const categoryHeader = document.querySelector('.filter-group h4');
    
    if (checkedCategories.length > 0 && categoryHeader.textContent.startsWith('Category')) {
      categoryHeader.textContent = `Category (${checkedCategories.length})`;
    } else if (checkedCategories.length === 0) {
      categoryHeader.textContent = 'Category';
    }
  }

  saveFilters() {
    try {
      sessionStorage.setItem('styleSmartFilters', JSON.stringify(this.activeFilters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }

  loadSavedFilters() {
    try {
      const saved = sessionStorage.getItem('styleSmartFilters');
      if (saved) {
        const filters = JSON.parse(saved);
        this.applyFilters(filters);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }

  applyFilters(filters) {
    if (filters.minTemp) {
      document.getElementById('min-temp').value = filters.minTemp;
      document.getElementById('min-temp-value').textContent = filters.minTemp;
    }
    
    if (filters.maxTemp) {
      document.getElementById('max-temp').value = filters.maxTemp;
      document.getElementById('max-temp-value').textContent = filters.maxTemp;
    }
    
    if (filters.rainOk) {
      document.getElementById('rain-suitable').checked = true;
    }
    
    if (filters.snowOk) {
      document.getElementById('snow-suitable').checked = true;
    }
    
    if (filters.category) {
      const categories = filters.category.split(',');
      categories.forEach(cat => {
        const checkbox = document.querySelector(`input[type="checkbox"][value="${cat}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    
    if (filters.color) {
      document.getElementById('color-filter').value = filters.color;
    }
    
    if (filters.lastWorn) {
      const radio = document.querySelector(`input[name="last-worn"][value="${filters.lastWorn}"]`);
      if (radio) radio.checked = true;
    }
    
    this.activeFilters = filters;
    this.updateFilterIndicator();
  }

  // Quick filter presets
  applyQuickFilter(type, value) {
    const presets = {
      weather: {
        sunny: { minTemp: 70, maxTemp: 95 },
        rainy: { rainOk: true },
        cold: { maxTemp: 45 },
        hot: { minTemp: 75 }
      },
      occasion: {
        work: { occasion: 'work' },
        party: { occasion: 'party' },
        athletic: { occasion: 'athletic' },
        casual: { occasion: 'casual' }
      }
    };

    if (presets[type] && presets[type][value]) {
      const filterSettings = presets[type][value];
      this.applyFilters(filterSettings);
      return filterSettings;
    }
    
    return null;
  }

  getFilterSummary() {
    const parts = [];
    
    if (this.activeFilters.minTemp || this.activeFilters.maxTemp) {
      const min = this.activeFilters.minTemp || 32;
      const max = this.activeFilters.maxTemp || 95;
      parts.push(`${min}°-${max}°F`);
    }
    
    if (this.activeFilters.category) {
      const cats = this.activeFilters.category.split(',');
      parts.push(`${cats.length} categories`);
    }
    
    if (this.activeFilters.color) {
      parts.push(this.activeFilters.color);
    }
    
    if (this.activeFilters.occasion) {
      parts.push(this.activeFilters.occasion);
    }
    
    if (this.activeFilters.rainOk) parts.push('rain-suitable');
    if (this.activeFilters.snowOk) parts.push('snow-suitable');
    
    if (this.activeFilters.lastWorn) {
      const lastWornLabels = {
        week: 'not worn this week',
        month: 'not worn this month',
        never: 'never worn'
      };
      parts.push(lastWornLabels[this.activeFilters.lastWorn]);
    }
    
    return parts.length > 0 ? `Filters: ${parts.join(', ')}` : 'No filters applied';
  }
}