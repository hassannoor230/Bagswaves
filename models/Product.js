const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  images: [String],
  stock: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
  materials: [String],
  dimensions: {
    height: String,
    width: String,
    depth: String,
    handleDrop: String
  },
  careInstructions: String,
  colors: [colorSchema],
  images: [{ type: String, required: true }],
  stock: { type: Number, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  tags: [String],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  metaTitle: String,
  metaDescription: String
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isPublished: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isBestseller: 1 });
productSchema.index({ isNewArrival: 1 });

module.exports = mongoose.model('Product', productSchema);
