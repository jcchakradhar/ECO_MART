const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  product_id: { type: String, unique: true }, // new
  title: { type: String, required: true},
  description: { type: String, required: true },
  price: { type: Number, min: [1, 'wrong min price'], max: [10000, 'wrong max price'] },
  discountPercentage: { type: Number, min: [0, 'wrong min discount'], max: [99, 'wrong max discount'], default: 0 },
  rating: { type: Number, min: [0, 'wrong min rating'], max: [5, 'wrong max rating'], default: 0 },
  stock: { type: Number, min: [0, 'wrong min stock'], default: 0 },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, required: true },
  images: { type: [String], required: true },
  colors: { type: [Schema.Types.Mixed] },
  sizes: { type: [Schema.Types.Mixed] },
  highlights: { type: [String] },
  discountPrice: { type: Number },
  deleted: { type: Boolean, default: false },

  // ✅ New Fields from CSV
  dimensions: { type: String },
  material: { type: String },
  seller: { type: String },
  seller_address: { type: String }
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
