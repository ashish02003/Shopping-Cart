import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Check, Package, Trash2, Plus, Minus, Loader } from 'lucide-react';

// API Configuration - Change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// API Functions
const api = {
  getProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    return res.json();
  },
  
  addToCart: async (productId, qty) => {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty })
    });
    return res.json();
  },
  
  getCart: async () => {
    const res = await fetch(`${API_BASE_URL}/cart`);
    return res.json();
  },
  
  updateCartItem: async (id, qty) => {
    const res = await fetch(`${API_BASE_URL}/cart/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty })
    });
    return res.json();
  },
  
  removeFromCart: async (id) => {
    const res = await fetch(`${API_BASE_URL}/cart/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  
  checkout: async (cartItems, customerName, customerEmail) => {
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems, customerName, customerEmail })
    });
    return res.json();
  }
};

export default function VibeCommerceApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [view, setView] = useState('products');
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    setAddingToCart(productId);
    try {
      await api.addToCart(productId, 1);
      await loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
    setAddingToCart(null);
  };

  const handleRemoveFromCart = async (id) => {
    try {
      await api.removeFromCart(id);
      await loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item');
    }
  };

  const handleUpdateQty = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await api.updateCartItem(id, newQty);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const validateCheckoutForm = () => {
    const newErrors = {};
    if (!checkoutForm.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!checkoutForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(checkoutForm.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateCheckoutForm()) return;
    
    setLoading(true);
    try {
      const receiptData = await api.checkout(cart, checkoutForm.name, checkoutForm.email);
      setReceipt(receiptData);
      setCart([]);
      setCartTotal(0);
      setCheckoutForm({ name: '', email: '' });
      setErrors({});
      setView('products');
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Checkout failed. Please try again.');
    }
    setLoading(false);
  };

  const closeReceipt = () => {
    setReceipt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">Vibe Commerce</h1>
            </div>
            <button
              onClick={() => setView(view === 'products' ? 'cart' : 'products')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">
                {view === 'products' ? 'View Cart' : 'Continue Shopping'}
              </span>
              {cart.length > 0 && (
                <span className="bg-white text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {view === 'products' ? (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h2>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 h-48 flex items-center justify-center text-6xl">
                      {product.image}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-indigo-600">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={addingToCart === product._id}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                        >
                          {addingToCart === product._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span className="text-sm ">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
            {cart.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some products to get started!</p>
                <button
                  onClick={() => setView('products')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map(item => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
                      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                        {products.find(p => p._id === item.productId)?.image || '📦'}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{item.name}</h3>
                        <p className="text-indigo-600 font-bold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleUpdateQty(item._id, item.qty - 1)}
                          disabled={item.qty <= 1}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQty(item._id, item.qty + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right flex-shrink-0 w-20">
                        <p className="font-bold text-lg">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item._id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 flex-shrink-0 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-2 mb-4 pb-4 border-b">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cart.length} items)</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600 font-semibold">FREE</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xl font-bold mb-6">
                      <span>Total</span>
                      <span className="text-indigo-600">${cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.name}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          placeholder="John Doe"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={checkoutForm.email}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                      </div>
                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Complete Checkout</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {receipt && (
        <div className="fixed inset-0 bg-slate-200 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order Confirmed!</h3>
                    <p className="text-gray-600 text-sm">Thank you for your purchase</p>
                  </div>
                </div>
                <button onClick={closeReceipt} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order ID</p>
                    <p className="font-semibold text-gray-900">{receipt.orderId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(receipt.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-semibold text-gray-900">{receipt.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900 truncate">{receipt.customerEmail}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900">Order Items</h4>
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x{item.qty}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Paid</span>
                  <span className="text-indigo-600">${receipt.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={closeReceipt}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}