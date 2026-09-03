const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.SMTP_HOST) {
    // Development fallback - log emails
    return {
      sendMail: async (options) => {
        console.log('=== EMAIL (DEV MODE) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Content:', options.html || options.text);
        console.log('========================');
        return { messageId: 'dev-mode' };
      }
    };
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"BagsWaves" <hello@bagswaves.com>',
    to,
    subject,
    html,
    text
  };
  return await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2A211C;">
      <h1 style="font-weight: 300; letter-spacing: 2px;">WELCOME TO BAGSWAVES</h1>
      <p>Dear ${user.firstName},</p>
      <p>Thank you for joining BagsWaves. We are delighted to have you as part of our community of women who appreciate timeless elegance and refined craftsmanship.</p>
      <p>Discover our latest collections and carry something unforgettable.</p>
      <p style="margin-top: 40px;">With elegance,<br>The BagsWaves Team</p>
    </div>
  `;
  await sendEmail({ to: user.email, subject: 'Welcome to BagsWaves', html });
};

const sendOrderConfirmation = async (order, user) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0;">${item.name} ${item.color ? `(${item.color})` : ''}</td>
      <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 0; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2A211C;">
      <h1 style="font-weight: 300; letter-spacing: 2px;">ORDER CONFIRMED</h1>
      <p>Dear ${user?.firstName || order.shippingAddress?.fullName || 'Valued Customer'},</p>
      <p>Thank you for your order. We are preparing your pieces with the utmost care.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 1px solid #EDE5DA;">
            <th style="text-align: left; padding: 8px 0;">Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="text-align: right;"><strong>Total: $${order.total.toFixed(2)}</strong></p>
      <p style="margin-top: 40px;">With elegance,<br>The BagsWaves Team</p>
    </div>
  `;
  const email = user?.email || order.guestEmail;
  if (email) await sendEmail({ to: email, subject: `Order Confirmed – ${order.orderNumber}`, html });
};

const sendAdminOrderNotification = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0;">${item.name} ${item.color ? `(${item.color})` : ''}</td>
      <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 0; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2A211C;">
      <h1 style="font-weight: 300; letter-spacing: 2px;">NEW ORDER RECEIVED</h1>
      <p>A new order has been placed on BagsWaves.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.user ? order.user.firstName + ' ' + order.user.lastName : order.guestEmail || 'Guest'}</p>
      <p><strong>Email:</strong> ${order.user?.email || order.guestEmail || 'N/A'}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 1px solid #EDE5DA;">
            <th style="text-align: left; padding: 8px 0;">Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="margin-top: 40px;">With elegance,<br>The BagsWaves Team</p>
    </div>
  `;

  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'hassannoor2309@gmail.com',
    subject: `New Order ${order.orderNumber} – Action Required`,
    html
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendOrderConfirmation, sendAdminOrderNotification };
