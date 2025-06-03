import express from 'express';
import type { Request, Response, ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Property from './models/Property';
import User from './models/User';
import { protect } from './middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { Document } from 'mongoose';
// import redisClient from './config/redis';

// Initialize environment variables
dotenv.config();

// Validate environment variables
const validateEnv = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined');
  }
};
validateEnv();

// Connect to database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  next();
});


// Interfaces
interface UserDocument extends Document {
  email: string;
  password: string;
  _id: string;
}

interface PropertyDocument extends Document {
  createdBy?: string;
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
};

app.get('/',(req,res)=>{
  res.send("Hey Hi👋👋👋👋  Server is running great!  Check '/api/properties' to get all properties");
})


/** Auth Routes */
app.post('/api/register', async (req: Request, res: Response):Promise<void> => {
  const { email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = new User({ email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: 'User registration failed', error: err });
  }
});

app.post('/api/login', async (req: Request, res: Response):Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }) as UserDocument;
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;    
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
  }
});


/** Property Routes */
app.post('/api/properties', protect, async (req: Request, res: Response):Promise<void> => {
  console.log('Creating property with body:', req.body);
  
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const property = new Property({ ...req.body, createdBy: req.user.id });
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ message: 'Create property failed', error: err });
  }
});

app.get('/api/properties', async (req: Request, res: Response):Promise<void> => {
  try {
    const filters = req.query;
    const properties = await Property.find(filters);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch properties', error: err });
  }
});

app.get('/api/properties/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch property', error: err });
  }
});

app.put('/api/properties/:id', protect, async (req: Request, res: Response):Promise<void> => {
  try {
    const property = await Property.findById(req.params.id) as PropertyDocument;
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (!req.user || property.createdBy?.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProperty);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err });
  }
});

app.delete('/api/properties/:id', protect, async (req: Request, res: Response):Promise<void> => {
  try {
    const property = await Property.findById(req.params.id) as PropertyDocument;
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (!req.user || property.createdBy?.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await Property.deleteOne({ _id: req.params.id });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err });
  }
});


/** Advance Filteration Routes */
app.get('/api/filter', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: any = {};
  console.log('Query parameters:', req.query);
    // Example of numeric filters (price, bedrooms, bathrooms, rating)
  if ('minPrice' in req.query) {
    filters.price = filters.price || {};
    console.log('Min Price:', req.query.minPrice);
    filters.price.$gte = Number(req.query.minPrice);
    console.log('Filters after minPrice:', filters);
  }

    if (req.query.maxPrice) {
      filters.price = filters.price || {};
      console.log('Max Price:', req.query.maxPrice);
      filters.price.$lte = Number(req.query.maxPrice);
      console.log('Filters after maxPrice:', filters);
    }
    if (req.query.bedrooms) filters.bedrooms = Number(req.query.bedrooms);
    if (req.query.bathrooms) filters.bathrooms = Number(req.query.bathrooms);
    if (req.query.rating) filters.rating = { $gte: Number(req.query.rating) };

    // Example of exact matches (type, state, city, furnished)
    if (req.query.type) filters.type = req.query.type;
    if (req.query.state) filters.state = req.query.state;
    if (req.query.city) filters.city = req.query.city;
    if (req.query.furnished) filters.furnished = req.query.furnished === 'true';

    if (req.query.amenities) {
      console.log('Amenities:', req.query.amenities);
      const amenitiesArr = (req.query.amenities as string).split(',');
      console.log('Amenities Array:', amenitiesArr);
      filters.amenities = { $in: amenitiesArr };  // change $all to $in
    }
    if (req.query.tags) {
      const tagsArr = (req.query.tags as string).split(',');
      filters.tags = { $in: tagsArr };            // change $all to $in
    }

    // const cacheKey = `properties:${JSON.stringify(filters)}`;

    // // Try to get from Redis
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   console.log('⚡ Serving from cache');
    //   res.json(JSON.parse(cached));
    //   return;
    // }

    const properties = await Property.find(filters);
    // await redisClient.set(cacheKey, JSON.stringify(properties), {
    //   EX: 60000,
    // });

    console.log('✅ Fetched from DB and cached');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch properties', error: err });
  }
});


/** Favorite Routes */
app.post('/api/favorites/:propertyId', protect, async (req: Request, res: Response):Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const propertyId = req.params.propertyId;
    const mongoose = require('mongoose');
    const propertyObjectId = new mongoose.Types.ObjectId(propertyId);

    if (!user.favorites.some((fav: any) => fav.equals(propertyObjectId))) {
      user.favorites.push(propertyObjectId);
      await user.save();
    }

    res.status(200).json({ message: 'Property added to favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add favorite', error: err });
  }
});

app.get('/api/favorites', protect, async (req: Request, res: Response):Promise<void>  => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const user = await User.findById(req.user.id).populate('favorites');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch favorites', error: err });
  }
});

app.delete('/api/favorites/:propertyId', protect, async (req: Request, res: Response):Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== req.params.propertyId
    );

    await user.save();

    res.status(200).json({ message: 'Property removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove favorite', error: err });
  }
});



/** Recommendation Routes */
app.get('/api/users/search', protect, async (req: Request, res: Response):Promise<void> => {
  try {
    const { email } = req.query;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ userId: user._id, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err });
  }
});

app.post('/api/recommend/:recipientEmail/:propertyId', protect, async (req: Request, res: Response):Promise<void>  => {
  try {
    const { recipientEmail, propertyId } = req.params;

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      res.status(404).json({ message: 'Recipient not found' });
      return;
    }

    // Check for duplicates
    const alreadyRecommended = recipient.recommendationsReceived.find(
      (r) => r.propertyId === propertyId && req.user && r.fromUser.toString() === req.user.id
    );

    if (alreadyRecommended) {
      res.status(409).json({ message: 'Property already recommended to this user by you.' });
      return;
    }

    // Push recommendation
    if (req.user && req.user.id) {
      const mongoose = require('mongoose');
      recipient.recommendationsReceived.push({
        propertyId,
        fromUser: new mongoose.Types.ObjectId(req.user.id),
      });

      await recipient.save();
    } else {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    res.status(200).json({ message: 'Property recommended successfully' });
  } catch (err: any) {
    console.error('❌ Recommendation error:', err);
    res.status(500).json({
      message: 'Recommendation failed',
      error: err.message || 'Unknown error',
    });
  }
});

app.get('/api/recommendations', protect, async (req: Request, res: Response):Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // const cacheKey = `recommendations:${req.user.id}`;

    // // 1. Try fetching from Redis cache
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   console.log('📦 Cache hit');
    //   res.json(JSON.parse(cachedData));
    //   return;
    // }


    const user = await User.findById(req.user.id).populate({
      path: 'recommendationsReceived.fromUser',
      select: 'email',
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // const recommendations = user.recommendationsReceived;
    // await redisClient.setEx(cacheKey, 6000, JSON.stringify(recommendations)); 

    res.json(user.recommendationsReceived);
  } catch (err: any) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({
      message: 'Failed to fetch recommendations',
      error: err.message,
    });
  }
});



/** Start Server */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));