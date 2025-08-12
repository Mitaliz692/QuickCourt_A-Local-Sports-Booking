const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const venueRoutes = require('./routes/venue');
const paymentRoutes = require('./routes/payment');
const bookingRoutes = require('./routes/booking');
const reviewRoutes = require('./routes/review');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware - disabled for development to avoid CORS issues
// app.use(helmet());

// Disable rate limiting for development
// app.use(limiter);

// Simple CORS configuration that actually works
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow localhost origins
  if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    res.header('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length,Content-Type,Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Explicit OPTIONS handler for all routes
// Static files serving with CORS
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    res.header('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  next();
}, express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickCourt Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.log('📝 Running in development mode without MongoDB');
    console.log('💡 To connect to MongoDB:');
    console.log('   1. Install MongoDB locally, or');
    console.log('   2. Use MongoDB Atlas cloud database');
    console.log('   3. Update MONGODB_URI in .env file');
    return false;
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 QuickCourt Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      
      if (dbConnected) {
        console.log(`💾 Database: Connected`);
      } else {
        console.log(`💾 Database: Disconnected (development mode)`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
