const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: 'dabhisanjay901@gmail.com'
    },
    whatsappNumber: {
      type: String,
      default: '8905330954'
    },
    themeColor: {
      type: String,
      default: '#581C87' // Deep Purple
    },
    enableCreditCard: {
      type: Boolean,
      default: true
    },
    enablePaypal: {
      type: Boolean,
      default: true
    },
    enableCOD: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
module.exports = Settings;
