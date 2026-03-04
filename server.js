require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { testConnection, syncDatabase } = require('./database');

// Importar rotas
const paymentsRoutes = require('./routes/payments');
const webhooksRoutes = require('./routes/webhooks');
const subscriptionsRoutes = require('./routes/subscriptions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: '*', // Em produção, especifique seu domínio
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (front-end)
app.use(express.static(path.join(__dirname)));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api', paymentsRoutes);
app.use('/api', webhooksRoutes);
app.use('/api', subscriptionsRoutes);

// API Info Route
app.get('/api', (req, res) => {
    res.json({
        message: 'CarregadoStore Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            payments: {
                createOrder: 'POST /api/create-order',
                capturePayment: 'POST /api/capture-payment'
            },
            subscriptions: {
                checkStatus: 'GET /api/subscription-status/:email',
                listAll: 'GET /api/subscriptions'
            },
            webhooks: {
                paypal: 'POST /api/paypal-webhook'
            }
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message
    });
});

// Initialize server
async function startServer() {
    try {
        // Test database connection
        await testConnection();
        
        // Synchronize models
        await syncDatabase();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running at http://localhost:${PORT}`);
            console.log(`📚 Documentation: http://localhost:${PORT}`);
            console.log(`💳 PayPal Mode: ${process.env.PAYPAL_MODE || 'sandbox'}`);
            console.log(`\n✅ Backend ready to receive requests!\n`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    process.exit(0);
});


