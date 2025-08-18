const mongoose = require('mongoose');
const csv = require('csvtojson');
require('dotenv').config(); // Add this line at the top if using .env
// 🛠️ Adjust the path below to your actual product model file
const { Product } = require('./model/Product');

// Replace with your actual connection string
const mongoURI = 'mongodb://localhost:27017/ecomart'; // or your Atlas URI

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

async function importCSV() {
  try {
    // Clear existing products
    await Product.deleteMany({});

    const products = await csv().fromFile('./data.csv');

    const formatted = products.map(row => ({
      product_id: row.product_id,
      title: row.name || row.title,
      imgUrl: row.image_url || row.imgUrl,
      productURL: row.productURL || '',
      stars: row.stars ? Number(row.stars) : 0,
      price: parseFloat(row.price),
      isBestSeller: row.isBestSeller === 'true' || false,
      category_name: row.category || row.category_name,
      Material: row.material || row.Material,
      short_description: row.short_description || row.description,
      brand: row.brand,
      dimensions: row.dimensions,
      weight: row.weight,
      seller_name: row.seller || row.seller_name,
      seller_address: row.seller_address,
      rating: row.rating ? Number(row.rating) : 0,
      rating_count: row.rating_count ? Number(row.rating_count) : 0,
      Carbon_Footprint_kgCO2e: row.Carbon_Footprint_kgCO2e ? Number(row.Carbon_Footprint_kgCO2e) : 0,
      Water_Usage_Litres: row.Water_Usage_Litres ? Number(row.Water_Usage_Litres) : 0,
      Eco_Rating: row.Eco_Rating || '',
      Water_Rating: row.Water_Rating || '',

      
    }));

    await Product.insertMany(formatted);
    console.log('🎉 Products imported successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Import failed:', err);
  }
}

importCSV();

// checkProducts.js
mongoose.connect('mongodb://localhost:27017/ecomart', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const products = await Product.find();
    console.log(products);
    process.exit();
  });
