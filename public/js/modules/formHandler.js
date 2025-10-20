// public/js/modules/formHandler.js
export class FormHandler {
  constructor(api, itemsGrid) {
    this.api = api;
    this.itemsGrid = itemsGrid;
    this.currentEditId = null;
    this.init();
  }

  init() {
    this.form = document.getElementById('item-form');
    this.modal = document.getElementById('item-modal');
    this.modalTitle = document.getElementById('modal-title');
    
    this.setupEventListeners();
    this.setupValidation();
  }

  setupEventListeners() {
    // Form submission is already handled in main.js
    // Listen for edit item events
    document.addEventListener('editItem', (e) => {
      this.openEditModal(e.detail._id);
    });

    // Image URL preview
    const imageInput = document.getElementById('item-image');
    imageInput.addEventListener('input', (e) => {
      this.previewImage(e.target.value);
    });

    // Category-specific occasion suggestions
    document.getElementById('item-category').addEventListener('change', (e) => {
      this.suggestOccasions(e.target.value);
    });

    // Temperature validation
    const minTempInput = document.getElementById('min-temp-input');
    const maxTempInput = document.getElementById('max-temp-input');
    
    minTempInput.addEventListener('change', () => {
      const min = parseInt(minTempInput.value);
      const max = parseInt(maxTempInput.value);
      if (min > max) {
        maxTempInput.value = min;
      }
    });
    
    maxTempInput.addEventListener('change', () => {
      const min = parseInt(minTempInput.value);
      const max = parseInt(maxTempInput.value);
      if (max < min) {
        minTempInput.value = max;
      }
    });
  }

  setupValidation() {
    // Add custom validation
    this.form.addEventListener('submit', (e) => {
      if (!this.validateForm()) {
        e.preventDefault();
        return false;
      }
    });

    // Real-time validation
    const requiredFields = this.form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => {
        this.validateField(field);
      });
    });
  }

  validateForm() {
    let isValid = true;
    const requiredFields = this.form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Validate at least one occasion is selected
    const occasions = this.form.querySelectorAll('input[name="occasions"]:checked');
    if (occasions.length === 0) {
      this.showFieldError('occasions', 'Please select at least one occasion');
      isValid = false;
    }

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove previous error
    this.clearFieldError(fieldName);
    
    if (!value) {
      this.showFieldError(fieldName, `${this.getFieldLabel(fieldName)} is required`);
      return false;
    }

    // Additional validation based on field type
    if (field.type === 'url' && value) {
      try {
        new URL(value);
      } catch {
        this.showFieldError(fieldName, 'Please enter a valid URL');
        return false;
      }
    }

    return true;
  }

  showFieldError(fieldName, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove existing error
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
    
    field.classList.add('error');
  }

  clearFieldError(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    field.classList.remove('error');
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    const error = formGroup.querySelector('.field-error');
    if (error) error.remove();
  }

  getFieldLabel(fieldName) {
    const labels = {
      name: 'Item name',
      category: 'Category',
      color: 'Color',
      brand: 'Brand',
      size: 'Size',
      image_url: 'Image URL'
    };
    return labels[fieldName] || fieldName;
  }

  openAddModal() {
    this.currentEditId = null;
    this.modalTitle.textContent = 'Add New Item';
    this.form.reset();
    this.clearAllErrors();
    this.modal.classList.add('show');
    
    // Set default temperature values
    document.getElementById('min-temp-input').value = 32;
    document.getElementById('max-temp-input').value = 95;
  }

  async openEditModal(itemId) {
    try {
      const item = await this.api.getItem(itemId);
      this.currentEditId = itemId;
      this.modalTitle.textContent = 'Edit Item';
      
      // Populate form with item data
      this.form.elements.name.value = item.name;
      this.form.elements.category.value = item.category;
      this.form.elements.color.value = item.color || '';
      this.form.elements.brand.value = item.brand || '';
      this.form.elements.size.value = item.size || '';
      this.form.elements.image_url.value = item.image_url || '';
      this.form.elements.notes.value = item.notes || '';
      
      // Set temperature range
      document.getElementById('min-temp-input').value = item.weather_suitable.min_temp;
      document.getElementById('max-temp-input').value = item.weather_suitable.max_temp;
      
      // Set weather checkboxes
      this.form.elements.rain_ok.checked = item.weather_suitable.rain_ok;
      this.form.elements.snow_ok.checked = item.weather_suitable.snow_ok;
      
      // Set occasions
      this.form.querySelectorAll('input[name="occasions"]').forEach(cb => {
        cb.checked = item.occasions.includes(cb.value);
      });
      
      // Preview image if exists
      if (item.image_url) {
        this.previewImage(item.image_url);
      }
      
      this.clearAllErrors();
      this.modal.classList.add('show');
    } catch (error) {
      console.error('Error loading item for edit:', error);
      this.showNotification('Failed to load item', 'error');
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    const formData = new FormData(this.form);
    const itemData = {
      name: formData.get('name').trim(),
      category: formData.get('category'),
      color: formData.get('color') || null,
      brand: formData.get('brand').trim() || null,
      size: formData.get('size').trim() || null,
      image_url: formData.get('image_url').trim() || null,
      notes: formData.get('notes').trim() || null,
      weather_suitable: {
        min_temp: parseInt(formData.get('min_temp')),
        max_temp: parseInt(formData.get('max_temp')),
        rain_ok: formData.get('rain_ok') === 'on',
        snow_ok: formData.get('snow_ok') === 'on'
      },
      occasions: formData.getAll('occasions')
    };

    try {
      let result;
      if (this.currentEditId) {
        result = await this.api.updateItem(this.currentEditId, itemData);
        this.showNotification('Item updated successfully!', 'success');
        
        // Update item in grid
        this.itemsGrid.updateItemInGrid(result);
      } else {
        result = await this.api.createItem(itemData);
        this.showNotification('Item added successfully!', 'success');
        
        // Reload items to show new item
        window.styleSmartApp.loadItems();
      }
      
      this.closeModal();
    } catch (error) {
      console.error('Error saving item:', error);
      this.showNotification('Failed to save item. Please try again.', 'error');
    }
  }

  closeModal() {
    this.modal.classList.remove('show');
    this.form.reset();
    this.clearAllErrors();
    this.currentEditId = null;
    
    // Clear image preview
    const previewContainer = document.querySelector('.image-preview');
    if (previewContainer) {
      previewContainer.remove();
    }
  }

  clearAllErrors() {
    this.form.querySelectorAll('.field-error').forEach(error => error.remove());
    this.form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
  }

  previewImage(url) {
    // Remove existing preview
    const existingPreview = this.form.querySelector('.image-preview');
    if (existingPreview) {
      existingPreview.remove();
    }
    
    if (!url) return;
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return;
    }
    
    // Create preview
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = `
      <img src="${url}" alt="Preview" onError="this.parentElement.innerHTML='<p>Failed to load image</p>'">
    `;
    
    const imageField = document.getElementById('item-image').parentElement;
    imageField.appendChild(preview);
  }

  suggestOccasions(category) {
    const suggestions = {
      tops: ['work', 'casual'],
      bottoms: ['work', 'casual'],
      dresses: ['work', 'formal', 'party', 'date'],
      outerwear: ['work', 'casual'],
      shoes: ['work', 'casual', 'athletic'],
      accessories: ['work', 'casual', 'formal']
    };
    
    const checkboxes = this.form.querySelectorAll('input[name="occasions"]');
    checkboxes.forEach(cb => {
      cb.checked = false;
    });
    
    if (suggestions[category]) {
      suggestions[category].forEach(occasion => {
        const cb = this.form.querySelector(`input[name="occasions"][value="${occasion}"]`);
        if (cb) cb.checked = true;
      });
    }
  }

  showNotification(message, type) {
    const event = new CustomEvent('notification', { 
      detail: { message, type } 
    });
    document.dispatchEvent(event);
  }
}