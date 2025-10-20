// routes/outfits.js
import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';

const router = express.Router();

// GET all outfits
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('outfits');
    
    const { occasion, limit = 20, skip = 0 } = req.query;
    
    const query = {};
    if (occasion) query.occasion = occasion;
    
    const outfits = await collection
      .find(query)
      .sort({ created_at: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    
    // Populate item details
    const itemsCollection = db.collection('items');
    for (const outfit of outfits) {
      if (outfit.items && outfit.items.length > 0) {
        const itemDetails = await itemsCollection
          .find({ _id: { $in: outfit.items.map(id => new ObjectId(id)) } })
          .toArray();
        outfit.itemDetails = itemDetails;
      }
    }
    
    res.json(outfits);
  } catch (error) {
    console.error('Error fetching outfits:', error);
    res.status(500).json({ error: 'Failed to fetch outfits' });
  }
});

// GET single outfit by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('outfits');
    
    const outfit = await collection.findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    // Populate item details
    if (outfit.items && outfit.items.length > 0) {
      const itemsCollection = db.collection('items');
      const itemDetails = await itemsCollection
        .find({ _id: { $in: outfit.items.map(id => new ObjectId(id)) } })
        .toArray();
      outfit.itemDetails = itemDetails;
    }
    
    res.json(outfit);
  } catch (error) {
    console.error('Error fetching outfit:', error);
    res.status(500).json({ error: 'Failed to fetch outfit' });
  }
});

// POST create new outfit
router.post('/', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('outfits');
    
    const newOutfit = {
      name: req.body.name,
      items: req.body.items || [],
      occasion: req.body.occasion,
      weather_conditions: req.body.weather_conditions || {},
      notes: req.body.notes || '',
      worn_dates: [],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Validate required fields
    if (!newOutfit.name) {
      return res.status(400).json({ error: 'Outfit name is required' });
    }
    
    if (!newOutfit.items || newOutfit.items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    
    const result = await collection.insertOne(newOutfit);
    
    res.status(201).json({
      ...newOutfit,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Error creating outfit:', error);
    res.status(500).json({ error: 'Failed to create outfit' });
  }
});

// PUT update outfit
router.put('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('outfits');
    
    const { _id, ...updateData } = req.body;
    updateData.updated_at = new Date();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating outfit:', error);
    res.status(500).json({ error: 'Failed to update outfit' });
  }
});

// DELETE outfit
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('outfits');
    
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});

// POST mark outfit as worn
router.post('/:id/worn', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('outfits');
    
    const { date = new Date(), event = '' } = req.body;
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $push: { 
          worn_dates: {
            date: new Date(date),
            event
          }
        },
        $set: {
          last_worn: new Date(date),
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    
    // Update wear count for all items in the outfit
    if (result.items && result.items.length > 0) {
      const itemsCollection = db.collection('items');
      await itemsCollection.updateMany(
        { _id: { $in: result.items.map(id => new ObjectId(id)) } },
        { 
          $inc: { times_worn: 1 },
          $set: { 
            last_worn: new Date(date),
            updated_at: new Date()
          }
        }
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error marking outfit as worn:', error);
    res.status(500).json({ error: 'Failed to update outfit' });
  }
});

// GET outfit suggestions based on weather
router.get('/suggestions/weather', async (req, res) => {
  try {
    const db = await getDB();
    const itemsCollection = db.collection('items');
    
    const { temperature = 70, rainy = false, snowy = false } = req.query;
    const temp = parseInt(temperature);
    
    // Find suitable items for the weather
    const query = {
      'weather_suitable.min_temp': { $lte: temp },
      'weather_suitable.max_temp': { $gte: temp }
    };
    
    if (rainy === 'true') {
      query['weather_suitable.rain_ok'] = true;
    }
    
    if (snowy === 'true') {
      query['weather_suitable.snow_ok'] = true;
    }
    
    const suitableItems = await itemsCollection.find(query).toArray();
    
    // Group items by category
    const itemsByCategory = {};
    suitableItems.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    // Create outfit suggestions
    const suggestions = [];
    
    // Basic outfit combinations
    if (itemsByCategory.tops && itemsByCategory.bottoms) {
      // Random selection for variety
      const topIndex = Math.floor(Math.random() * Math.min(3, itemsByCategory.tops.length));
      const bottomIndex = Math.floor(Math.random() * Math.min(3, itemsByCategory.bottoms.length));
      
      const suggestion = {
        name: `Weather-appropriate outfit for ${temp}°F`,
        items: [
          itemsByCategory.tops[topIndex]._id,
          itemsByCategory.bottoms[bottomIndex]._id
        ],
        itemDetails: [
          itemsByCategory.tops[topIndex],
          itemsByCategory.bottoms[bottomIndex]
        ],
        weather_conditions: { temperature: temp, rainy: rainy === 'true', snowy: snowy === 'true' }
      };
      
      // Add outerwear if needed
      if (temp < 60 && itemsByCategory.outerwear) {
        const outerwearIndex = Math.floor(Math.random() * Math.min(2, itemsByCategory.outerwear.length));
        suggestion.items.push(itemsByCategory.outerwear[outerwearIndex]._id);
        suggestion.itemDetails.push(itemsByCategory.outerwear[outerwearIndex]);
      }
      
      suggestions.push(suggestion);
    }
    
    // Dress option
    if (itemsByCategory.dresses) {
      const dressIndex = Math.floor(Math.random() * Math.min(2, itemsByCategory.dresses.length));
      const dressSuggestion = {
        name: `Dress option for ${temp}°F`,
        items: [itemsByCategory.dresses[dressIndex]._id],
        itemDetails: [itemsByCategory.dresses[dressIndex]],
        weather_conditions: { temperature: temp, rainy: rainy === 'true', snowy: snowy === 'true' }
      };
      
      if (temp < 60 && itemsByCategory.outerwear) {
        const outerwearIndex = Math.floor(Math.random() * Math.min(2, itemsByCategory.outerwear.length));
        dressSuggestion.items.push(itemsByCategory.outerwear[outerwearIndex]._id);
        dressSuggestion.itemDetails.push(itemsByCategory.outerwear[outerwearIndex]);
      }
      
      suggestions.push(dressSuggestion);
    }
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating outfit suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

export default router;