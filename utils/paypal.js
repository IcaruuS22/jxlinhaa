const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const axios = require('axios');

// PayPal environment configuration
function getPayPalEnvironment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (process.env.PAYPAL_MODE === 'live') {
        return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    } else {
        return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
    }
}

// PayPal Client
function getPayPalClient() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(getPayPalEnvironment());
}

// Create PayPal order
async function createOrder(amount, description, planName) {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            description: description,
            amount: {
                currency_code: 'USD',
                value: amount.toString()
            },
            custom_id: planName // Store plan name
        }]
    });

    try {
        const client = getPayPalClient();
        const response = await client.execute(request);
        return {
            success: true,
            orderId: response.result.id,
            data: response.result
        };
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Capture payment after approval
async function capturePayment(orderId) {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const client = getPayPalClient();
        const response = await client.execute(request);
        return {
            success: true,
            data: response.result
        };
    } catch (error) {
        console.error('Error capturing payment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get PayPal access token
async function getAccessToken() {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const baseURL = process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    try {
        const response = await axios.post(
            `${baseURL}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

// Verify webhook authenticity
async function verifyWebhookSignature(webhookEvent, headers) {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    if (!webhookId) {
        console.warn('⚠️ PAYPAL_WEBHOOK_ID not configured, skipping verification');
        return true; // In development, accept without verification
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
        return false;
    }

    const baseURL = process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const verificationData = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: webhookEvent
    };

    try {
        const response = await axios.post(
            `${baseURL}/v1/notifications/verify-webhook-signature`,
            verificationData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data.verification_status === 'SUCCESS';
    } catch (error) {
        console.error('Error verifying webhook:', error.response?.data || error.message);
        return false;
    }
}

// Calculate expiration date
function calculateExpirationDate(plan) {
    const now = new Date();
    
    switch(plan.toLowerCase()) {
        case 'monthly':
            now.setMonth(now.getMonth() + 1);
            break;
        case 'quarterly':
            now.setMonth(now.getMonth() + 3);
            break;
        case 'annual':
            now.setFullYear(now.getFullYear() + 1);
            break;
        default:
            now.setMonth(now.getMonth() + 1);
    }
    
    return now;
}

module.exports = {
    createOrder,
    capturePayment,
    verifyWebhookSignature,
    calculateExpirationDate,
    getAccessToken
};