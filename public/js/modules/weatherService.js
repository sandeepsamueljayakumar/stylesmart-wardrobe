// public/js/modules/weatherService.js
export class WeatherService {
  constructor() {
    // Simulated weather data for demo
    // In production, this would connect to a real weather API
    this.mockWeatherData = [
      { temperature: 72, description: 'Sunny', icon: '☀️', precipitation: 0 },
      { temperature: 65, description: 'Partly Cloudy', icon: '⛅', precipitation: 0 },
      { temperature: 58, description: 'Cloudy', icon: '☁️', precipitation: 0 },
      { temperature: 52, description: 'Rainy', icon: '🌧️', precipitation: 80 },
      { temperature: 45, description: 'Cold & Clear', icon: '🥶', precipitation: 0 },
      { temperature: 78, description: 'Hot & Sunny', icon: '🔥', precipitation: 0 },
      { temperature: 40, description: 'Snowy', icon: '❄️', precipitation: 90 }
    ];
    
    this.currentWeatherIndex = 0;
    this.setupWeatherRotation();
  }

  getCurrentWeather() {
    // For demo purposes, return mock data
    // In production, this would fetch from a weather API
    const weather = this.mockWeatherData[this.currentWeatherIndex];
    
    // Store current weather for filtering suggestions
    this.storeCurrentWeather(weather);
    
    return weather;
  }

  setupWeatherRotation() {
    // Change weather every 30 seconds for demo
    setInterval(() => {
      this.currentWeatherIndex = (this.currentWeatherIndex + 1) % this.mockWeatherData.length;
      this.updateWeatherDisplay();
      this.suggestFiltersBasedOnWeather();
    }, 30000);
  }

  updateWeatherDisplay() {
    const weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay) return;
    
    const weather = this.getCurrentWeather();
    weatherDisplay.innerHTML = `
      <div class="weather-card">
        <span class="weather-icon">${weather.icon}</span>
        <span class="weather-temp">${weather.temperature}°F</span>
        <span class="weather-desc">${weather.description}</span>
        ${weather.precipitation > 0 ? 
          `<span class="weather-precip">💧 ${weather.precipitation}% chance</span>` : ''
        }
      </div>
      ${this.getWeatherSuggestion(weather)}
    `;
  }

  getWeatherSuggestion(weather) {
    let suggestion = '';
    
    if (weather.temperature >= 75) {
      suggestion = `<div class="weather-suggestion">🔥 Hot day! Consider lightweight, breathable clothing.</div>`;
    } else if (weather.temperature <= 45) {
      suggestion = `<div class="weather-suggestion">🥶 Bundle up! Don't forget your coat and warm layers.</div>`;
    } else if (weather.precipitation >= 50) {
      suggestion = `<div class="weather-suggestion">☔ Rain likely! Choose water-resistant clothing.</div>`;
    } else if (weather.temperature >= 60 && weather.temperature <= 75) {
      suggestion = `<div class="weather-suggestion">👌 Perfect weather! Most of your wardrobe will work today.</div>`;
    }
    
    return suggestion;
  }

  suggestFiltersBasedOnWeather() {
    const weather = this.getCurrentWeather();
    const quickFilters = document.querySelectorAll('.filter-chip');
    
    // Remove all weather-based suggestions
    quickFilters.forEach(chip => chip.classList.remove('suggested'));
    
    // Add suggestions based on current weather
    if (weather.temperature >= 75) {
      const hotChip = document.querySelector('[data-weather="hot"]');
      if (hotChip) hotChip.classList.add('suggested');
    } else if (weather.temperature <= 45) {
      const coldChip = document.querySelector('[data-weather="cold"]');
      if (coldChip) coldChip.classList.add('suggested');
    }
    
    if (weather.precipitation >= 50) {
      const rainyChip = document.querySelector('[data-weather="rainy"]');
      if (rainyChip) rainyChip.classList.add('suggested');
    }
    
    if (weather.icon === '☀️') {
      const sunnyChip = document.querySelector('[data-weather="sunny"]');
      if (sunnyChip) sunnyChip.classList.add('suggested');
    }
  }

  storeCurrentWeather(weather) {
    try {
      sessionStorage.setItem('currentWeather', JSON.stringify({
        ...weather,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error storing weather data:', error);
    }
  }

  getStoredWeather() {
    try {
      const stored = sessionStorage.getItem('currentWeather');
      if (stored) {
        const data = JSON.parse(stored);
        // Check if data is less than 1 hour old
        if (Date.now() - data.timestamp < 3600000) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error retrieving weather data:', error);
    }
    return null;
  }

  async fetchRealWeather(location = 'auto') {
    // This would integrate with a real weather API
    // For now, return mock data
    console.log('Weather API integration placeholder for location:', location);
    return this.getCurrentWeather();
  }

  getWeatherFilters(weather) {
    const filters = {
      minTemp: Math.max(weather.temperature - 10, 0),
      maxTemp: Math.min(weather.temperature + 10, 100)
    };
    
    if (weather.precipitation >= 50) {
      filters.rainOk = true;
    }
    
    if (weather.temperature <= 32 && weather.precipitation > 0) {
      filters.snowOk = true;
    }
    
    return filters;
  }

  getSeasonalSuggestions() {
    const month = new Date().getMonth();
    const seasons = {
      winter: [11, 0, 1, 2],
      spring: [3, 4, 5],
      summer: [6, 7, 8],
      fall: [9, 10]
    };
    
    let currentSeason = 'all-season';
    for (const [season, months] of Object.entries(seasons)) {
      if (months.includes(month)) {
        currentSeason = season;
        break;
      }
    }
    
    const suggestions = {
      winter: {
        categories: ['outerwear', 'accessories'],
        message: 'Winter essentials: coats, scarves, and warm layers',
        filters: { maxTemp: 50, snowOk: true }
      },
      spring: {
        categories: ['tops', 'bottoms'],
        message: 'Spring favorites: light jackets and versatile layers',
        filters: { minTemp: 50, maxTemp: 70, rainOk: true }
      },
      summer: {
        categories: ['tops', 'dresses', 'shoes'],
        message: 'Summer must-haves: breathable fabrics and sun protection',
        filters: { minTemp: 70 }
      },
      fall: {
        categories: ['outerwear', 'bottoms'],
        message: 'Fall fashion: layers, boots, and cozy sweaters',
        filters: { minTemp: 45, maxTemp: 65 }
      }
    };
    
    return suggestions[currentSeason] || suggestions.spring;
  }
}