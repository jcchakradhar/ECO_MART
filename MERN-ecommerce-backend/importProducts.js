const mongoose = require('mongoose');
const csv = require('csvtojson');
require('dotenv').config(); // Add this line at the top if using .env
// 🛠️ Adjust the path below to your actual product model file
const { Product } = require('./model/Product');

// 🧠 Replace with your actual MongoDB connection string
const MONGO_URI = process.env.MONGODB_URL; // or your actual DB name

async function importCSV() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const products = await csv().fromFile('./data.csv');

    const formatted = products.map(row => ({
      product_id: row.product_id,
      title: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPercentage: 0,
      rating: 0,
      stock: parseInt(row.stock_quantity),
      brand: row.brand,
      category: row.category,
      thumbnail: row.image_url,
      images: [row.image_url],
      dimensions: row.dimensions,
      material: row.material,
      seller: row.seller,
      seller_address: row.seller_address,
      discountPrice: parseFloat(row.price),
    }));

    await Product.insertMany(formatted);
    console.log('🎉 Products imported successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Import failed:', err);
  }
}

importCSV();
