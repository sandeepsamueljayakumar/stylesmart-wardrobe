// routes/items.js
import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';

const router = express.Router();

// GET all items with filters
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('items');
    
    // Build query from filters
    const query = {};
    const {
      category,
      color,
      minTemp,
      maxTemp,
      occasion,
      search,
      rainOk,
      snowOk,
      lastWorn,
      limit = 20,
      skip = 0
    } = req.query;
    
    if (category) query.category = category;
    if (color) query.color = color;
    if (occasion) query.occasions = { $in: occasion.split(',') };
    
    // Temperature range filter
    if (minTemp || maxTemp) {
      query['weather_suitable.min_temp'] = {};
      query['weather_suitable.max_temp'] = {};
      
      if (minTemp) {
        query['weather_suitable.min_temp'].$lte = parseInt(minTemp);
      }
      if (maxTemp) {
        query['weather_suitable.max_temp'].$gte = parseInt(maxTemp);
      }
    }
    
    if (rainOk === 'true') query['weather_suitable.rain_ok'] = true;
    if (snowOk === 'true') query['weather_suitable.snow_ok'] = true;
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Last worn filter
    if (lastWorn) {
      const date = new Date();
      switch (lastWorn) {
        case 'never':
          query.last_worn = null;
          break;
        case 'week':
          date.setDate(date.getDate() - 7);
          query.last_worn = { $lt: date };
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          query.last_worn = { $lt: date };
          break;
      }
    }
    
    const items = await collection
      .find(query)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    
    const total = await collection.countDocuments(query);
    
    res.json({
      items,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET single item by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('items');
    
    const item = await collection.findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST create new item
router.post('/', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('items');
    
    const newItem = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
      last_worn: null,
      times_worn: 0
    };
    
    // Validate required fields
    if (!newItem.name || !newItem.category) {
      return res.status(400).json({ 
        error: 'Name and category are required' 
      });
    }
    
    const result = await collection.insertOne(newItem);
    
    res.status(201).json({
      ...newItem,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('items');
    
    const { _id, ...updateData } = req.body;
    updateData.updated_at = new Date();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('items');
    
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST mark item as worn
router.post('/:id/worn', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('items');
    
    const { date = new Date(), event = '' } = req.body;
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          last_worn: new Date(date),
          updated_at: new Date()
        },
        $inc: { times_worn: 1 },
        $push: { 
          wear_history: {
            date: new Date(date),
            event
          }
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error marking item as worn:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// GET item statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection('items');
    
    const stats = await collection.aggregate([
      {
        $facet: {
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          byOccasion: [
            { $unwind: '$occasions' },
            { $group: { _id: '$occasions', count: { $sum: 1 } } }
          ],
          byColor: [
            { $group: { _id: '$color', count: { $sum: 1 } } }
          ],
          totalItems: [
            { $count: 'total' }
          ],
          neverWorn: [
            { $match: { last_worn: null } },
            { $count: 'count' }
          ]
        }
      }
    ]).toArray();
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;