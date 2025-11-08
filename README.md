🛒 Vibe Commerce - Full Stack Shopping Cart Application
A complete MERN stack e-commerce shopping cart application built for technical screening. Features product browsing, cart management, checkout flow, and order confirmation with full backend API integration and MongoDB persistence.

✨ Features

Backend

✅ RESTful API with Express.js

✅ MongoDB database with Mongoose ODM

✅ CRUD operations for products and cart

✅ Mock checkout with order persistence

✅ Auto-seeding of 8 sample products

✅ Request validation and error handling

✅ CORS enabled for cross-origin requests

Frontend

✅ Responsive product grid (mobile, tablet, desktop)

✅ Add to cart with real-time updates

✅ Shopping cart with quantity controls

✅ Remove items functionality

✅ Live total calculation

✅ Checkout form with validation

✅ Order confirmation modal

✅ Loading states and error handling

✅ Clean, modern UI with Tailwind CSS

🚀 Installation & Setup

Step 1: Clone or Download the Project

# Option 1: Clone with Git

git clone https://github.com/ashish02003/Shopping-Cart

cd ShoppingCart

Step 2: Backend Setup

2.1 Install Backend Dependencies

cd backend

npm install

Required packages:

bashnpm install express mongoose cors dotenv

npm install --save-dev nodemon

2.2 Configure Environment Variables

Create a .env file in the backend directory:

Edit .env with your configuration:

# MongoDB Connection

MONGODB_URI=mongodb://localhost:27017/vibe-commerce

 Or use MongoDB Atlas:
 
 MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibe-commerce

2.3 Start Backend Server

  node server.js
  
Expected output:

Server running on port 5000
MongoDB Connected
Products seeded!

Step 3: Frontend Setup
cd ..
cd frontend
3.1 Install Frontend Dependencies
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
3.2 Start Frontend
npm run dev
