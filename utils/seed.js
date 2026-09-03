require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Category.deleteMany(), Collection.deleteMany(), Product.deleteMany(), Coupon.deleteMany(), Review.deleteMany()]);

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'BagsWaves',
    email: process.env.ADMIN_EMAIL || 'admin@bagswaves.com',
    password: process.env.ADMIN_PASSWORD || 'AdminBagsWaves2026!',
    role: 'admin',
    isEmailVerified: true
  });

  const customers = await User.insertMany([
    { firstName: 'Sophia', lastName: 'Laurent', email: 'sophia@example.com', password: 'password123', role: 'customer' },
    { firstName: 'Isabella', lastName: 'Moreau', email: 'isabella@example.com', password: 'password123', role: 'customer' },
    { firstName: 'Olivia', lastName: 'Chen', email: 'olivia@example.com', password: 'password123', role: 'customer' }
  ]);

  const categories = await Category.insertMany([
    { name: 'Top Handle', slug: 'top-handle', description: 'Elegant top handle silhouettes', order: 1 },
    { name: 'Shoulder Bags', slug: 'shoulder-bags', description: 'Refined shoulder bags for everyday luxury', order: 2 },
    { name: 'Tote Bags', slug: 'tote-bags', description: 'Spacious and sophisticated totes', order: 3 },
    { name: 'Mini Bags', slug: 'mini-bags', description: 'Compact elegance', order: 4 },
    { name: 'Evening Bags', slug: 'evening-bags', description: 'After dark sophistication', order: 5 }
  ]);

  const collections = await Collection.insertMany([
    { name: 'The Icon Edit', slug: 'the-icon-edit', description: 'Timeless silhouettes designed for modern luxury.', headline: 'TIMELESS. ICONIC. YOURS.', isFeatured: true, order: 1 },
    { name: 'The New Classics', slug: 'the-new-classics', description: 'Pieces made to be remembered.', headline: 'MADE TO BE REMEMBERED.', isFeatured: true, order: 2 },
    { name: 'Evening Edit', slug: 'evening-edit', description: 'Elegance after dark.', headline: 'ELEGANCE AFTER DARK.', isFeatured: true, order: 3 },
    { name: 'Signature Collection', slug: 'signature-collection', description: 'Carry your story.', headline: 'CARRY YOUR STORY.', isFeatured: true, order: 4 },
    { name: 'Everyday Luxury', slug: 'everyday-luxury', description: 'Refined pieces for daily life.', order: 5 },
    { name: 'Mini Edit', slug: 'mini-edit', description: 'Petite perfection.', order: 6 }
  ]);

  const productData = [
    { name: 'Aurelia Top Handle', price: 1280, salePrice: null, category: categories[0]._id, collections: [collections[0]._id], isBestseller: true, isNewArrival: true, materials: ['Italian Calf Leather'], shortDescription: 'A structured top handle with timeless proportions.' },
    { name: 'Milano Mini', price: 890, category: categories[3]._id, collections: [collections[5]._id], isNewArrival: true, materials: ['Smooth Leather'], shortDescription: 'Compact elegance in a refined silhouette.' },
    { name: 'Élan Shoulder Bag', price: 1450, category: categories[1]._id, collections: [collections[1]._id], isBestseller: true, materials: ['Grained Calfskin'], shortDescription: 'Effortless shoulder carry with architectural lines.' },
    { name: 'Maison Tote', price: 1680, category: categories[2]._id, collections: [collections[4]._id], materials: ['Full-grain Leather'], shortDescription: 'Spacious tote crafted for modern women.' },
    { name: 'Noire Signature', price: 1890, category: categories[0]._id, collections: [collections[3]._id], isBestseller: true, materials: ['Patent Leather'], shortDescription: 'The signature piece of the house.' },
    { name: 'Celeste Mini', price: 780, category: categories[3]._id, collections: [collections[5]._id, collections[0]._id], isNewArrival: true, materials: ['Suede'], shortDescription: 'Petite and luminous.' },
    { name: 'Riviera Carryall', price: 1520, category: categories[2]._id, collections: [collections[4]._id], materials: ['Canvas & Leather'], shortDescription: 'Travel-ready sophistication.' },
    { name: 'Luna Evening Bag', price: 980, category: categories[4]._id, collections: [collections[2]._id], isNewArrival: true, materials: ['Satin & Crystal'], shortDescription: 'Evening elegance redefined.' },
    { name: 'Vesper Frame Bag', price: 1120, category: categories[4]._id, collections: [collections[2]._id], materials: ['Velvet'], shortDescription: 'A structured frame for after-dark moments.' },
    { name: 'Sienna Crossbody', price: 950, category: categories[1]._id, collections: [collections[1]._id], materials: ['Soft Calf'], shortDescription: 'Hands-free luxury.' },
    { name: 'Ophelia Bucket', price: 1190, category: categories[1]._id, collections: [collections[0]._id], isBestseller: true, materials: ['Nappa Leather'], shortDescription: 'Soft volume, refined presence.' },
    { name: 'Athena Structured', price: 1390, category: categories[0]._id, collections: [collections[3]._id], materials: ['Box Calf'], shortDescription: 'Architectural precision.' },
    { name: 'Coral Hobo', price: 1050, category: categories[1]._id, collections: [collections[4]._id], materials: ['Pebbled Leather'], shortDescription: 'Relaxed yet polished.' },
    { name: 'Isis Clutch', price: 720, category: categories[4]._id, collections: [collections[2]._id], materials: ['Metallic Leather'], shortDescription: 'Evening essential.' },
    { name: 'Valentina Tote', price: 1750, category: categories[2]._id, collections: [collections[0]._id], isNewArrival: true, materials: ['Croc-embossed Leather'], shortDescription: 'Statement tote with presence.' },
    { name: 'Solène Mini Top Handle', price: 920, category: categories[0]._id, collections: [collections[5]._id], materials: ['Smooth Leather'], shortDescription: 'Miniature top handle perfection.' },
    { name: 'Camille Shoulder', price: 1280, category: categories[1]._id, collections: [collections[1]._id], isBestseller: true, materials: ['Grained Leather'], shortDescription: 'Everyday elevated.' },
    { name: 'Nocturne Box Bag', price: 1340, category: categories[4]._id, collections: [collections[2]._id], materials: ['Patent Box Calf'], shortDescription: 'Geometric evening form.' },
    { name: 'Elara Shopper', price: 1480, category: categories[2]._id, collections: [collections[4]._id], materials: ['Canvas Leather Trim'], shortDescription: 'Generous and graceful.' },
    { name: 'Aurora Chain Bag', price: 1100, category: categories[1]._id, collections: [collections[0]._id], isNewArrival: true, materials: ['Quilted Leather'], shortDescription: 'Chain detail, soft structure.' }
  ];

  const products = [];
  for (const p of productData) {
    const slug = slugify(p.name);
    products.push(await Product.create({
      ...p,
      slug,
      description: `${p.shortDescription} Crafted with exceptional attention to detail, the ${p.name} embodies the BagsWaves philosophy of timeless elegance and refined craftsmanship. Each piece is designed to become a lasting companion.`,
      images: [
        `https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80`,
        `https://images.unsplash.com/photo-1590874103328-eac38a6749f9?w=800&q=80`,
        `https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80`
      ],
      colors: [
        { name: 'Black', hex: '#0B0A09', stock: 12, images: [] },
        { name: 'Champagne', hex: '#B89A67', stock: 8, images: [] },
        { name: 'Espresso', hex: '#2A211C', stock: 6, images: [] }
      ],
      stock: 26,
      dimensions: { height: '24cm', width: '32cm', depth: '12cm', handleDrop: '10cm' },
      careInstructions: 'Wipe with a soft dry cloth. Avoid prolonged exposure to direct sunlight and moisture. Store in the provided dust bag.',
      sku: 'BW-' + slug.toUpperCase().slice(0, 8),
      isPublished: true,
      averageRating: 4.5 + Math.random() * 0.5,
      numReviews: Math.floor(Math.random() * 20) + 3
    }));
  }

  await Coupon.create([
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrderAmount: 200, usageLimit: 1000, isActive: true },
    { code: 'LUXURY50', type: 'fixed', value: 50, minOrderAmount: 500, isActive: true }
  ]);

  console.log('Seed completed successfully');
  console.log('Admin:', admin.email);
  console.log('Products:', products.length);
  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
