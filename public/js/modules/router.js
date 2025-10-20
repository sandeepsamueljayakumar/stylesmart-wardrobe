// public/js/modules/router.js
export class Router {
  constructor() {
    this.routes = {
      '/': 'home',
      '/items': 'items',
      '/outfits': 'outfits',
      '/analytics': 'analytics'
    };
    
    this.currentRoute = '/';
  }

  init() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      this.handleRoute(window.location.pathname);
    });

    // Handle initial route
    this.handleRoute(window.location.pathname);
    
    // Setup navigation links
    this.setupNavigation();
  }

  setupNavigation() {
    // Intercept all internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      
      e.preventDefault();
      this.navigate(href);
    });
  }

  navigate(path) {
    if (this.currentRoute === path) return;
    
    window.history.pushState(null, '', path);
    this.handleRoute(path);
  }

  handleRoute(path) {
    this.currentRoute = path;
    const route = this.routes[path] || 'home';
    
    // Update active nav state
    this.updateActiveNav(path);
    
    // Load appropriate content
    switch (route) {
      case 'home':
        this.loadHomePage();
        break;
      case 'items':
        this.loadItemsPage();
        break;
      case 'outfits':
        this.loadOutfitsPage();
        break;
      case 'analytics':
        this.loadAnalyticsPage();
        break;
      default:
        this.load404Page();
    }
  }

  updateActiveNav(path) {
    // Remove all active classes
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current route
    const activeLink = document.querySelector(`a[href="${path}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  loadHomePage() {
    // Home page is already loaded by default
    document.querySelector('.welcome-section').style.display = 'block';
    document.querySelector('.quick-filters').style.display = 'block';
    document.querySelector('.content-with-sidebar').style.display = 'grid';
    
    // Reload items if needed
    if (window.styleSmartApp) {
      window.styleSmartApp.loadItems();
    }
  }

  loadItemsPage() {
    // Focus on items grid with all filters visible
    this.loadHomePage();
  }

  loadOutfitsPage() {
    // Load outfits view
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
      <div class="outfits-page">
        <header class="page-header">
          <h2>Outfit Builder</h2>
          <button class="btn btn-primary" onclick="window.styleSmartApp.createNewOutfit()">
            + Create Outfit
          </button>
        </header>
        
        <div class="outfits-grid" id="outfits-grid">
          <div class="loading">Loading outfits...</div>
        </div>
      </div>
    `;
    
    this.loadOutfits();
  }

  async loadOutfits() {
    try {
      const response = await fetch('/api/outfits');
      const outfits = await response.json();
      
      const grid = document.getElementById('outfits-grid');
      
      if (outfits.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <p>No outfits created yet</p>
            <button class="btn btn-primary" onclick="window.styleSmartApp.createNewOutfit()">
              Create Your First Outfit
            </button>
          </div>
        `;
      } else {
        grid.innerHTML = outfits.map(outfit => this.createOutfitCard(outfit)).join('');
      }
    } catch (error) {
      console.error('Error loading outfits:', error);
      document.getElementById('outfits-grid').innerHTML = 
        '<div class="error">Failed to load outfits</div>';
    }
  }

  createOutfitCard(outfit) {
    return `
      <div class="outfit-card" data-outfit-id="${outfit._id}">
        <div class="outfit-header">
          <h3>${outfit.name}</h3>
          <span class="outfit-occasion">${outfit.occasion}</span>
        </div>
        <div class="outfit-items">
          ${outfit.items.length} items
        </div>
        <div class="outfit-weather">
          ${outfit.weather_conditions.temperature}°F
          ${outfit.weather_conditions.rainy ? '🌧️' : '☀️'}
        </div>
        <div class="outfit-footer">
          <span class="worn-count">Worn ${outfit.worn_dates?.length || 0} times</span>
          <button class="btn btn-sm" onclick="window.styleSmartApp.viewOutfit('${outfit._id}')">
            View
          </button>
        </div>
      </div>
    `;
  }

  loadAnalyticsPage() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
      <div class="analytics-page">
        <header class="page-header">
          <h2>Wardrobe Analytics</h2>
        </header>
        
        <div class="stats-grid" id="stats-grid">
          <div class="loading">Loading analytics...</div>
        </div>
      </div>
    `;
    
    this.loadAnalytics();
  }

  async loadAnalytics() {
    try {
      const response = await fetch('/api/items/stats/summary');
      const stats = await response.json();
      
      const grid = document.getElementById('stats-grid');
      grid.innerHTML = `
        <div class="stat-card">
          <h3>Total Items</h3>
          <div class="stat-value">${stats.totalItems[0]?.total || 0}</div>
        </div>
        
        <div class="stat-card">
          <h3>Never Worn</h3>
          <div class="stat-value">${stats.neverWorn[0]?.count || 0}</div>
          <div class="stat-label">items need attention</div>
        </div>
        
        <div class="stat-card">
          <h3>By Category</h3>
          <div class="stat-list">
            ${stats.byCategory.map(cat => `
              <div class="stat-item">
                <span>${cat._id}</span>
                <span>${cat.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="stat-card">
          <h3>By Occasion</h3>
          <div class="stat-list">
            ${stats.byOccasion.map(occ => `
              <div class="stat-item">
                <span>${occ._id}</span>
                <span>${occ.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="stat-card">
          <h3>Popular Colors</h3>
          <div class="color-chart">
            ${stats.byColor.slice(0, 5).map(color => `
              <div class="color-bar">
                <span class="color-dot" style="background-color: ${color._id}"></span>
                <span>${color._id}: ${color.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error loading analytics:', error);
      document.getElementById('stats-grid').innerHTML = 
        '<div class="error">Failed to load analytics</div>';
    }
  }

  load404Page() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
      <div class="error-page">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
      </div>
    `;
  }
}