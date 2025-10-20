// scripts/seedDatabase.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylesmart';

// Sample data for generating items
const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
const colors = ['black', 'white', 'gray', 'navy', 'blue', 'red', 'green', 'brown', 'beige', 'pink', 'yellow', 'purple'];
const occasions = ['work', 'casual', 'formal', 'athletic', 'date', 'party'];
const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Levis', 'Ralph Lauren', 'Calvin Klein', 'Tommy Hilfiger', 'J.Crew', 'Banana Republic'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const itemNames = {
  tops: ['T-Shirt', 'Button-Up Shirt', 'Polo Shirt', 'Tank Top', 'Blouse', 'Sweater', 'Hoodie', 'Cardigan'],
  bottoms: ['Jeans', 'Chinos', 'Shorts', 'Dress Pants', 'Leggings', 'Sweatpants', 'Cargo Pants', 'Skirt'],
  dresses: ['Casual Dress', 'Cocktail Dress', 'Maxi Dress', 'Midi Dress', 'Sundress', 'Evening Gown', 'Shift Dress', 'Wrap Dress'],
  outerwear: ['Jacket', 'Blazer', 'Coat', 'Parka', 'Windbreaker', 'Vest', 'Raincoat', 'Bomber Jacket'],
  shoes: ['Sneakers', 'Dress Shoes', 'Boots', 'Sandals', 'Loafers', 'High Heels', 'Flats', 'Running Shoes'],
  accessories: ['Belt', 'Scarf', 'Hat', 'Watch', 'Tie', 'Sunglasses', 'Bag', 'Jewelry']
};

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements(arr, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const result = [];
  for (let i = 0; i < count; i++) {
    const elem = randomElement(arr);
    if (!result.includes(elem)) {
      result.push(elem);
    }
  }
  return result;
}

function generateItem(index) {
  const category = randomElement(categories);
  const itemNameList = itemNames[category];
  const name = randomElement(itemNameList);
  const brand = randomElement(brands);
  const color = randomElement(colors);
  
  // Generate temperature range
  const minTemp = Math.floor(Math.random() * 50) + 20; // 20-70
  const maxTemp = Math.min(minTemp + Math.floor(Math.random() * 40) + 10, 100); // min+10 to 100
  
  // Determine weather suitability based on category
  const rainOk = category === 'outerwear' ? Math.random() > 0.3 : Math.random() > 0.7;
  const snowOk = category === 'outerwear' ? Math.random() > 0.5 : Math.random() > 0.8;
  
  // Generate occasions based on item type
  let itemOccasions;
  if (name.toLowerCase().includes('dress pants') || name.toLowerCase().includes('blazer')) {
    itemOccasions = ['work', 'formal'];
  } else if (name.toLowerCase().includes('sneakers') || name.toLowerCase().includes('hoodie')) {
    itemOccasions = ['casual', 'athletic'];
  } else {
    itemOccasions = randomElements(occasions);
  }
  
  // Simulate wear history
  const timesWorn = Math.floor(Math.random() * 50);
  const lastWorn = timesWorn > 0 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) : null;
  
  return {
    name: `${brand} ${color.charAt(0).toUpperCase() + color.slice(1)} ${name}`,
    category,
    color,
    brand,
    size: randomElement(sizes),
    weather_suitable: {
      min_temp: minTemp,
      max_temp: maxTemp,
      rain_ok: rainOk,
      snow_ok: snowOk
    },
    occasions: itemOccasions,
    image_url: `https://via.placeholder.com/300x400?text=${encodeURIComponent(name)}`,
    times_worn: timesWorn,
    last_worn: lastWorn,
    wear_history: [],
    notes: timesWorn > 30 ? 'Favorite item!' : '',
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updated_at: new Date()
  };
}

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    const db = client.db('stylesmart_wardrobe');
    const itemsCollection = db.collection('items');
    const outfitsCollection = db.collection('outfits');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await itemsCollection.deleteMany({});
    await outfitsCollection.deleteMany({});
    
    // Generate items
    console.log('Generating 1200 items...');
    const items = [];
    for (let i = 0; i < 1200; i++) {
      items.push(generateItem(i));
    }
    
    // Insert items
    console.log('Inserting items into database...');
    const insertResult = await itemsCollection.insertMany(items);
    console.log(`Successfully inserted ${insertResult.insertedCount} items`);
    
    // Create sample outfits
    console.log('Creating sample outfits...');
    const sampleOutfits = [
      {
        name: 'Business Casual Monday',
        items: items.slice(0, 4).map(item => item._id),
        occasion: 'work',
        weather_conditions: { temperature: 65, rainy: false },
        worn_dates: [new Date('2024-03-01'), new Date('2024-03-08')],
        notes: 'Perfect for client meetings',
        created_at: new Date('2024-02-15'),
        updated_at: new Date()
      },
      {
        name: 'Weekend Casual',
        items: items.slice(10, 14).map(item => item._id),
        occasion: 'casual',
        weather_conditions: { temperature: 72, rainy: false },
        worn_dates: [new Date('2024-03-02')],
        notes: 'Comfortable for errands',
        created_at: new Date('2024-02-20'),
        updated_at: new Date()
      },
      {
        name: 'Date Night Special',
        items: items.slice(20, 24).map(item => item._id),
        occasion: 'date',
        weather_conditions: { temperature: 68, rainy: false },
        worn_dates: [new Date('2024-02-14')],
        notes: 'Elegant but not overdressed',
        created_at: new Date('2024-02-10'),
        updated_at: new Date()
      }
    ];
    
    await outfitsCollection.insertMany(sampleOutfits);
    console.log('Sample outfits created');
    
    // Create indexes
    console.log('Creating indexes...');
    await itemsCollection.createIndex({ name: 'text', brand: 'text' });
    await itemsCollection.createIndex({ category: 1 });
    await itemsCollection.createIndex({ 'weather_suitable.min_temp': 1 });
    await itemsCollection.createIndex({ 'weather_suitable.max_temp': 1 });
    await itemsCollection.createIndex({ occasions: 1 });
    await itemsCollection.createIndex({ color: 1 });
    await itemsCollection.createIndex({ created_at: -1 });
    
    await outfitsCollection.createIndex({ created_at: -1 });
    await outfitsCollection.createIndex({ occasion: 1 });
    
    console.log('✅ Database seeded successfully!');
    console.log(`   - ${insertResult.insertedCount} items created`);
    console.log(`   - ${sampleOutfits.length} sample outfits created`);
    console.log('   - Indexes created');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

// Run the seed script
seedDatabase();