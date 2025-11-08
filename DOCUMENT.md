# StyleSmart Wardrobe - Design Document

## Project Description

StyleSmart Wardrobe is a web application that eliminates the daily "what should I wear?" dilemma by combining wardrobe cataloging with weather-aware outfit filtering. Users can quickly filter their clothing by weather conditions (temperature, rain, snow), occasion (formal, casual, athletic), and clothing type through an intuitive single-page interface. With a pre-populated database of 1,000+ clothing items, users can rapidly build their digital closet and discover outfit combinations suitable for any situation. The app helps users maximize their existing wardrobe, avoid buying duplicates, and dress appropriately for any weather or occasion.

### Key Features
- Weather-aware outfit filtering based on temperature, precipitation
- Occasion-based categorization (formal, casual, athletic, work)
- Quick search and filter capabilities
- Wardrobe item management (CRUD operations)
- Outfit tracking to avoid repeats
- Pre-populated database with 1,000+ items for quick start
- Responsive single-page application with client-side rendering

## User Personas

### Persona 1: Alex Chen - The Busy Professional
- **Age:** 32
- **Occupation:** Marketing Manager
- **Location:** Seattle, WA
- **Tech Savvy:** High
- **Pain Points:** 
  - Wastes 10-15 minutes every morning deciding what to wear
  - Often dressed inappropriately for sudden weather changes
  - Struggles to remember what was worn to previous client meetings
- **Goals:**
  - Quickly find weather-appropriate work outfits
  - Track outfits worn to important meetings
  - Maintain professional appearance regardless of weather

### Persona 2: Jordan Rivera - The Budget-Conscious Student
- **Age:** 20
- **Occupation:** College Student
- **Location:** Boston, MA
- **Tech Savvy:** Medium
- **Pain Points:**
  - Limited budget for clothing
  - Often buys similar items forgetting what's already owned
  - Small dorm closet makes it hard to see all options
- **Goals:**
  - Maximize existing wardrobe combinations
  - Avoid duplicate purchases
  - Find versatile pieces that work for multiple occasions

### Persona 3: Sam Thompson - The Job Seeker
- **Age:** 26
- **Occupation:** Recent Graduate seeking employment
- **Location:** Chicago, IL
- **Tech Savvy:** High
- **Pain Points:**
  - Needs to look professional for interviews in various weather conditions
  - Limited professional wardrobe
  - Anxiety about outfit appropriateness
- **Goals:**
  - Plan interview outfits in advance
  - Ensure weather-appropriate professional attire
  - Build confidence through prepared outfit choices

### Persona 4: Riley Martinez - The Minimalist
- **Age:** 35
- **Occupation:** UX Designer
- **Location:** San Francisco, CA
- **Tech Savvy:** Very High
- **Pain Points:**
  - Wants to maintain a minimal wardrobe
  - Needs pieces that work across seasons
  - Difficulty tracking wear frequency
- **Goals:**
  - Identify most versatile pieces
  - Track item usage to make informed decisions about what to keep
  - Filter by temperature ranges to find multi-season items

## User Stories

### Story 1: Alex's Monday Morning Rush
**As** a busy professional  
**I want** to filter my wardrobe by "workwear" and "rainy"  
**So that** I can find a weather-appropriate work outfit in under a minute

**Acceptance Criteria:**
- Can select multiple filters simultaneously (occasion + weather)
- Results appear instantly without page reload
- Can save favorite combinations for quick access
- Shows visual preview of each item

### Story 2: Jordan's Shopping Save
**As** a budget-conscious student  
**I want** to search my wardrobe before shopping  
**So that** I don't buy items similar to what I already own

**Acceptance Criteria:**
- Search functionality works across all item attributes
- Can filter by color, type, and brand
- Mobile-friendly for checking while shopping
- Shows count of similar items owned

### Story 3: Sam's Interview Prep
**As** a job seeker  
**I want** to plan interview outfits for different weather conditions  
**So that** I look professional regardless of rain or shine

**Acceptance Criteria:**
- Can create and save outfit combinations
- Weather forecast integration shows upcoming conditions
- Can mark outfits as "worn to [company]"
- Professional category clearly defined

### Story 4: Riley's Seasonal Closet
**As** a minimalist  
**I want** to filter clothes by temperature range (50-75°F)  
**So that** I can identify versatile pieces that work across seasons

**Acceptance Criteria:**
- Temperature range slider for filtering
- Shows last worn date for each item
- Can sort by versatility score
- Analytics showing most/least worn items

### Story 5: Casey's Event Planning
**As** a social event attendee  
**I want** to track what I wore to previous occasions  
**So that** I avoid outfit repeats with the same crowd

**Acceptance Criteria:**
- Can log outfits with event names and dates
- Search previous outfits by event type
- Photo upload for outfit documentation
- Calendar view of outfit history

### Story 6: Morgan's Wardrobe Rediscovery
**As** a wardrobe owner  
**I want** to browse items I haven't worn recently  
**So that** I can rediscover and utilize my full wardrobe

**Acceptance Criteria:**
- "Not worn in X days" filter
- Random outfit suggestion feature
- Can mark items as donated/sold
- Statistics on wardrobe utilization

## Design Mockups

### 1. Landing Page / Dashboard
```
┌─────────────────────────────────────────────────────┐
│  StyleSmart Wardrobe  [Add Item] [Profile] [Logout]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Welcome back, Alex!                                │
│  Today: 52°F, Rainy ☔                               │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │         Quick Filters                        │   │
│  │                                              │   │
│  │  [☀️ Sunny] [🌧️ Rainy] [❄️ Cold] [🔥 Hot]      │   │
│  │  [👔 Work] [🎉 Party] [🏃 Athletic] [👕 Casual] │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Search: [_________________________] 🔍             │
│                                                      │
│  ┌─────────┬─────────┬─────────┬─────────┐        │
│  │ Item 1  │ Item 2  │ Item 3  │ Item 4  │        │
│  │ [Image] │ [Image] │ [Image] │ [Image] │        │
│  │ Blue    │ White   │ Black   │ Red     │        │
│  │ Shirt   │ Dress   │ Pants   │ Jacket  │        │
│  │ Work    │ Formal  │ Casual  │ Outdoor │        │
│  └─────────┴─────────┴─────────┴─────────┘        │
│                                                      │
│  [Load More...]                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Add/Edit Item Form
```
┌─────────────────────────────────────────────────────┐
│  Add New Item                                    [X] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────┐                                 │
│  │                │  [Upload Image]                 │
│  │  Image Preview │                                 │
│  │                │                                 │
│  └────────────────┘                                 │
│                                                      │
│  Name: [_____________________________]              │
│                                                      │
│  Category: [Tops ▼]    Color: [Blue ▼]             │
│                                                      │
│  Brand: [_______________]  Size: [M ▼]             │
│                                                      │
│  Weather Suitable For:                              │
│  ☐ Hot (75°F+)  ☐ Warm (60-75°F)                  │
│  ☐ Cool (45-60°F)  ☐ Cold (<45°F)                 │
│  ☐ Rain OK  ☐ Snow OK                              │
│                                                      │
│  Occasions:                                         │
│  ☐ Work  ☐ Casual  ☐ Formal  ☐ Athletic           │
│  ☐ Date Night  ☐ Party                             │
│                                                      │
│  Notes: [_____________________________]             │
│         [_____________________________]             │
│                                                      │
│  [Cancel]                    [Save Item]            │
└─────────────────────────────────────────────────────┘
```

### 3. Item Detail View
```
┌─────────────────────────────────────────────────────┐
│  Item Details                                   [X] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────┐   Navy Blue Blazer             │
│  │                │   Brand: J.Crew                 │
│  │                │   Size: Medium                  │
│  │  [Item Image]  │   Category: Outerwear           │
│  │                │                                 │
│  │                │   Suitable for:                 │
│  └────────────────┘   • Work, Formal Events         │
│                       • 45-75°F                     │
│                       • Light rain OK                │
│                                                      │
│  Last Worn: March 15, 2024                         │
│  Times Worn: 12                                     │
│  Added: January 5, 2024                            │
│                                                      │
│  Outfit History:                                    │
│  • March 15 - Client Meeting                       │
│  • March 8 - Team Presentation                     │
│  • February 28 - Interview at TechCorp             │
│                                                      │
│  [Edit]  [Mark as Worn]  [Delete]                  │
└─────────────────────────────────────────────────────┘
```

### 4. Filter Sidebar (Mobile Responsive)
```
┌─────────────────────────────────────────────────────┐
│  Filters                                 [Clear All] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Weather                                            │
│  ┌──────────────────────────────────┐              │
│  │ Temperature Range                 │              │
│  │ 32°F [========|====] 95°F        │              │
│  │      45°F    75°F                │              │
│  └──────────────────────────────────┘              │
│  ☐ Rain suitable                                    │
│  ☐ Snow suitable                                    │
│                                                      │
│  Category                                           │
│  ☐ Tops (245)                                      │
│  ☐ Bottoms (132)                                   │
│  ☐ Dresses (89)                                    │
│  ☐ Outerwear (76)                                  │
│  ☐ Shoes (203)                                     │
│  ☐ Accessories (156)                               │
│                                                      │
│  Occasion                                           │
│  ☐ Work (342)                                      │
│  ☐ Casual (578)                                    │
│  ☐ Formal (124)                                    │
│  ☐ Athletic (201)                                  │
│                                                      │
│  Color                                              │
│  [Color palette selector]                           │
│                                                      │
│  Last Worn                                          │
│  ○ Any time                                         │
│  ○ Not in last week                                 │
│  ○ Not in last month                                │
│  ○ Never worn                                       │
│                                                      │
│  [Apply Filters]                                    │
└─────────────────────────────────────────────────────┘
```

### 5. Outfit Builder
```
┌─────────────────────────────────────────────────────┐
│  Outfit Builder               [Save Outfit] [Clear] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Current Weather: 58°F, Partly Cloudy               │
│  Occasion: [Work Meeting ▼]                         │
│                                                      │
│  ┌───────────────────────────────────┐             │
│  │      Your Outfit                   │             │
│  │                                    │             │
│  │  Top: Blue Oxford Shirt            │             │
│  │  [Image]                           │             │
│  │                                    │             │
│  │  Bottom: Charcoal Dress Pants      │             │
│  │  [Image]                           │             │
│  │                                    │             │
│  │  Outerwear: Navy Blazer            │             │
│  │  [Image]                           │             │
│  │                                    │             │
│  │  Shoes: Brown Oxfords              │             │
│  │  [Image]                           │             │
│  └───────────────────────────────────┘             │
│                                                      │
│  Suggested Additions:                               │
│  [+ Belt] [+ Watch] [+ Tie]                        │
│                                                      │
│  Outfit Name: [_____________________]               │
│  Event/Notes: [_____________________]               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Technical Architecture

### Frontend (Client-Side Rendering)
- **Vanilla JavaScript** with ES6 modules
- **CSS Modules** for component styling
- **Single Page Application** with client-side routing
- **Responsive Design** for mobile/tablet/desktop

### Backend
- **Node.js** with Express.js
- **MongoDB** with native driver (no Mongoose)
- **RESTful API** design
- **Environment variables** for configuration

### Database Collections
1. **Items Collection**
   - 1000+ pre-populated clothing items
   - Fields: name, category, color, size, brand, weather_suitable, occasions, image_url, created_at, updated_at

2. **Outfits Collection**
   - User-created outfit combinations
   - Fields: user_id, name, items[], occasion, weather_conditions, worn_dates[], notes, created_at

### Security
- Environment variables for MongoDB credentials
- Input validation and sanitization
- CORS configuration
- No exposed secrets in client code