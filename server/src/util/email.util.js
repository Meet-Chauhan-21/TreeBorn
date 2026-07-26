const nodemailer = require('nodemailer');
const {
  getVerificationTemplate,
  getOrderConfirmationTemplate,
  getAdminNewOrderTemplate
} = require('./emailTemplates');

const createTransporter = () => {
  // If SMTP service/configurations are provided, use them (such as Brevo)
  if (process.env.SMTP_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: If host is gmail/googlemail, use the built-in gmail service configuration
  if (
    process.env.SMTP_HOST &&
    (process.env.SMTP_HOST.includes('gmail') || process.env.SMTP_HOST.includes('googlemail'))
  ) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    });
  }

  // Generic SMTP transport configuration (e.g. for Brevo SMTP host smtp-relay.brevo.com)
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    const isSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false, // Prevents certificate chain validation failures in production
      },
    });
  }

  return null;
};

const sendVerificationEmail = async (email, name, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
  const currentYear = new Date().getFullYear().toString();

  const htmlContent = getVerificationTemplate(name, verificationUrl, currentYear);

  console.log("📧 sendVerificationEmail called");
  console.log("Recipient:", email);

  const transporter = createTransporter();
  console.log("Transporter exists:", !!transporter);

  try {
    if (transporter) {
      const fromEmail = process.env.EMAIL_FROM || `"TreeBorn Skincare" <${process.env.SMTP_USER}>`;
      const email_info = await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Verify Your Email Address — TREEBORN',
        html: htmlContent,
      });
      console.log("✅ Email Sent:", email_info);
    } else {
      // Development fallback logs
      console.log('\n==================================================');
      console.log('🌿 [MOCK EMAIL] Verification Email Sent');
      console.log(`👤 Recipient Name: ${name}`);
      console.log(`📧 Recipient Email: ${email}`);
      console.log(`🔗 Verification Link: ${verificationUrl}`);
      console.log('==================================================\n');
    }
  } catch (error) {
    console.error("❌ SEND MAIL ERROR");
    console.error(error);
    throw error;
  }

  return true;
};

const sendOrderConfirmationEmail = async (order, userEmail) => {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px;">${item.name} (${item.selectedSize || '50ml'})</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; text-align: right;">₹${(item.price || 0).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; text-align: right; font-weight: bold;">₹${((item.price || 0) * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const paymentMethodMap = {
    razorpay: 'Razorpay',
    card: 'Online Card',
    cod: 'Cash on Delivery',
  };
  const paymentMethod = paymentMethodMap[order.payment?.method] || order.payment?.method || 'Cash on Delivery';
  const paymentStatus = (order.payment?.status || 'Paid').toUpperCase();
  const transactionId = order.payment?.transactionId || order.payment?.razorpayPaymentId || 'N/A';
  const orderDate = order.payment?.paidAt
    ? new Date(order.payment.paidAt).toLocaleString()
    : new Date().toLocaleString();
  const currentYear = new Date().getFullYear().toString();

  const htmlContent = getOrderConfirmationTemplate(
    order,
    itemsHtml,
    paymentMethod,
    paymentStatus,
    transactionId,
    orderDate,
    currentYear
  );

  const transporter = createTransporter();
  try {
    if (transporter) {
      const fromEmail = process.env.EMAIL_FROM || `"TreeBorn Skincare" <${process.env.SMTP_USER}>`;
      await transporter.sendMail({
        from: fromEmail,
        to: userEmail,
        subject: `Order Confirmation #${order.orderNumber} — TREEBORN`,
        html: htmlContent,
      });
      console.log(`✅ Order confirmation email sent to ${userEmail}`);
    } else {
      console.log('\n==================================================');
      console.log('🌿 [MOCK EMAIL] Customer Order Confirmation Email');
      console.log(`📧 Recipient: ${userEmail}`);
      console.log(`📦 Order Number: #${order.orderNumber}`);
      console.log(`💳 Payment Status: ${order.payment?.status}`);
      console.log(`💵 Total Amount: ₹${order.totals?.total}`);
      console.log('==================================================\n');
    }
  } catch (error) {
    console.error("❌ SEND ORDER EMAIL ERROR");
    console.error(error);
    throw error;
  }

  return true;
};

const sendAdminNewOrderEmail = async (order, adminEmail) => {
  const paidDate = order.payment?.paidAt
    ? new Date(order.payment.paidAt).toLocaleString()
    : new Date().toLocaleString();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const adminDashboardUrl = process.env.ADMIN_DASHBOARD_URL || `${clientUrl}/admin`;
  const adminOrderUrl = `${adminDashboardUrl}/orders/${order.orderNumber}`;

  const paymentMethodMap = {
    razorpay: 'Razorpay',
    card: 'Online Card',
    cod: 'Cash on Delivery',
  };
  const paymentMethod = paymentMethodMap[order.payment?.method] || order.payment?.method || 'N/A';
  const paymentStatus = (order.payment?.status || 'N/A').toUpperCase();
  const transactionId = order.payment?.transactionId || order.payment?.razorpayPaymentId || 'N/A';
  const currentYear = new Date().getFullYear().toString();

  const htmlContent = getAdminNewOrderTemplate(
    order,
    paidDate,
    adminOrderUrl,
    paymentMethod,
    paymentStatus,
    transactionId,
    currentYear
  );

  const transporter = createTransporter();
  try {
    if (transporter) {
      const fromEmail = process.env.EMAIL_FROM || `"TreeBorn Skincare" <${process.env.SMTP_USER}>`;
      await transporter.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: `🚨 New Order #${order.orderNumber} Placed — ₹${(order.totals?.total || 0).toFixed(2)}`,
        html: htmlContent,
      });
      console.log(`✅ Admin new order notification email sent to ${adminEmail}`);
    } else {
      console.log('\n==================================================');
      console.log('🚨 [MOCK EMAIL] Admin New Order Notification');
      console.log(`📧 Admin Email: ${adminEmail}`);
      console.log(`📦 Order Number: #${order.orderNumber}`);
      console.log(`💵 Total Amount: ₹${order.totals?.total}`);
      console.log('==================================================\n');
    }
  } catch (error) {
    console.error("❌ SEND ADMIN ORDER EMAIL ERROR");
    console.error(error);
    throw error;
  }

  return true;
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail,
};
