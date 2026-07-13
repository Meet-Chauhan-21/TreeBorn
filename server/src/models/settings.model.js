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
    },
    homepageImages: {
      spotlight: {
        type: String,
        default: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop'
      },
      spotlightName: {
        type: String,
        default: 'Restorative Peptide Serum'
      },
      spotlightDescription: {
        type: String,
        default: 'A concentrated multi-peptide serum designed to target visible signs of aging, restore firmness, and deeply hydrate the skin.'
      },
      spotlightPrice: {
        type: Number,
        default: 85
      },
      spotlightOldPrice: {
        type: Number,
        default: 110
      },
      about: {
        main: {
          type: String,
          default: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'
        },
        secondary: {
          type: String,
          default: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop'
        }
      }
    },
    privacyPolicy: {
      type: [
        {
          title: { type: String, required: true },
          content: { type: [String], default: [] }
        }
      ],
      default: [
        {
          title: 'Introduction',
          content: [
            'We value your privacy and are committed to protecting your personal data.',
            'This policy details how we collect, process, and protect your information.'
          ]
        }
      ]
    },
    termsConditions: {
      type: [
        {
          title: { type: String, required: true },
          content: { type: [String], default: [] }
        }
      ],
      default: [
        {
          title: 'General Terms',
          content: [
            'By accessing or purchasing from TreeBorn, you agree to comply with our Terms & Conditions.',
            'We reserve the right to update these terms at any time.'
          ]
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
module.exports = Settings;
