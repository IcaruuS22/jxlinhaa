const express = require('express');
const router = express.Router();
const { verifyWebhookSignature, calculateExpirationDate } = require('../utils/paypal');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// POST /api/paypal-webhook
// Receive PayPal notifications
router.post('/paypal-webhook', async (req, res) => {
    try {
        const webhookEvent = req.body;
        const headers = req.headers;

        console.log('📬 Webhook received:', webhookEvent.event_type);

        // Verify webhook authenticity
        const isValid = await verifyWebhookSignature(webhookEvent, headers);

        if (!isValid) {
            console.error('❌ Invalid or unverified webhook');
            return res.status(400).send('Webhook verification failed');
        }

        // Process different event types
        switch (webhookEvent.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                await handlePaymentCompleted(webhookEvent);
                break;

            case 'PAYMENT.CAPTURE.DENIED':
                await handlePaymentDenied(webhookEvent);
                break;

            case 'CHECKOUT.ORDER.APPROVED':
                console.log('✅ Order approved:', webhookEvent.resource.id);
                break;

            default:
                console.log('ℹ️ Unhandled event:', webhookEvent.event_type);
        }

        // Respond to PayPal that we received it
        res.status(200).send('OK');

    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handler for completed payment
async function handlePaymentCompleted(event) {
    try {
        const resource = event.resource;
        const orderId = resource.supplementary_data?.related_ids?.order_id;
        const transactionId = resource.id;
        const amount = resource.amount.value;
        const payerEmail = resource.payer?.email_address;

        console.log('💰 Payment completed:', {
            orderId,
            transactionId,
            amount,
            payerEmail
        });

        // Search for subscription by order_id
        const subscription = await Subscription.findOne({
            where: { paypal_order_id: orderId }
        });

        if (subscription) {
            // Update status
            const expiresAt = calculateExpirationDate(subscription.plan);
            
            await subscription.update({
                status: 'active',
                transaction_id: transactionId,
                expires_at: expiresAt
            });

            console.log(`✅ Subscription activated via webhook: ${subscription.payer_email}`);
        } else {
            console.warn('⚠️ Subscription not found for order:', orderId);
            
            // If not found, create a new one (fallback)
            if (payerEmail) {
                let user = await User.findOne({ where: { email: payerEmail } });
                if (!user) {
                    user = await User.create({ email: payerEmail });
                }

                await Subscription.create({
                    user_id: user.id,
                    plan: 'Monthly', // Default
                    price: amount,
                    status: 'active',
                    transaction_id: transactionId,
                    paypal_order_id: orderId || 'unknown',
                    payer_email: payerEmail,
                    expires_at: calculateExpirationDate('Monthly')
                });

                console.log('✅ New subscription created via webhook');
            }
        }

    } catch (error) {
        console.error('❌ Error processing completed payment:', error);
    }
}

// Handler for denied payment
async function handlePaymentDenied(event) {
    try {
        const resource = event.resource;
        const orderId = resource.supplementary_data?.related_ids?.order_id;

        console.log('❌ Payment denied:', orderId);

        // Update status to cancelled
        await Subscription.update(
            { status: 'cancelled' },
            { where: { paypal_order_id: orderId } }
        );

    } catch (error) {
        console.error('❌ Error processing denied payment:', error);
    }
}

module.exports = router;


