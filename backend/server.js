// server.js - Backend Node.js + Express + MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// app.use(cors());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Mongoose Schemas
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
  stock: { type: Number, default: 100 }
});

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  qty: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    qty: Number
  }],
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const CartItem = mongoose.model('CartItem', cartItemSchema);
const Order = mongoose.model('Order', orderSchema);

// Seed Products (run once)
const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    const products = [
      { name: 'Wireless Headphones', price: 79.99, description: 'Premium sound quality', image: '🎧', stock: 50 },
      { name: 'Smart Watch', price: 199.99, description: 'Track your fitness', image: '⌚', stock: 30 },
      { name: 'Laptop Stand', price: 49.99, description: 'Ergonomic design', image: '💻', stock: 100 },
      { name: 'USB-C Cable', price: 12.99, description: 'Fast charging', image: '🔌', stock: 200 },
      { name: 'Wireless Mouse', price: 29.99, description: 'Smooth scrolling', image: '🖱️', stock: 75 },
      { name: 'Mechanical Keyboard', price: 89.99, description: 'RGB backlight', image: '⌨️', stock: 40 },
      { name: 'Desk Lamp', price: 39.99, description: 'Adjustable brightness', image: '💡', stock: 60 },
      { name: 'Phone Case', price: 19.99, description: 'Protective & stylish', image: '📱', stock: 150 }
    ];
    await Product.insertMany(products);
    console.log('Products seeded!');
  }
};

seedProducts();

// ============ API ROUTES ============

// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cart - Add item to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, qty } = req.body;
    
    if (!productId || !qty) {
      return res.status(400).json({ error: 'productId and qty are required' });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({ productId });
    
    if (cartItem) {
      // Update quantity
      cartItem.qty += qty;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = new CartItem({
        productId,
        name: product.name,
        price: product.price,
        qty
      });
      await cartItem.save();
    }

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/cart - Get cart with total
app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await CartItem.find().populate('productId');
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/cart/:id - Update cart item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const { qty } = req.body;
    
    if (!qty || qty < 1) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    const cartItem = await CartItem.findByIdAndUpdate(
      req.params.id,
      { qty },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cart/:id - Remove item from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const cartItem = await CartItem.findByIdAndDelete(req.params.id);
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart', item: cartItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/checkout - Process checkout
app.post('/api/checkout', async (req, res) => {
  try {
    const { cartItems, customerName, customerEmail } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (!customerName || !customerEmail) {
      return res.status(400).json({ error: 'Customer name and email required' });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Create order
    const order = new Order({
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      customerName,
      customerEmail,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      total: parseFloat(total.toFixed(2))
    });

    await order.save();

    // Clear cart after successful checkout
    await CartItem.deleteMany({});

    // Return receipt
    res.json({
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items,
      total: order.total,
      timestamp: order.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders - Get all orders (admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vibe Commerce API is running' });
});

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('✅ Shopping Cart API is running successfully on Render!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});