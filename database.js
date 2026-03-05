const { Sequelize } = require('sequelize');

// Database configuration
let sequelize;

if (process.env.DATABASE_URL) {
    // Connect to PostgreSQL (Supabase/Vercel/Render)
    // Add ?sslmode=no-verify if needed, but Sequelize handles it via dialectOptions
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            },
            keepAlive: true
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


