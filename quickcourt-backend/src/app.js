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

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with proper CORS headers
app.use('/uploads', cors(), express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Alternative image serving route with explicit CORS headers
app.get('/uploads/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

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
