const User = require('../models/User');
const Product = require('../models/Product');

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(req.body.productId)) {
      user.wishlist.push(req.body.productId);
      await user.save();
    }
    const populated = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: populated.wishlist });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    const populated = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: populated.wishlist });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
