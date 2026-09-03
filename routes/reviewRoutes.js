const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');
router.post('/', protect, ctrl.createReview);
router.get('/product/:productId', ctrl.getProductReviews);
router.put('/:id/moderate', protect, admin, ctrl.moderateReview);
module.exports = router;
