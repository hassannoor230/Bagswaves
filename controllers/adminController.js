const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

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
