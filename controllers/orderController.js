const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendOrderConfirmation } = require('../services/emailService');

const generateOrderNumber = () => 'BW' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, guestEmail } = req.body;
    if (!items || !items.length) return res.status(400).json({ success: false, message: 'No items' });

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ success: false, message: `Product ${item.product} not found` });
      const price = product.salePrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price,
        quantity: item.quantity,
        color: item.color,
        colorHex: item.colorHex
      });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date()) && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) && subtotal >= (coupon.minOrderAmount || 0)) {
        discount = coupon.type === 'percentage' ? (subtotal * coupon.value / 100) : coupon.value;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const shippingCost = subtotal >= 500 ? 0 : 25;
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.round((subtotal - discount + shippingCost + tax) * 100) / 100;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user?._id,
      guestEmail,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid',
      orderStatus: 'Confirmed',
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode,
      total,
      paidAt: new Date()
    });

    try { await sendOrderConfirmation(order, req.user); } catch (e) { console.error(e); }

    res.status(201).json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, orders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role !== 'admin' && order.user?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'firstName lastName email').sort('-createdAt').limit(100);
    res.json({ success: true, orders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus, paymentStatus: req.body.paymentStatus }, { new: true });
    res.json({ success: true, order });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
