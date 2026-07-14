const Order = require('../models/order.model');

const ORDER_NUMBER_PREFIX = 'TREEBORN';

const generateOrderNumber = async () => {
  // Retry a few times to avoid collisions.
  for (let attempt = 0; attempt < 8; attempt++) {
    const generated = `${ORDER_NUMBER_PREFIX}-${Math.floor(1000 + Math.random() * 9000)}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Order.findOne({ orderNumber: generated });
    if (!exists) return generated;
  }
  // Fallback (very low probability of collision).
  return `${ORDER_NUMBER_PREFIX}-${Date.now()}`;
};

const getRequiredAddressFields = () => ['name', 'phone', 'street', 'country', 'state', 'district', 'zip'];

const validateAddress = (shippingAddress) => {
  const required = getRequiredAddressFields();
  const missing = required.filter((f) => !shippingAddress || !shippingAddress[f]);
  return missing;
};

// @desc    Create an order for the logged-in user
// @route   POST /api/users/orders
// @access  Protected
const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { items, shippingAddress, paymentMethod, paymentDetails, totals } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required.' });
    }

    const missingAddress = validateAddress(shippingAddress);
    if (missingAddress.length > 0) {
      return res.status(400).json({
        message: 'Please provide all required shipping fields.',
        missing: missingAddress
      });
    }

    if (!paymentMethod || !['card', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'paymentMethod must be either "card" or "cod".' });
    }

    if (!totals) return res.status(400).json({ message: 'Totals are required.' });

    const requiredTotals = ['subtotal', 'shipping', 'tax', 'total'];
    const missingTotals = requiredTotals.filter((k) => totals[k] === undefined || totals[k] === null || Number.isNaN(totals[k]));
    if (missingTotals.length > 0) {
      return res.status(400).json({ message: 'Invalid totals provided.', missing: missingTotals });
    }

    const orderNumber = await generateOrderNumber();

    const paymentStatus = paymentMethod === 'card' ? 'paid' : 'pending';

    const order = await Order.create({
      orderNumber,
      user: userId,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        selectedSize: i.selectedSize || '50ml'
      })),
      shippingAddress,
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        cardName: paymentDetails?.cardName || '',
        cardLast4: paymentDetails?.cardLast4 || ''
      },
      totals: {
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total
      },
      status: 'Placed'
    });

    // Create notification for admin
    try {
      const Notification = require('../models/notification.model');
      await Notification.create({
        type: 'new_order',
        title: 'New Order Placed',
        message: `Order #${order.orderNumber} placed by ${shippingAddress.name} for ₹${totals.total.toFixed(2)}`,
        link: `/admin/orders/${order._id}`
      });
    } catch (notificationError) {
      console.error('Failed to create order notification:', notificationError);
    }

    // Handle stock decrement and low stock notification if applicable
    try {
      const Product = require('../models/product.model');
      const Notification = require('../models/notification.model');
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          if (product.stock !== undefined && product.stock !== null) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
            if (product.stock <= 10) {
              await Notification.create({
                type: 'low_stock',
                title: 'Low Stock Alert',
                message: `Product "${product.name}" has low stock (${product.stock} units remaining).`,
                link: `/admin/products/${product._id}`
              });
            }
          }
        }
      }
    } catch (stockError) {
      console.error('Failed to decrement stock / create low stock notification:', stockError);
    }

    return res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to create order.' });
  }
};

// @desc    List orders for the logged-in user
// @route   GET /api/users/orders
// @access  Protected
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ user: userId })
    ]);

    return res.status(200).json({
      orders,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch orders.' });
  }
};

module.exports = {
  createOrder,
  getUserOrders
};

