const mongoose = require("mongoose");
require("dotenv").config();

const { Category } = require("./model/Category");
const { Brand } = require("./model/Brand");
const { Product } = require("./model/Product");

async function init() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");

    // 1. Get distinct categories & brands
    const categories = await Product.distinct("category");
    const brands = await Product.distinct("brand");

    console.log(`Found ${categories.length} categories and ${brands.length} brands`);

    // 2. Insert categories
    for (const c of categories) {
      if (!c || c.trim() === '') continue; // Skip empty categories
      
      const label = c.trim();
      const value = c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      try {
        await Category.updateOne(
          { value },
          { $setOnInsert: { label, value } },
          { upsert: true }
        );
        console.log(`✅ Category processed: ${label}`);
      } catch (err) {
        console.log(`⚠️ Category '${label}' already exists or error: ${err.message}`);
      }
    }

    // 3. Insert brands
    for (const b of brands) {
      if (!b || b.trim() === '') continue; // Skip empty brands
      
      const label = b.trim();
      const value = b.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      try {
        await Brand.updateOne(
          { value },
          { $setOnInsert: { label, value } },
          { upsert: true }
        );
        console.log(`✅ Brand processed: ${label}`);
      } catch (err) {
        console.log(`⚠️ Brand '${label}' already exists or error: ${err.message}`);
      }
    }

    console.log("✅ Categories and Brands processing completed.");
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("📤 Disconnected from MongoDB");
  }
}

init();
