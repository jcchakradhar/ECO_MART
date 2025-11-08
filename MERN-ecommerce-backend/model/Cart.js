const mongoose = require('mongoose');
const { Schema } = mongoose;


const cartSchema = new Schema({
    quantity: { type: Number, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    // denormalized product_id from Product for quick access
    product_id: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    size: { type: Schema.Types.Mixed },
    color: { type: Schema.Types.Mixed },
})

// Keep product_id in sync whenever product ObjectId changes or on creation
cartSchema.pre('save', async function (next) {
    try {
        if (this.isNew || this.isModified('product')) {
            const Product = mongoose.model('Product');
            const prod = await Product.findById(this.product).select('product_id');
            this.product_id = prod ? prod.product_id : undefined;
        }
        next();
    } catch (err) {
        next(err);
    }
});

cartSchema.pre('findOneAndUpdate', async function (next) {
    try {
        const update = this.getUpdate() || {};
        // In case $set is used
        const nextProduct = update.product || (update.$set && update.$set.product);
        if (nextProduct) {
            const Product = mongoose.model('Product');
            const prod = await Product.findById(nextProduct).select('product_id');
            const pid = prod ? prod.product_id : undefined;
            if (update.$set) {
                update.$set.product_id = pid;
            } else {
                update.product_id = pid;
            }
            this.setUpdate(update);
        }
        next();
    } catch (err) {
        next(err);
    }
});

const virtual = cartSchema.virtual('id');
virtual.get(function () {
    return this._id;
})
cartSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
})


exports.Cart = mongoose.model('Cart', cartSchema)