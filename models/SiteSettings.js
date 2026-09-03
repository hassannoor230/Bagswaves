const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'BagsWaves' },
  tagline: { type: String, default: 'Carry something unforgettable.' },
  contactEmail: String,
  contactPhone: String,
  address: String,
  socialLinks: {
    facebook: String,
    pinterest: String,
    tiktok: String
  },
  shippingRates: [{
    name: String,
    price: Number,
    estimatedDays: String
  }],
  freeShippingThreshold: { type: Number, default: 500 },
  taxRate: { type: Number, default: 0.08 },
  currency: { type: String, default: 'USD' },
  heroSlides: [{
    collectionName: String,
    headline: String,
    subheadline: String,
    cta: String,
    ctaLink: String,
    image: String,
    order: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
