const getVerificationTemplate = (name, verificationUrl, currentYear) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Verify Your Email</title>
</head>
<body style="background:#ffffff; font-family:Arial,Helvetica,sans-serif; color:#222222; line-height:1.6; margin:0; padding:0; box-sizing:border-box;">
  <div class="wrapper" style="width:100%; background:#ffffff; padding: 20px 0;">
    <div class="container" style="max-width:600px; margin:0 auto; padding:40px 25px; border: 1px solid #eaeaea; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div class="header" style="border-bottom:1px solid #e5e5e5; padding-bottom:20px; text-align: center;">
        <div class="logo" style="font-size:28px; font-weight:700; letter-spacing:3px; color:#111111; font-family:Arial,sans-serif;">
          TREEBORN
        </div>
      </div>
      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="title" style="font-size:22px; font-weight:600; color:#111111; margin-bottom:16px; text-align: center;">
          Verify Your Email Address
        </div>
        <p class="text" style="font-size:15px; color:#555555; margin-bottom:18px; line-height: 1.6;">
          Hello <strong>${name}</strong>,
        </p>
        <p class="text" style="font-size:15px; color:#555555; margin-bottom:24px; line-height: 1.6;">
          Thank you for creating your TREEBORN account. Please verify your email address to activate your account and complete your registration.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" target="_blank" class="button" style="display:inline-block; background:#111111; color:#ffffff !important; text-decoration:none; padding:14px 32px; font-size:14px; font-weight:600; border-radius: 4px; letter-spacing: 1px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            Verify Email
          </a>
        </div>
        <p class="expiry" style="margin-top:20px; font-size:13px; color:#888888; text-align: center;">
          This verification link will expire in <strong>24 hours</strong>.
        </p>
      </div>
      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="section-title" style="font-size:16px; font-weight:600; color:#111111; margin-bottom:12px;">
          Verification Link
        </div>
        <p class="text" style="font-size:14px; color:#666666; margin-bottom:12px;">
          If the button above doesn't work, copy and paste the following link into your web browser:
        </p>
        <div class="link-box" style="padding:14px; border:1px solid #e5e5e5; background:#fafafa; font-size:13px; color:#555555; word-break:break-all; border-radius: 4px; line-height: 1.5;">
          ${verificationUrl}
        </div>
      </div>
      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="section-title" style="font-size:16px; font-weight:600; color:#111111; margin-bottom:12px;">
          Security Notice
        </div>
        <p class="note" style="font-size:13px; color:#777777; line-height: 1.5; margin: 0;">
          If you did not create a TREEBORN account, you can safely ignore this email. No account will be activated unless the email address is verified.
        </p>
      </div>
      <div class="section support" style="padding:20px 0; border-bottom: none; text-align: center;">
        <p class="text" style="font-size:14px; color:#666666; margin: 0;">
          Need assistance? Contact our support team at
          <a href="mailto:support@treeborn.shop" style="color:#111111; text-decoration:none; font-weight:600;">support@treeborn.shop</a>.
        </p>
      </div>
      <div class="footer" style="padding-top:30px; text-align:center; font-size:12px; color:#999999; border-top: 1px solid #eaeaea;">
        © ${currentYear} <strong>TREEBORN</strong><br>
        <span style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; display: inline-block; margin-top: 6px;">Biological Cellular Restoration Apothecary.</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

const getOrderConfirmationTemplate = (order, itemsHtml, paymentMethod, paymentStatus, transactionId, orderDate, currentYear) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Order Confirmation</title>
</head>
<body style="background:#ffffff; font-family:Arial,Helvetica,sans-serif; color:#222222; line-height:1.6; margin:0; padding:0; box-sizing:border-box;">
  <div class="wrapper" style="width:100%; background:#ffffff; padding: 20px 0;">
    <div class="container" style="max-width:600px; margin:0 auto; padding:40px 25px; border: 1px solid #eaeaea; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div class="header" style="border-bottom:1px solid #e5e5e5; padding-bottom:20px; text-align: center;">
        <div class="logo" style="font-size:28px; font-weight:700; letter-spacing:3px; color:#111111; font-family:Arial,sans-serif;">
          TREEBORN
        </div>
      </div>
      
      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="title" style="font-size:22px; font-weight:600; color:#111111; margin-bottom:16px; text-align: center;">
          Order Confirmed
        </div>
        <p class="text" style="font-size:15px; color:#555555; margin-bottom:12px;">
          Hello <strong>${order.shippingAddress?.name || ''}</strong>,
        </p>
        <p class="text" style="font-size:15px; color:#555555; margin-bottom:18px;">
          Thank you for shopping with TREEBORN. Your order has been successfully placed and is currently being processed. We'll notify you again once your order has been shipped.
        </p>
      </div>

      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="section-title" style="font-size:16px; font-weight:600; color:#111111; margin-bottom:15px;">
          Order Information
        </div>
        <table class="info-table" style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0; font-size:14px; color:#666666;">Order Number</td>
            <td style="padding:8px 0; font-size:14px; color:#111111; font-weight:600; text-align:right;">#${order.orderNumber || ''}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-size:14px; color:#666666;">Payment Method</td>
            <td style="padding:8px 0; font-size:14px; color:#111111; font-weight:600; text-align:right;">${paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-size:14px; color:#666666;">Payment Status</td>
            <td style="padding:8px 0; font-size:14px; color:#111111; font-weight:600; text-align:right;">${paymentStatus}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-size:14px; color:#666666;">Transaction ID</td>
            <td style="padding:8px 0; font-size:14px; color:#111111; font-weight:600; text-align:right;">${transactionId}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; font-size:14px; color:#666666;">Order Date</td>
            <td style="padding:8px 0; font-size:14px; color:#111111; font-weight:600; text-align:right;">${orderDate}</td>
          </tr>
        </table>
      </div>

      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="section-title" style="font-size:16px; font-weight:600; color:#111111; margin-bottom:15px;">
          Items Ordered
        </div>
        <table class="items-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left; font-size:13px; color:#666666; padding:10px 0; border-bottom:1px solid #dddddd;">Item</th>
              <th style="text-align:center; font-size:13px; color:#666666; padding:10px 0; border-bottom:1px solid #dddddd;">Qty</th>
              <th style="text-align:right; font-size:13px; color:#666666; padding:10px 0; border-bottom:1px solid #dddddd;">Price</th>
              <th style="text-align:right; font-size:13px; color:#666666; padding:10px 0; border-bottom:1px solid #dddddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="totals" style="width:260px; margin-left:auto; margin-top:20px;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; font-size:14px; color:#666666;">Subtotal</td>
              <td style="padding:6px 0; font-size:14px; color:#111111; text-align:right;">₹${(order.totals?.subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; font-size:14px; color:#666666;">Shipping</td>
              <td style="padding:6px 0; font-size:14px; color:#111111; text-align:right;">₹${(order.totals?.shipping || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; font-size:14px; color:#666666;">Tax</td>
              <td style="padding:6px 0; font-size:14px; color:#111111; text-align:right;">₹${(order.totals?.tax || 0).toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td style="border-top:1px solid #dddddd; padding-top:10px; font-size:16px; font-weight:bold; color:#111111;">Total</td>
              <td style="border-top:1px solid #dddddd; padding-top:10px; font-size:16px; font-weight:bold; color:#111111; text-align:right;">₹${(order.totals?.total || 0).toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="section-title" style="font-size:16px; font-weight:600; color:#111111; margin-bottom:15px;">
          Shipping Address
        </div>
        <div class="address" style="font-size:14px; color:#555555; line-height:1.8;">
          <strong>${order.shippingAddress?.name || ''}</strong><br>
          ${order.shippingAddress?.street || ''}<br>
          ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.state || ''}<br>
          ${order.shippingAddress?.country || ''} - ${order.shippingAddress?.zip || ''}<br>
          Phone: ${order.shippingAddress?.phone || ''}
        </div>
      </div>

      <div class="section support" style="padding:20px 0; border-bottom: none; text-align: center;">
        <p style="font-size:14px; color:#666666; margin: 0; line-height: 1.6;">
          If you have any questions regarding your order, please contact us at
          <a href="mailto:support@treeborn.shop" style="color:#111111; text-decoration:none; font-weight:600;">support@treeborn.shop</a>
          and include your order number in your message.
        </p>
      </div>

      <div class="footer" style="padding-top:30px; text-align:center; font-size:12px; color:#999999; border-top: 1px solid #eaeaea;">
        © ${currentYear} <strong>TREEBORN</strong><br>
        <span style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; display: inline-block; margin-top: 6px;">Biological Cellular Restoration Apothecary.</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

const getAdminNewOrderTemplate = (order, paidDate, adminOrderUrl, paymentMethod, paymentStatus, transactionId, currentYear) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>New Paid Order - TREEBORN Admin</title>
</head>
<body style="background:#ffffff; font-family:Arial,Helvetica,sans-serif; color:#222222; line-height:1.6; margin:0; padding:0; box-sizing:border-box;">
  <div class="wrapper" style="width:100%; background:#ffffff; padding: 20px 0;">
    <div class="container" style="max-width:600px; margin:0 auto; padding:40px 25px; border: 1px solid #eaeaea; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div class="header" style="border-bottom:1px solid #e5e5e5; padding-bottom:20px; text-align: center;">
        <div class="logo" style="font-size:28px; font-weight:700; letter-spacing:3px; color:#111111; font-family:Arial,sans-serif;">
          TREEBORN
        </div>
      </div>
      
      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec; text-align: center;">
        <div class="title" style="font-size:22px; font-weight:600; color:#c2410c; margin-bottom:12px;">
          New Paid Order Received
        </div>
        <p class="text" style="font-size:15px; color:#555555; margin-bottom:18px;">
          A customer has successfully completed a payment. Please review and process the order for fulfillment.
        </p>
        <div class="amount" style="font-size:36px; font-weight:bold; color:#111111; margin-top:15px;">
          ₹${(order.totals?.total || 0).toFixed(2)}
        </div>
      </div>

      <div class="section" style="padding:30px 0; border-bottom:1px solid #ececec;">
        <div class="section-title" style="font-size:16px; font-weight:600; color:#111111; margin-bottom:15px;">
          Order Details
        </div>
        <table class="info-table" style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3; width:180px;">Order Number</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">#${order.orderNumber || ''}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3;">Customer Name</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">${order.shippingAddress?.name || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3;">Customer Phone</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">${order.shippingAddress?.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3;">Payment Method</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">${paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3;">Payment Status</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">${paymentStatus}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3;">Transaction ID</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">${transactionId}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3;">Paid Date</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">${paidDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; font-size:14px; color:#666666; border-bottom:1px solid #f3f3f3;">Unique Items</td>
            <td style="padding:10px 0; font-size:14px; color:#111111; font-weight:600; border-bottom:1px solid #f3f3f3;">${(order.items || []).length}</td>
          </tr>
        </table>
      </div>

      <div class="section" style="padding:30px 0; border-bottom: none; text-align: center;">
        <a href="${adminOrderUrl}" target="_blank" style="display:inline-block; background:#111111; color:#ffffff !important; text-decoration:none; padding:14px 32px; font-size:14px; font-weight:600; border-radius: 4px; letter-spacing: 1px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          View Order in Dashboard
        </a>
        <p class="note" style="margin-top:20px; font-size:13px; color:#666666;">
          Open the TreeBorn Admin Dashboard to verify payment details, prepare shipment, and complete order fulfillment.
        </p>
      </div>

      <div class="footer" style="padding-top:30px; text-align:center; font-size:12px; color:#999999; border-top: 1px solid #eaeaea;">
        © \${currentYear} <strong>TREEBORN</strong><br>
        <span style="font-size: 11px; letter-spacing: 1px; text-transform: uppercase; display: inline-block; margin-top: 6px;">Admin Notification System</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  getVerificationTemplate,
  getOrderConfirmationTemplate,
  getAdminNewOrderTemplate
};
