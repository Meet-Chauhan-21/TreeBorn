const express = require('express');
const router = express.Router();
const { verifyJWT, authorizeRoles } = require('../middleware/auth.middleware');
const {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controller/product.controller');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/Product.model');

// Admin middleware - apply to all admin routes
router.use(verifyJWT, authorizeRoles('admin'));

// Products admin routes
router.get('/products', getAllProductsAdmin);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Users admin routes
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-password -refreshToken').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    // Get order count for each user
    const usersWithOrderCount = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          orders: orderCount
        };
      })
    );

    return res.status(200).json({
      users: usersWithOrderCount,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Get Admin Users Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch users.' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user || user.role !== 'user') {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
    const orderCount = await Order.countDocuments({ user: user._id });

    return res.status(200).json({
      user: {
        ...user.toObject(),
        orders: orderCount,
        recentOrders: orders
      }
    });
  } catch (error) {
    console.error('Get Admin User Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch user.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user.' });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete Admin User Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to delete user.' });
  }
});

// Orders admin routes
router.get('/orders', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    let query = {};
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query)
    ]);

    return res.status(200).json({
      orders,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Get Admin Orders Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch orders.' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Get Admin Order Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch order.' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Placed', 'Processing', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to update order status.' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.phone = phone || user.phone;
    user.role = role === 'admin' ? 'admin' : 'user';

    const updatedUser = await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Admin User Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to update user.' });
  }
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totals.total' } } }
      ]),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { sales: -1 } },
        { $limit: 5 }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Get monthly revenue data for chart
    const monthlyRevenue = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totals.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      stats: {
        revenue,
        orders: totalOrders,
        products: totalProducts,
        users: totalUsers
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch dashboard stats.' });
  }
});

module.exports = router;
