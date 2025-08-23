const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true },
  role: { type: String, required: true, default: 'user' },
  addresses: { type: [Schema.Types.Mixed] },
  // for addresses, we can make a separate Schema like orders. but in this case we are fine
  name: { type: String },
  salt: Buffer,
  resetPasswordToken: { type: String, default: '' },
  // store all search queries as strings per user
  searchHistory: { type: [String], default: [] },
  // new sustainability fields
  purchase_history: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
  weights: {
    carbon: { type: Number, default: 0.4 },
    water: { type: Number, default: 0.3 },
    rating: { type: Number, default: 0.3 },
  },
  price_tolerance: { type: Number, default: 0.2 },
  eco_score: { type: Number, default: 0 },
  water_score: { type: Number, default: 0 },
  carbon_saved: { type: Number, default: 0 },
  water_saved: { type: Number, default: 0 },
}, { timestamps: true });

const virtual = userSchema.virtual('id');
virtual.get(function () {
  return this._id;
});
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.User = mongoose.model('User', userSchema);
