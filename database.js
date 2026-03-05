const { Sequelize } = require('sequelize');

// Database configuration
let sequelize;

if (process.env.DATABASE_URL) {
    // Connect to PostgreSQL (Supabase/Vercel/Render)
    // IMPORTANT: Render has issues connecting to Supabase via IPv6.
    // We force IPv4 by adding ?sslmode=require if not present and ensuring the host is correct.
    let dbUrl = process.env.DATABASE_URL;
    
    // If the URL is from Supabase and doesn't have a mode, we can try to append settings
    // though Sequelize usually handles this via dialectOptions below.
    
    sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            keepAlive: true,
            // This is a crucial fix for ENETUNREACH on some environments (IPv6 vs IPv4)
            family: 4 
        },
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    });
} else {
    // Local SQLite
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false,
        define: {
            timestamps: true,
            underscored: true
        }
    });
}

// Test connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully!');
    } catch (error) {
        console.error('❌ Error connecting to database:', error);
    }
}

// Sync database
async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized!');
    } catch (error) {
        console.error('❌ Error synchronizing database:', error);
    }
}

module.exports = { sequelize, testConnection, syncDatabase };


