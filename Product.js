const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: [0, 'El precio no puede ser negativo'] },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, min: [0, 'El stock no puede ser negativo'] },
  status: { type: Boolean, default: true },
  category: { type: String, required: true },
  thumbnails: [String]
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);