const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  product_id: { type: String, unique: false },
  title: { type: String, required: false },
  imgUrl: { type: String }, // new
  productURL: { type: String }, // new
  stars: { type: Number, default: 0 }, // new
  price: { type: Number, min: [1, 'wrong min price'], max: [10000, 'wrong max price'] },
  isBestSeller: { type: Boolean, default: false }, // new
  category_name: { type: String }, // new
  Material: { type: String }, // new
  short_description: { type: String }, // new
  brand: { type: String },
  dimensions: { type: String },
  weight: { type: String }, // new
  seller_name: { type: String }, // new
  seller_address: { type: String },
  rating: { type: Number, min: [0, 'wrong min rating'], max: [5, 'wrong max rating'], default: 0 },
  rating_count: { type: Number, default: 0 }, // new
  Carbon_Footprint_kgCO2e: { type: Number, default: 0 }, // new
  Water_Usage_Litres: { type: Number, default: 0 }, // new
  Eco_Rating: { type: String, default: '' }, // new
  Water_Rating: { type: String, default: '' }, // new

  // Required by your schema
  thumbnail: { type: String, required: false },
  category: { type: String, required: false },
  description: { type: String, required: false },

  // Keep existing fields if needed
  discountPercentage: { type: Number, min: [0, 'wrong min discount'], max: [99, 'wrong max discount'], default: 0 },
  stock: { type: Number, min: [0, 'wrong min stock'], default: 0 },
  images: { type: [String] },
  colors: { type: [Schema.Types.Mixed] },
  sizes: { type: [Schema.Types.Mixed] },
  highlights: { type: [String] },
  discountPrice: { type: Number },
  deleted: { type: Boolean, default: false }
});

const virtualId = productSchema.virtual('id');
virtualId.get(function () {
  return this._id;
});

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

exports.Product = mongoose.model('Product', productSchema);
