const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const Order = require('../../models/order.model');
const Settings = require('../../models/settings.model');
const Notification = require('../../models/notification.model');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenueResult,
      totalOnlinePayments,
      codOrders,
      paidOrders,
      failedPayments,
      refundedOrders,
      revenueByMethodResult,
      recentOrders,
      topProducts
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': { $in: ['Paid', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$totals.total' } } }
      ]),
      Order.countDocuments({ 'payment.method': { $in: ['razorpay', 'card'] } }),
      Order.countDocuments({ 'payment.method': 'cod' }),
      Order.countDocuments({ 'payment.status': { $in: ['Paid', 'paid'] } }),
      Order.countDocuments({ 'payment.status': 'Failed' }),
      Order.countDocuments({ 'payment.status': 'Refunded' }),
      Order.aggregate([
        { $match: { 'payment.status': { $in: ['Paid', 'paid'] } } },
        {
          $group: {
            _id: '$payment.method',
            total: { $sum: '$totals.total' }
          }
        }
      ]),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
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

    const revenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    let onlineRevenue = 0;
    let codRevenue = 0;
    revenueByMethodResult.forEach((item) => {
      if (item._id === 'razorpay' || item._id === 'card') {
        onlineRevenue += item.total;
      } else if (item._id === 'cod') {
        codRevenue += item.total;
      }
    });

    return res.status(200).json({
      stats: {
        revenue,
        orders: totalOrders,
        products: totalProducts,
        users: totalUsers,
        totalOnlinePayments,
        codOrders,
        paidOrders,
        failedPayments,
        refundedOrders,
        revenueByMethod: {
          online: onlineRevenue,
          cod: codRevenue
        }
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch dashboard stats.' });
  }
};

// @desc    Get admin settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.status(200).json({ settings });
  } catch (error) {
    console.error('Admin Get Settings Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to get settings.' });
  }
};

// @desc    Update admin settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { 
      email, 
      whatsappNumber, 
      themeColor, 
      enableCreditCard, 
      enableRazorpay,
      enablePaypal, 
      enableCOD, 
      privacyPolicy, 
      termsConditions, 
      homepageImages,
      shopName,
      address,
      gstNumber,
      logo
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.email = email !== undefined ? email : settings.email;
    settings.whatsappNumber = whatsappNumber !== undefined ? whatsappNumber : settings.whatsappNumber;
    settings.themeColor = themeColor !== undefined ? themeColor : settings.themeColor;
    settings.enableCreditCard = enableCreditCard !== undefined ? enableCreditCard : settings.enableCreditCard;
    settings.enableRazorpay = enableRazorpay !== undefined ? enableRazorpay : settings.enableRazorpay;
    settings.enablePaypal = enablePaypal !== undefined ? enablePaypal : settings.enablePaypal;
    settings.enableCOD = enableCOD !== undefined ? enableCOD : settings.enableCOD;
    settings.privacyPolicy = privacyPolicy !== undefined ? privacyPolicy : settings.privacyPolicy;
    settings.termsConditions = termsConditions !== undefined ? termsConditions : settings.termsConditions;
    settings.homepageImages = homepageImages !== undefined ? homepageImages : settings.homepageImages;
    settings.shopName = shopName !== undefined ? shopName : settings.shopName;
    settings.address = address !== undefined ? address : settings.address;
    settings.gstNumber = gstNumber !== undefined ? gstNumber : settings.gstNumber;
    settings.logo = logo !== undefined ? logo : settings.logo;

    const updated = await settings.save();
    return res.status(200).json({ message: 'Settings updated successfully', settings: updated });
  } catch (error) {
    console.error('Admin Update Settings Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to update settings.' });
  }
};

// @desc    Get admin notifications (Bell Icon)
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to fetch notifications.' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private/Admin
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    return res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    return res.status(500).json({ message: 'Server error. Failed to update notification.' });
  }
};

// @desc    Delete/Clear all notifications
// @route   DELETE /api/admin/notifications
// @access  Private/Admin
const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    return res.status(200).json({ message: 'All notifications cleared successfully.' });
  } catch (error) {
    console.error('Clear Notifications Error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getDashboardStats,
  getSettings,
  updateSettings,
  getNotifications,
  markNotificationRead,
  clearNotifications
};
