require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./model/Product');
const rawProducts = require('./data.json').products;

// Remove `id` field
const products = rawProducts.map(({ id, ...rest }) => rest);

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    await Product.deleteMany({});
    console.log('Old products removed');

    await Product.insertMany(products);
    console.log('New products inserted');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDB();
