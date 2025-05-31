import mongoose from 'mongoose';
import csv from 'csvtojson';
import dotenv from 'dotenv';
import Property from '../models/Property';
import path from 'path';

dotenv.config();

const csvFilePath = path.resolve(__dirname, '../../data/db424fd9fb74_1748258398689.csv');

async function importCSV() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    const jsonArray = await csv().fromFile(csvFilePath);

    const formatted = jsonArray.map(item => ({
      propid: item.id,
      title: item.title,
      type: item.type,
      price: Number(item.price),
      state: item.state,
      city: item.city,
      areaSqFt: Number(item.areaSqFt),
      bedrooms: Number(item.bedrooms),
      bathrooms: Number(item.bathrooms),
      amenities: item.amenities?.split('|'),
      furnished: item.furnished === 'true',
      availableFrom: new Date(item.availableFrom),
      listedBy: item.listedBy,
      tags: item.tags?.split('|'),
      colorTheme: item.colorTheme,
      rating: Number(item.rating),
      isVerified: item.isVerified === 'true',
      listingType: item.listingType,
      createdBy: null 
    }));

    await Property.insertMany(formatted);
    console.log('✅ CSV data imported successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing CSV:', err);
    process.exit(1);
  }
}

importCSV();
