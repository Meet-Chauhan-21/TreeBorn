const Order = require('../models/order.model');

/**
 * @desc    Handle Shiprocket Webhook
 * @route   POST /api/webhooks/shiprocket
 * @access  Public
 */
const handleShiprocketWebhook = async (req, res) => {
  try {
    const payload = req.body;
    console.log('Received Shiprocket Webhook:', JSON.stringify(payload, null, 2));

    const { awb, order_id, current_status, status_code } = payload;

    if (!awb && !order_id) {
      return res.status(400).json({ message: 'Missing awb or order_id in webhook payload.' });
    }

    // Try finding order by orderNumber (reference ID sent as order_id) or awbCode
    const order = await Order.findOne({
      $or: [
        { orderNumber: String(order_id) },
        { awbCode: String(awb) }
      ]
    });

    if (!order) {
      console.warn(`Order not found for Shiprocket Webhook (order_id: ${order_id}, awb: ${awb})`);
      // Return 200 to acknowledge receipt and prevent endless retries
      return res.status(200).json({ message: 'Order not found, but webhook received.' });
    }

    // Update delivery status from webhook payload
    const newDeliveryStatus = current_status || payload.status || order.deliveryStatus;
    order.deliveryStatus = String(newDeliveryStatus);
    order.updatedShipmentAt = new Date();

    // Map Shiprocket statuses to high-level order statuses
    const lowerStatus = String(newDeliveryStatus).toLowerCase();
    const code = Number(status_code);

    if (lowerStatus.includes('deliver') || code === 7) {
      order.status = 'Delivered';
      if (order.payment && order.payment.status !== 'Paid') {
        order.payment.status = 'Paid';
        order.payment.paidAt = new Date();
      }
    } else if (lowerStatus.includes('cancel') || code === 10) {
      order.status = 'Cancelled';
    } else if (
      lowerStatus.includes('transit') || 
      lowerStatus.includes('shipped') || 
      lowerStatus.includes('out for delivery') || 
      lowerStatus.includes('pickup') || 
      code === 6
    ) {
      order.status = 'Shipped';
    }

    await order.save();
    console.log(`Successfully processed webhook for Order #${order.orderNumber}. Delivery status: ${order.deliveryStatus}, Order status: ${order.status}`);

    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Shiprocket Webhook Handler Error:', error);
    // Return 500 so Shiprocket retries if it was a transient server error
    return res.status(500).json({ message: 'Internal server error processing webhook.' });
  }
};

module.exports = {
  handleShiprocketWebhook
};
