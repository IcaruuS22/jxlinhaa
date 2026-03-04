const express = require('express');
const router = express.Router();
const { createOrder, capturePayment, calculateExpirationDate } = require('../utils/paypal');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// POST /api/create-order
// Create PayPal order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, plan, email } = req.body;

        if (!amount || !plan || !email) {
            return res.status(400).json({
                success: false,
                error: 'Incomplete data (amount, plan, email)'
            });
        }

        // Check/create user
        let user = await User.findOne({ where: { email } });
        if (!user) {
            user = await User.create({ email });
        }

        // Define description
        const descriptions = {
            'Monthly': 'Monthly Subscription (31 days) - _jxlinhaa',
            'Quarterly': 'Quarterly Subscription (3 months) - _jxlinhaa',
            'Annual': 'Annual Subscription (12 months) - Carreg_jxlinhaaa'
        };

        const description = descriptions[plan] || `Subscription ${plan} - Carreg_jxlinhaa`;

        // Create order in PayPal
        const result = await createOrder(amount, description, plan);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: 'Error creating PayPal order'
            });
        }

        // Save in DB as pending
        await Subscription.create({
            user_id: user.id,
            plan: plan,
            price: amount,
            status: 'pending',
            paypal_order_id: result.orderId,
            payer_email: email,
            expires_at: null
        });

        res.json({
            success: true,
            orderId: result.orderId
        });

    } catch (error) {
        console.error('Error in create-order:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/capture-payment
// Capture payment after user approval
router.post('/capture-payment', async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID not provided'
            });
        }

        // Capture payment in PayPal
        const result = await capturePayment(orderId);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: 'Error capturing payment'
            });
        }

        const captureData = result.data;
        const transactionId = captureData.purchase_units[0].payments.captures[0].id;

        // Search for pending subscription
        const subscription = await Subscription.findOne({
            where: {
                paypal_order_id: orderId,
                status: 'pending'
            }
        });

        if (!subscription) {
            console.warn('⚠️ Subscription not found for order:', orderId);
        } else {
            // Update status to active
            const expiresAt = calculateExpirationDate(subscription.plan);
            
            await subscription.update({
                status: 'active',
                transaction_id: transactionId,
                expires_at: expiresAt
            });

            console.log(`✅ Subscription activated: ${subscription.payer_email} - ${subscription.plan}`);
        }

        res.json({
            success: true,
            transaction_id: transactionId,
            data: captureData
        });

    } catch (error) {
        console.error('Error in capture-payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


