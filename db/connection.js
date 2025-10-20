// db/connection.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylesmart';
const client = new MongoClient(uri);

let db = null;

export async function connectDB() {
  try {
    if (db) return db;
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    db = client.db('stylesmart_wardrobe');
    
    // Create indexes for better performance
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    const itemsCollection = db.collection('items');
    const outfitsCollection = db.collection('outfits');
    
    // Create indexes for items collection
    await itemsCollection.createIndex({ name: 'text', brand: 'text' });
    await itemsCollection.createIndex({ category: 1 });
    await itemsCollection.createIndex({ 'weather_suitable.min_temp': 1 });
    await itemsCollection.createIndex({ 'weather_suitable.max_temp': 1 });
    await itemsCollection.createIndex({ occasions: 1 });
    await itemsCollection.createIndex({ color: 1 });
    await itemsCollection.createIndex({ created_at: -1 });
    
    // Create indexes for outfits collection
    await outfitsCollection.createIndex({ user_id: 1 });
    await outfitsCollection.createIndex({ created_at: -1 });
    await outfitsCollection.createIndex({ 'worn_dates': -1 });
    
    console.log('Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

export async function getDB() {
  if (!db) {
    await connectDB();
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    console.log('MongoDB connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});