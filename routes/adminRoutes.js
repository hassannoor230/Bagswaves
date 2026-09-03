const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
router.get('/dashboard', protect, admin, ctrl.getDashboard);
router.get('/customers', protect, admin, ctrl.getCustomers);
module.exports = router;
