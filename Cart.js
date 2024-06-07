const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true, min: 1 }
});

const cartSchema = new Schema({
  products: [cartItemSchema],
  status: { type: String, default: 'active' },
}, { timestamps: true });

cartSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Cart', cartSchema);