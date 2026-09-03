const Collection = require('../models/Collection');

exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true }).sort('order');
    res.json({ success: true, collections });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true });
    if (!collection) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, collection });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.createCollection = async (req, res) => {
  try {
    const collection = await Collection.create(req.body);
    res.status(201).json({ success: true, collection });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, collection });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};
exports.deleteCollection = async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
