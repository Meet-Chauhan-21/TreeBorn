const nodemailer = require('nodemailer');

const createTransporter = () => {
  // If SMTP environment variables are configured, use them
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Return null to trigger console logging during local development
  return null;
};

const sendVerificationEmail = async (email, name, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">

<title>Verify Your Email</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    background:#ffffff;
    font-family:Arial,Helvetica,sans-serif;
    color:#222222;
    line-height:1.6;
}

.wrapper{
    width:100%;
    background:#ffffff;
}

.container{
    max-width:700px;
    margin:0 auto;
    padding:40px 25px;
}

.header{
    border-bottom:1px solid #e5e5e5;
    padding-bottom:28px;
}

.logo{
    font-size:28px;
    font-weight:700;
    letter-spacing:3px;
    color:#111111;
}

.title{
    font-size:24px;
    font-weight:600;
    color:#111111;
    margin-top:35px;
    margin-bottom:16px;
}

.text{
    font-size:15px;
    color:#555555;
    margin-bottom:18px;
}

.section{
    padding:30px 0;
    border-bottom:1px solid #ececec;
}

.button{
    display:inline-block;
    background:#111111;
    color:#ffffff !important;
    text-decoration:none;
    padding:13px 28px;
    font-size:14px;
    font-weight:600;
    margin-top:10px;
}

.expiry{
    margin-top:14px;
    font-size:13px;
    color:#666666;
}

.section-title{
    font-size:18px;
    font-weight:600;
    color:#111111;
    margin-bottom:15px;
}

.link-box{
    margin-top:16px;
    padding:14px;
    border:1px solid #e5e5e5;
    background:#fafafa;
    font-size:13px;
    color:#555;
    word-break:break-all;
}

.note{
    margin-top:18px;
    font-size:14px;
    color:#555;
}

.support a{
    color:#111;
    text-decoration:none;
    font-weight:600;
}

.footer{
    padding-top:35px;
    text-align:center;
    font-size:12px;
    color:#888888;
}

@media only screen and (max-width:600px){

.container{
    padding:30px 18px;
}

.logo{
    font-size:24px;
}

.title{
    font-size:21px;
}

}

</style>

</head>

<body>

<div class="wrapper">

<div class="container">

<div class="header">

<div class="logo">
TREEBORN
</div>

</div>

<div class="section">

<div class="title">
Verify Your Email Address
</div>

<p class="text">
Hello <strong>${name}</strong>,
</p>

<p class="text">
Thank you for creating your TREEBORN account.
Please verify your email address to activate your account and complete your registration.
</p>

<a href="${verificationUrl}" target="_blank" class="button">
Verify Email
</a>

<p class="expiry">
This verification link will expire in <strong>24 hours</strong>.
</p>

</div>

<div class="section">

<div class="section-title">
Verification Link
</div>

<p class="text">
If the button above doesn't work, copy and paste the following link into your web browser.
</p>

<div class="link-box">
${verificationUrl}
</div>

</div>

<div class="section">

<div class="section-title">
Security Notice
</div>

<p class="note">
If you did not create a TREEBORN account, you can safely ignore this email. No account will be activated unless the email address is verified.
</p>

</div>

<div class="section support">

<p class="text">
Need assistance? Contact our support team at
<a href="mailto:support@treeborn.shop">support@treeborn.shop</a>.
</p>

</div>

<div class="footer">

© ${new Date().getFullYear()} <strong>TREEBORN</strong><br>

Biological Cellular Restoration Apothecary.

</div>

</div>

</div>

</body>

</html>
`;

  const transporter = createTransporter();

  if (transporter) {
    const fromEmail = process.env.EMAIL_FROM || '"TreeBorn Skincare" <no-reply@treeborn.com>';
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: 'Verify Your Email Address — TREEBORN',
      html: htmlContent,
    });
  } else {
    // Development fallback logs
    console.log('\n==================================================');
    console.log('🌿 [MOCK EMAIL] Verification Email Sent');
    console.log(`👤 Recipient Name: ${name}`);
    console.log(`📧 Recipient Email: ${email}`);
    console.log(`🔗 Verification Link: ${verificationUrl}`);
    console.log('==================================================\n');
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
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Order Confirmation</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    background:#ffffff;
    font-family:Arial,Helvetica,sans-serif;
    color:#222222;
    line-height:1.6;
}

.wrapper{
    width:100%;
    background:#ffffff;
}

.container{
    max-width:700px;
    margin:0 auto;
    padding:40px 25px;
}

.logo{
    font-size:28px;
    font-weight:700;
    letter-spacing:3px;
    color:#111111;
}

.header{
    padding-bottom:28px;
    border-bottom:1px solid #e5e5e5;
}

.title{
    font-size:24px;
    font-weight:600;
    color:#111;
    margin-top:35px;
    margin-bottom:12px;
}

.text{
    font-size:15px;
    color:#555;
}

.section{
    padding:30px 0;
    border-bottom:1px solid #ececec;
}

.section-title{
    font-size:18px;
    font-weight:600;
    color:#111;
    margin-bottom:20px;
}

.info-table{
    width:100%;
    border-collapse:collapse;
}

.info-table td{
    padding:10px 0;
    font-size:14px;
}

.info-table td:first-child{
    color:#666;
}

.info-table td:last-child{
    text-align:right;
    color:#111;
    font-weight:600;
}

.items-table{
    width:100%;
    border-collapse:collapse;
}

.items-table th{
    text-align:left;
    font-size:13px;
    color:#666;
    padding:14px 0;
    border-bottom:1px solid #dddddd;
}

.items-table td{
    padding:16px 0;
    font-size:14px;
    border-bottom:1px solid #f2f2f2;
}

.items-table th:nth-child(2),
.items-table td:nth-child(2){
    text-align:center;
}

.items-table th:nth-child(3),
.items-table td:nth-child(3),
.items-table th:nth-child(4),
.items-table td:nth-child(4){
    text-align:right;
}

.totals{
    width:320px;
    margin-left:auto;
    margin-top:25px;
}

.totals table{
    width:100%;
    border-collapse:collapse;
}

.totals td{
    padding:8px 0;
    font-size:14px;
}

.totals td:last-child{
    text-align:right;
}

.grand-total td{
    border-top:1px solid #dddddd;
    padding-top:14px;
    font-size:17px;
    font-weight:bold;
    color:#111;
}

.address{
    font-size:14px;
    color:#555;
    line-height:1.9;
}

.address strong{
    color:#111;
}

.support{
    font-size:14px;
    color:#555;
}

.support a{
    color:#111;
    text-decoration:none;
    font-weight:600;
}

.footer{
    padding-top:35px;
    font-size:12px;
    color:#888;
    text-align:center;
}

@media only screen and (max-width:600px){

.container{
    padding:30px 18px;
}

.logo{
    font-size:24px;
}

.title{
    font-size:21px;
}

.totals{
    width:100%;
}

}
</style>

</head>

<body>

<div class="wrapper">

<div class="container">

<div class="header">
<div class="logo">TREEBORN</div>
</div>

<div class="section">

<div class="title">Order Confirmed</div>

<p class="text">
Hello <strong>${order.shippingAddress?.name || ""}</strong>,
</p>

<br>

<p class="text">
Thank you for shopping with TREEBORN.
Your order has been successfully placed and is currently being processed.
We'll notify you again once your order has been shipped.
</p>

</div>

<div class="section">

<div class="section-title">Order Information</div>

<table class="info-table">

<tr>
<td>Order Number</td>
<td>#${order.orderNumber}</td>
</tr>

<tr>
<td>Payment Method</td>
<td>${order.payment?.method === "razorpay"
      ? "Razorpay"
      : order.payment?.method === "card"
        ? "Online Card"
        : "Cash on Delivery"
    }</td>
</tr>

<tr>
<td>Payment Status</td>
<td>${(order.payment?.status || "Paid").toUpperCase()}</td>
</tr>

<tr>
<td>Transaction ID</td>
<td>${order.payment?.transactionId || order.payment?.razorpayPaymentId || "N/A"}</td>
</tr>

<tr>
<td>Order Date</td>
<td>${order.payment?.paidAt
      ? new Date(order.payment.paidAt).toLocaleString()
      : new Date().toLocaleString()
    }</td>
</tr>

</table>

</div>

<div class="section">

<div class="section-title">Items Ordered</div>

<table class="items-table">

<thead>

<tr>

<th>Item</th>

<th>Qty</th>

<th>Price</th>

<th>Total</th>

</tr>

</thead>

<tbody>

${itemsHtml}

</tbody>

</table>

<div class="totals">

<table>

<tr>
<td>Subtotal</td>
<td>₹${(order.totals?.subtotal || 0).toFixed(2)}</td>
</tr>

<tr>
<td>Shipping</td>
<td>₹${(order.totals?.shipping || 0).toFixed(2)}</td>
</tr>

<tr>
<td>Tax</td>
<td>₹${(order.totals?.tax || 0).toFixed(2)}</td>
</tr>

<tr class="grand-total">
<td>Total</td>
<td>₹${(order.totals?.total || 0).toFixed(2)}</td>
</tr>

</table>

</div>

</div>

<div class="section">

<div class="section-title">Shipping Address</div>

<div class="address">

<strong>${order.shippingAddress?.name || ""}</strong><br>

${order.shippingAddress?.street || ""}<br>

${order.shippingAddress?.district || ""}, ${order.shippingAddress?.state || ""}<br>

${order.shippingAddress?.country || ""} - ${order.shippingAddress?.zip || ""}<br>

Phone: ${order.shippingAddress?.phone || ""}

</div>

</div>

<div class="section">

<p class="support">

If you have any questions regarding your order, please contact us at

<a href="mailto:support@treeborn.shop">support@treeborn.shop</a>

and include your order number in your message.

</p>

</div>

<div class="footer">

© ${new Date().getFullYear()} <strong>TREEBORN</strong><br>

Biological Cellular Restoration Apothecary.

</div>

</div>

</div>

</body>

</html>
`;

  const transporter = createTransporter();
  if (transporter) {
    const fromEmail = process.env.EMAIL_FROM || '"TreeBorn Skincare" <no-reply@treeborn.com>';
    await transporter.sendMail({
      from: fromEmail,
      to: userEmail,
      subject: `Order Confirmation #${order.orderNumber} — TREEBORN`,
      html: htmlContent
    });
  } else {
    console.log('\n==================================================');
    console.log('🌿 [MOCK EMAIL] Customer Order Confirmation Email');
    console.log(`📧 Recipient: ${userEmail}`);
    console.log(`📦 Order Number: #${order.orderNumber}`);
    console.log(`💳 Payment Status: ${order.payment?.status}`);
    console.log(`💵 Total Amount: ₹${order.totals?.total}`);
    console.log('==================================================\n');
  }
  return true;
};

const sendAdminNewOrderEmail = async (order, adminEmail) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">

<title>New Paid Order - TREEBORN Admin</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    background:#ffffff;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
    line-height:1.6;
}

.wrapper{
    width:100%;
    background:#ffffff;
}

.container{
    max-width:700px;
    margin:0 auto;
    padding:40px 25px;
}

.header{
    border-bottom:1px solid #e5e5e5;
    padding-bottom:28px;
}

.logo{
    font-size:28px;
    font-weight:700;
    letter-spacing:3px;
    color:#111;
}

.title{
    font-size:24px;
    font-weight:600;
    color:#111;
    margin-top:35px;
    margin-bottom:12px;
}

.text{
    font-size:15px;
    color:#555;
}

.section{
    padding:30px 0;
    border-bottom:1px solid #ececec;
}

.section-title{
    font-size:18px;
    font-weight:600;
    color:#111;
    margin-bottom:20px;
}

.info-table{
    width:100%;
    border-collapse:collapse;
}

.info-table td{
    padding:10px 0;
    font-size:14px;
    border-bottom:1px solid #f3f3f3;
}

.info-table td:first-child{
    color:#666;
    width:220px;
}

.info-table td:last-child{
    color:#111;
    font-weight:600;
}

.amount{
    font-size:34px;
    font-weight:bold;
    color:#111;
    margin-top:8px;
}

.button{
    display:inline-block;
    margin-top:20px;
    padding:12px 26px;
    background:#111;
    color:#fff !important;
    text-decoration:none;
    font-size:14px;
    font-weight:600;
}

.note{
    margin-top:18px;
    font-size:13px;
    color:#666;
}

.footer{
    padding-top:35px;
    text-align:center;
    font-size:12px;
    color:#888;
}

@media only screen and (max-width:600px){

.container{
    padding:30px 18px;
}

.logo{
    font-size:24px;
}

.title{
    font-size:21px;
}

.info-table td:first-child{
    width:140px;
}

}

</style>

</head>

<body>

<div class="wrapper">

<div class="container">

<div class="header">

<div class="logo">
TREEBORN
</div>

</div>

<div class="section">

<div class="title">
New Paid Order Received
</div>

<p class="text">
A customer has successfully completed an online payment. Please review and process the order for fulfillment.
</p>

</div>

<div class="section">

<div class="section-title">
Amount Received
</div>

<div class="amount">
₹${(order.totals?.total || 0).toFixed(2)}
</div>

</div>

<div class="section">

<div class="section-title">
Order Information
</div>

<table class="info-table">

<tr>
<td>Order Number</td>
<td>#${order.orderNumber}</td>
</tr>

<tr>
<td>Customer</td>
<td>${order.shippingAddress?.name || "N/A"}</td>
</tr>

<tr>
<td>Phone</td>
<td>${order.shippingAddress?.phone || "N/A"}</td>
</tr>

<tr>
<td>Payment Method</td>
<td>${order.payment?.method || "N/A"}</td>
</tr>

<tr>
<td>Payment Status</td>
<td>${(order.payment?.status || "N/A").toUpperCase()}</td>
</tr>

<tr>
<td>Transaction ID</td>
<td>${order.payment?.transactionId || order.payment?.razorpayPaymentId || "N/A"}</td>
</tr>

<tr>
<td>Paid Date</td>
<td>${order.payment?.paidAt
      ? new Date(order.payment.paidAt).toLocaleString()
      : new Date().toLocaleString()}</td>
</tr>

<tr>
<td>Items</td>
<td>${(order.items || []).length}</td>
</tr>

</table>

</div>

<div class="section">

<a
href="${process.env.ADMIN_DASHBOARD_URL || "#"}/orders/${order.orderNumber}"
target="_blank"
class="button">

View Order

</a>

<p class="note">
Open the TreeBorn Admin Dashboard to verify payment, prepare shipment, and complete order fulfillment.
</p>

</div>

<div class="footer">

© ${new Date().getFullYear()} <strong>TREEBORN</strong><br>

Admin Notification System

</div>

</div>

</div>

</body>

</html>
`;

  const transporter = createTransporter();
  if (transporter) {
    const fromEmail = process.env.EMAIL_FROM || '"TreeBorn Admin Alert" <no-reply@treeborn.com>';
    await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `🚨 New Order #${order.orderNumber} Placed — ₹${(order.totals?.total || 0).toFixed(2)}`,
      html: htmlContent
    });
  } else {
    console.log('\n==================================================');
    console.log('🚨 [MOCK EMAIL] Admin New Order Notification');
    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log(`📦 Order Number: #${order.orderNumber}`);
    console.log(`💵 Total Amount: ₹${order.totals?.total}`);
    console.log('==================================================\n');
  }
  return true;
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail
};

