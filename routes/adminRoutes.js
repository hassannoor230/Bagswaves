const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/dashboard', protect, admin, ctrl.getDashboard);
router.get('/customers', protect, admin, ctrl.getCustomers);
router.get('/products', protect, admin, ctrl.getAllProducts);
router.post('/products', protect, admin, ctrl.createProduct);
router.put('/products/:id', protect, admin, ctrl.updateProduct);
router.delete('/products/:id', protect, admin, ctrl.deleteProduct);
router.get('/orders', protect, admin, ctrl.getAllOrders);
router.put('/orders/:id/status', protect, admin, ctrl.updateOrderStatus);
module.exports = router;
