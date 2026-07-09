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
      method: { type: String, enum: ['card', 'cod'], required: true },
      status: {
        type: String,
        enum: ['pending', 'authorized', 'paid'],
        required: true
      },
      cardName: { type: String, default: '' },
      cardLast4: { type: String, default: '' }
    },

    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      shipping: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 }
    },

    status: {
      type: String,
      enum: ['Placed', 'Processing', 'Delivered', 'Cancelled'],
      default: 'Placed'
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

