require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const expenseRoutes = require('./routes/expenses');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB error:', error);
});

// Routes
// API Base Route (Optional: move this to /api instead of / if you still want an API check)
app.get('/api', (req, res) => {
    res.json({
        message: 'Expense Tracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            expenses: '/api/expenses',
            stats: '/api/expenses/stats/monthly'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../')));

// Catch-all route to serve index.html for frontend routing (if needed) and non-API requests
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../index.html'));
    } else {
        res.status(404).json({ success: false, message: 'API Route not found' });
    }
});

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Start Server - Listen on all network interfaces for mobile access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://192.168.1.6:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📱 Mobile Access: Connect your phone to the same Wi-Fi and use the Network URL`);
    console.log(`\n📚 API Documentation:`);
    console.log(`   GET    /api/expenses              - Get all expenses`);
    console.log(`   GET    /api/expenses/:id          - Get single expense`);
    console.log(`   POST   /api/expenses              - Create expense`);
    console.log(`   PUT    /api/expenses/:id          - Update expense`);
    console.log(`   DELETE /api/expenses/:id          - Delete expense`);
    console.log(`   GET    /api/expenses/stats/monthly - Get monthly stats`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏳ Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
});
