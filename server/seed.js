require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const Product = require('./src/models/Product.model');
const Order = require('./src/models/Order.model');
const bcrypt = require('bcryptjs');

const productsData = [
  {
    name: 'Restorative Peptide Serum',
    category: 'Serums',
    description: 'A concentrated multi-peptide serum designed to target visible signs of aging, restore firmness, and deeply hydrate the dermal layers.',
    rating: 4.9,
    reviewsCount: 148,
    price: 85.00,
    oldPrice: 110.00,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop',
    isBestSeller: true,
    isNewArrival: false,
    ingredients: ['Copper Tripeptide-1', 'Hyaluronic Acid Matrix', 'Organic Centella Asiatica', 'Niacinamide (Vitamin B3)'],
    benefits: ['Plumps fine lines & wrinkles', 'Improves skin elasticity & firmness', 'Boosts natural collagen production', 'Provides 72-hour moisture lock'],
    stock: 150,
    sku: 'SKU-001'
  },
  {
    name: 'Barrier Renewal Cream',
    category: 'Moisturizers',
    description: 'A rich, comforting cream packed with essential ceramides and lipids to repair the moisture barrier and shield skin against dryness.',
    rating: 4.8,
    reviewsCount: 96,
    price: 68.00,
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    isBestSeller: true,
    isNewArrival: false,
    ingredients: ['Ceramides NP, AP, EOP', 'Phytosphingosine', 'Squalane', 'Shea Butter'],
    benefits: ['Repairs damaged skin barrier', 'Relieves redness and irritation', 'Deeply nourishes dry, flaky patches', 'Creates protective micro-membrane'],
    stock: 200,
    sku: 'SKU-002'
  },
  {
    name: 'Gentle Hydrating Cleanser',
    category: 'Cleansers',
    description: 'A ph-balanced, non-foaming milk cleanser that effectively sweeps away impurities, light makeup, and pollution without stripping natural oils.',
    rating: 4.7,
    reviewsCount: 204,
    price: 36.00,
    oldPrice: 42.00,
    discount: 14,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop',
    isBestSeller: false,
    isNewArrival: false,
    ingredients: ['Oat Beta-Glucan', 'Chamomile Extract', 'Provitamin B5 (Panthenol)', 'Sweet Almond Oil'],
    benefits: ['Cleanses deeply while preserving skin barrier', 'Calms active redness and sensitivity', 'Locks in moisture during wash', 'Soap-free and sulfate-free formula'],
    stock: 300,
    sku: 'SKU-003'
  },
  {
    name: 'Pure Botanical Recovery Oil',
    category: 'Face Oils',
    description: 'An ultra-light, luxurious blend of cold-pressed botanical oils rich in vitamins and antioxidants to deeply nourish and restore glow.',
    rating: 4.9,
    reviewsCount: 88,
    price: 75.00,
    image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop',
    isBestSeller: false,
    isNewArrival: true,
    ingredients: ['Organic Rosehip Seed Oil', 'Jojoba Oil', 'Squalane', 'Tocopherol (Vitamin E)'],
    benefits: ['Smooths skin texture and dry lines', 'Improves radiance and skin luminosity', 'Absorbs instantly without greasy residue', 'Defends against environmental stress'],
    stock: 120,
    sku: 'SKU-004'
  },
  {
    name: 'Resurfacing AHA/BHA Mask',
    category: 'Masks',
    description: 'A 10-minute exfoliating gel mask that sloughs off dead cells, decongests pores, and reveals a smoother, glowing complexion.',
    rating: 4.8,
    reviewsCount: 112,
    price: 52.00,
    oldPrice: 65.00,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=600&auto=format&fit=crop',
    isBestSeller: false,
    isNewArrival: true,
    ingredients: ['Glycolic Acid (AHA) 8%', 'Salicylic Acid (BHA) 2%', 'Lactic Acid 2%', 'Aloe Vera Gel'],
    benefits: ['Exfoliates gently to brighten skin', 'Unclogs and tightens enlarged pores', 'Smooths uneven texture and rough bumps', 'Boosts cellular turnover speed'],
    stock: 90,
    sku: 'SKU-005'
  },
  {
    name: 'Niacinamide Balancing Mist',
    category: 'Toners',
    description: 'An ultra-fine revitalizing toner mist that balances skin pH, controls sebum, and locks in lightweight hydration on the go.',
    rating: 4.6,
    reviewsCount: 74,
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1617897903241-efdb58372654?q=80&w=600&auto=format&fit=crop',
    isBestSeller: false,
    isNewArrival: false,
    ingredients: ['Niacinamide 4%', 'Witch Hazel Extract', 'Rosewater Distillate', 'Green Tea Extract'],
    benefits: ['Refreshes and wakes up tired skin', 'Controls excess sebum and shine', 'Refines the appearance of pores', 'Prep skin for optimal serum absorption'],
    stock: 180,
    sku: 'SKU-006'
  },
  {
    name: 'Overnight Rejuvenation Elixir',
    category: 'Face Oils',
    description: 'A powerful lipid-based retinol treatment that works overnight to accelerate cell regeneration, fade dark spots, and smooth texture.',
    rating: 4.9,
    reviewsCount: 165,
    price: 92.00,
    image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop',
    isBestSeller: true,
    isNewArrival: false,
    ingredients: ['Pure Retinol 0.5%', 'Blue Tansy Oil', 'Evening Primrose Extract', 'Coenzyme Q10'],
    benefits: ['Reduces dark spots & hyperpigmentation', 'Accelerates natural overnight cellular healing', 'Calms inflammation and breakout triggers', 'Smooths uneven skin tone'],
    stock: 110,
    sku: 'SKU-007'
  },
  {
    name: 'C-Radiance Illuminating Gel',
    category: 'Moisturizers',
    description: 'A lightweight Vitamin C gel cream that infuses dull skin with radiant energy, fights free radicals, and delivers satin-smooth hydration.',
    rating: 4.7,
    reviewsCount: 82,
    price: 58.00,
    oldPrice: 72.00,
    discount: 19,
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    isBestSeller: false,
    isNewArrival: true,
    ingredients: ['3-O-Ethyl Ascorbic Acid (Vitamin C)', 'Kakadu Plum Extract', 'Vitamin E', 'Grape Seed Extract'],
    benefits: ['Visibly brightens and evens skin tone', 'Protects against environmental pollution', 'Ultra-light texture suitable for hot climates', 'Perfect base for makeup prep'],
    stock: 140,
    sku: 'SKU-008'
  }
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in your env configuration.');
      process.exit(1);
    }

    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database.');

    // Clear existing data (optional - uncomment if you want to reset)
    // await User.deleteMany({});
    // await Product.deleteMany({});
    // await Order.deleteMany({});

    // Seed admin
    const adminEmail = 'admin@treeborn.com';
    const adminPassword = 'treeborn@123';

    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('Seeding admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const adminUser = new User({
        name: 'TreeBorn Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+919999999999',
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user seeded successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    } else {
      console.log(`Admin user with email "${adminEmail}" already exists.`);
    }

    // Seed products
    console.log('Seeding products...');
    for (const productData of productsData) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
      }
    }
    console.log('Products seeded successfully!');

    // Seed sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+919876543210',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+919876543211',
        role: 'user'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        phone: '+919876543212',
        role: 'user'
      }
    ];

    console.log('Seeding sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = new User({ ...userData, password: hashedPassword });
        await user.save();
        createdUsers.push(user);
      } else {
        createdUsers.push(existingUser);
      }
    }
    console.log('Sample users seeded successfully!');

    // Get all products
    const products = await Product.find();

    // Seed sample orders
    console.log('Seeding sample orders...');
    const orderStatuses = ['Placed', 'Processing', 'Delivered', 'Cancelled'];
    
    for (let i = 0; i < 5; i++) {
      const user = createdUsers[i % createdUsers.length];
      const orderProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);
      const totalAmount = orderProducts.reduce((sum, product) => sum + product.price, 0);
      
      const order = new Order({
        orderNumber: `TREEBORN-${1000 + i}`,
        user: user._id,
        items: orderProducts.map(product => ({
          productId: product._id.toString(),
          name: product.name,
          quantity: Math.floor(Math.random() * 2) + 1,
          price: product.price,
          selectedSize: '50ml'
        })),
        shippingAddress: {
          name: user.name,
          phone: user.phone,
          street: '123 Main Street',
          country: 'India',
          state: 'Maharashtra',
          district: 'Mumbai',
          zip: '400001'
        },
        payment: {
          method: i % 2 === 0 ? 'card' : 'cod',
          status: 'paid',
          cardName: i % 2 === 0 ? user.name : '',
          cardLast4: i % 2 === 0 ? '4242' : ''
        },
        totals: {
          subtotal: totalAmount,
          shipping: 5.00,
          tax: totalAmount * 0.18,
          total: totalAmount + 5 + (totalAmount * 0.18)
        },
        status: orderStatuses[i % orderStatuses.length]
      });

      await order.save();
    }
    console.log('Sample orders seeded successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from database. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error occurred:', error);
    process.exit(1);
  }
};

seedDatabase();
