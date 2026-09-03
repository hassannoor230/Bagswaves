const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendAdminOrderNotification, sendEmail } = require('../services/emailService');

exports.getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalCustomers, totalProducts, recentOrders, revenue] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.find().sort('-createdAt').limit(5).populate('user', 'firstName lastName'),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }])
    ]);
    const lowStock = await Product.find({ stock: { $lt: 5 }, isPublished: true }).limit(5);
    res.json({
      success: true,
      stats: {
        totalOrders,
        totalCustomers,
        totalProducts,
        revenue: revenue[0]?.total || 0,
        pendingOrders: await Order.countDocuments({ orderStatus: 'Pending' }),
        lowStock
      },
      recentOrders
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort('-createdAt');
    res.json({ success: true, customers });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort('-createdAt').lean();
    res.json({ success: true, products });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'firstName lastName email').sort('-createdAt');
    res.json({ success: true, orders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const oldStatus = order.orderStatus;
    const newStatus = req.body.orderStatus;
    const paymentStatus = req.body.paymentStatus;

    if (newStatus) order.orderStatus = newStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (newStatus === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    const recipient = order.user?.email || order.guestEmail;
    if (recipient && newStatus && newStatus !== oldStatus) {
      try {
        await sendEmail({
          to: recipient,
          subject: `Order ${order.orderNumber} – Status Updated to ${newStatus}`,
          html: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2A211C;">
            <h1 style="font-weight: 300; letter-spacing: 2px;">ORDER UPDATE</h1>
            <p>Dear ${order.user?.firstName || order.shippingAddress?.fullName || 'Valued Customer'},</p>
            <p>Your order <strong>${order.orderNumber}</strong> status has been updated to <strong>${newStatus}</strong>.</p>
            <p style="margin-top: 40px;">With elegance,<br>The BagsWaves Team</p>
          </div>`
        });
      } catch (e) { console.error('Status email failed', e); }
    }

    res.json({ success: true, order });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
