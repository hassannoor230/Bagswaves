const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsletterController');
router.post('/subscribe', ctrl.subscribe);
module.exports = router;
