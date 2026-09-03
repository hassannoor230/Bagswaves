const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendEmail } = require('../services/emailService');

exports.subscribe = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) return res.json({ success: true, message: 'Already subscribed' });
    await NewsletterSubscriber.create({ email });
    try {
      await sendEmail({ to: email, subject: 'Welcome to BagsWaves Newsletter', html: '<p>Thank you for subscribing to BagsWaves. Discover timeless elegance in your inbox.</p>' });
    } catch (e) {}
    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
