require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./model/User');
const { Brand } = require('./model/Brand');
const { Category } = require('./model/Category');
const { Product } = require('./model/Product');
const { Cart } = require('./model/Cart');
const { Order } = require('./model/Order');

const MONGO_URI = process.env.MONGODB_URL;

async function init() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.create({
      email: 'test@eco.com',
      password: Buffer.from('securepass'),
      name: 'Eco Tester',
    });

    const brand = await Brand.create({ label: 'EcoBrand', value: 'eco-brand' });
    const category = await Category.create({ label: 'Furniture', value: 'furniture' });

    const product = await Product.create({
      title: 'Test Chair',
      description: 'Eco-friendly chair',
      price: 100,
      discountPercentage: 0,
      stock: 10,
      brand: 'EcoBrand',
      category: 'furniture',
      thumbnail: 'https://example.com/image.png',
      images: ['https://example.com/image.png'],
    });

    await Cart.create({
      quantity: 1,
      product: product._id,
      user: user._id,
      size: 'M',
      color: 'Brown'
    });

    await Order.create({
      user: user._id,
      items: [],
      paymentMethod: 'card',
      selectedAddress: { line: '123 Green Street', city: 'Delhi' },
    });

    console.log('✅ All collections initialized.');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

init();
