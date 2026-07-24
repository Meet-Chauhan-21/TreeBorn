const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    selectedSize: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true, trim: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },

    shippingAddress: { type: shippingAddressSchema, required: true },

    payment: {
      method: { type: String, enum: ['card', 'cod', 'razorpay'], required: true },
      status: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded', 'pending', 'authorized', 'paid'],
        default: 'Pending'
      },
      transactionId: { type: String, default: '' },
      paidAt: { type: Date },
      currency: { type: String, default: 'INR' },
      amount: { type: Number, default: 0 },
      cardName: { type: String, default: '' },
      cardLast4: { type: String, default: '' },
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' }
    },

    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      shipping: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 }
    },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending'
    },

    // Shiprocket Delivery Fields
    shipmentCreated: { type: Boolean, default: false },
    shipmentId: { type: String, default: '' },
    awbCode: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    courierName: { type: String, default: '' },
    courierCompanyId: { type: String, default: '' },
    labelUrl: { type: String, default: '' },
    invoiceUrl: { type: String, default: '' },
    deliveryStatus: { type: String, default: '' },
    shiprocketResponse: { type: mongoose.Schema.Types.Mixed, default: null },
    pickupScheduled: { type: Boolean, default: false },
    manifestGenerated: { type: Boolean, default: false },
    createdShipmentAt: { type: Date },
    updatedShipmentAt: { type: Date }
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;

