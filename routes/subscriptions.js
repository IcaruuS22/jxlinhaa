const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// GET /api/subscription-status/:email
// Check if user has active subscription
router.get('/subscription-status/:email', async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email not provided'
            });
        }

        // Search for user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.json({
                success: true,
                hasActiveSubscription: false,
                message: 'User not found'
            });
        }

        // Search for active and non-expired subscription
        const now = new Date();
        const subscription = await Subscription.findOne({
            where: {
                user_id: user.id,
                status: 'active',
                expires_at: {
                    [Op.gt]: now // Greater than now (not expired)
                }
            },
            order: [['created_at', 'DESC']]
        });

        if (subscription) {
            res.json({
                success: true,
                hasActiveSubscription: true,
                subscription: {
                    plan: subscription.plan,
                    price: subscription.price,
                    expires_at: subscription.expires_at,
                    created_at: subscription.created_at
                }
            });
        } else {
            res.json({
                success: true,
                hasActiveSubscription: false,
                message: 'No active subscription found'
            });
        }

    } catch (error) {
        console.error('Error in subscription-status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/subscriptions (Admin - list all)
router.get('/subscriptions', async (req, res) => {
    try {
        const subscriptions = await Subscription.findAll({
            include: [User],
            order: [['created_at', 'DESC']],
            limit: 100
        });

        res.json({
            success: true,
            count: subscriptions.length,
            subscriptions: subscriptions
        });

    } catch (error) {
        console.error('Error listing subscriptions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/check-and-expire
// Verificar e expirar assinaturas vencidas (Cron job pode chamar)
router.post('/check-and-expire', async (req, res) => {
    try {
        const now = new Date();

        const result = await Subscription.update(
            { status: 'expired' },
            {
                where: {
                    status: 'active',
                    expires_at: {
                        [Op.lt]: now // Menor que agora (expirou)
                    }
                }
            }
        );

        console.log(`⏰ ${result[0]} assinaturas expiradas`);

        res.json({
            success: true,
            expired_count: result[0]
        });

    } catch (error) {
        console.error('Erro ao expirar subscriptions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


