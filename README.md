# StyleSmart Wardrobe 👔🌦️

A weather-aware wardrobe management application that eliminates the daily "what should I wear?" dilemma.

![StyleSmart Wardrobe Screenshot](https://via.placeholder.com/800x400?text=StyleSmart+Wardrobe+Screenshot)

## Author
**Sandeep Samuel Jayakumar**  
Northeastern University - Web Development Course  
Fall 2025

## Class Link
[CS5010 - Web Development](https://northeastern.edu/cs5010)

## Project Objective
StyleSmart Wardrobe is a single-page web application that combines wardrobe cataloging with weather-aware outfit filtering. Users can quickly filter their clothing by weather conditions (temperature, rain, snow), occasion (formal, casual, athletic), and clothing type through an intuitive interface. With a pre-populated database of 1,000+ clothing items, users can rapidly build their digital closet and discover outfit combinations suitable for any situation.

### Key Features
- 🌡️ **Weather-Aware Filtering**: Filter clothes by temperature range and precipitation
- 👔 **Occasion-Based Categories**: Work, casual, formal, athletic, and more
- 🔍 **Smart Search**: Quick search across all item attributes
- 📊 **Wardrobe Analytics**: Track wear frequency and identify underused items
- 🎨 **Client-Side Rendering**: Fast, responsive SPA using vanilla JavaScript
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Screenshot
![Application Dashboard](https://via.placeholder.com/1200x800?text=StyleSmart+Dashboard)

## Tech Stack
- **Frontend**: Vanilla JavaScript (ES6 Modules), HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Native Driver, no Mongoose)
- **Tools**: ESLint, Prettier
- **Deployment**: [Your deployment platform]

## Instructions to Build

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/stylesmart-wardrobe.git
cd stylesmart-wardrobe
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/stylesmart
PORT=3000
NODE_ENV=development
```

4. **Seed the database** (Creates 1000+ sample items)
```bash
npm run seed
```

5. **Run the application**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

6. **Open in browser**
Navigate to `http://localhost:3000`

### Build Commands
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint checks
- `npm run format` - Format code with Prettier
- `npm run seed` - Populate database with sample data

## Project Structure
```
stylesmart-wardrobe/
├── public/                  # Static files (client-side)
│   ├── css/                # Modular CSS files
│   │   ├── main.css
│   │   └── components/
│   │       ├── header.css
│   │       ├── filters.css
│   │       ├── items-grid.css
│   │       ├── item-form.css
│   │       └── modal.css
│   ├── js/                 # JavaScript ES6 modules
│   │   ├── main.js
│   │   └── modules/
│   │       ├── api.js
│   │       ├── itemsGrid.js
│   │       ├── filterManager.js
│   │       ├── formHandler.js
│   │       ├── weatherService.js
│   │       └── router.js
│   └── index.html          # Single HTML page
├── routes/                 # Express routes
│   ├── items.js
│   └── outfits.js
├── db/                     # Database modules
│   └── connection.js
├── scripts/                # Utility scripts
│   └── seedDatabase.js
├── .env                    # Environment variables (not in repo)
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── .gitignore
├── LICENSE                 # MIT License
├── package.json
├── README.md
└── server.js              # Express server entry point
```

## API Endpoints

### Items
- `GET /api/items` - Get all items with filters
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/worn` - Mark item as worn
- `GET /api/items/stats/summary` - Get wardrobe statistics

### Outfits
- `GET /api/outfits` - Get all outfits
- `GET /api/outfits/:id` - Get single outfit
- `POST /api/outfits` - Create new outfit
- `PUT /api/outfits/:id` - Update outfit
- `DELETE /api/outfits/:id` - Delete outfit

## Features Implementation

### ✅ Core Requirements
- [x] Client-side rendering with vanilla JavaScript
- [x] ES6 modules for code organization
- [x] 2+ MongoDB collections (items, outfits)
- [x] Full CRUD operations
- [x] 1000+ database records
- [x] Form implementation
- [x] Node.js + Express backend
- [x] No CJS modules (using ES6 imports)
- [x] No Mongoose or template engines
- [x] Modular CSS organization
- [x] Responsive design

### ✅ Code Quality
- [x] ESLint configuration
- [x] Prettier formatting
- [x] Proper file organization
- [x] Environment variables for secrets
- [x] MIT License
- [x] Clean code (no leftover files)

## Usage Instructions

### Adding Items
1. Click the "+ Add Item" button in the header
2. Fill in the item details (name and category are required)
3. Set weather suitability (temperature range, rain/snow compatibility)
4. Select appropriate occasions
5. Click "Save Item"

### Filtering Your Wardrobe
1. **Quick Filters**: Click weather or occasion buttons for instant filtering
2. **Advanced Filters**: Use the sidebar for detailed filtering options
3. **Search**: Type keywords to search across all item attributes
4. **Sort**: Use the dropdown to sort by newest, oldest, most worn, or least worn

### Building Outfits
1. Click "Outfit Builder" in the header
2. Select items for each clothing category
3. Check weather compatibility
4. Save outfit for future reference

## Deployment

The application is deployed at: [Your deployment URL]

### Deployment Steps
1. Set up MongoDB Atlas or similar cloud database
2. Configure environment variables on hosting platform
3. Deploy to hosting service (Render, Heroku, etc.)
4. Run database seed script if needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Weather icons from OpenWeatherMap
- Inspiration from various wardrobe management apps
- Northeastern University Web Development Course

## Contact

Sandeep Samuel Jayakumar - [jayakumar.sa@northeastern.edu](mailto:jayakumar.sa@northeastern.edu)

Project Link: [https://github.com/yourusername/stylesmart-wardrobe](https://github.com/yourusername/stylesmart-wardrobe)