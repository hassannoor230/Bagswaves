const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
    const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment, isApproved: false });
    res.status(201).json({ success: true, review });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true }).populate('user', 'firstName lastName').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.moderateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    if (req.body.isApproved) {
      const stats = await Review.aggregate([
        { $match: { product: review.product, isApproved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (stats[0]) {
        await Product.findByIdAndUpdate(review.product, { averageRating: Math.round(stats[0].avg * 10) / 10, numReviews: stats[0].count });
      }
    }
    res.json({ success: true, review });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
