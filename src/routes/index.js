const express = require('express');
const router = express.Router();
const cors = require('cors');
const debug = require('debug')('app:routes');

// Import route modules
const meRouter = require('./me');
const productsRouter = require('./products');
const stuffsRouter = require('./stuffs');
const medicinesRouter = require('./medicines');
const newisRouter = require('./newis');
const siteRouter = require('./site');
const usersRouter = require('./users');
const adminRouter = require('./admin');
const sitemapRoute = require('./sitemap');

// Auth middleware
const { ensureAuthenticated } = require('../config/auth');

// Configuration
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || 100; // 100 requests
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = function route(app) {
    // Enable CORS
    const corsOptions = {
        origin: NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sunnypetspabaria.vn',
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    };
    app.use(cors(corsOptions));

    // API Health Check
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    // Public routes
    app.use('/', siteRouter);
    app.use('/products', productsRouter);
    app.use('/stuffs', stuffsRouter);
    app.use('/medicines', medicinesRouter);
    app.use('/newis', newisRouter);
    app.use('/sitemap.xml', sitemapRoute);

    // Protected routes
    app.use('/me', ensureAuthenticated, meRouter);
    app.use('/users', ensureAuthenticated, usersRouter);
    app.use('/admin', ensureAuthenticated, adminRouter);

    // Rate limiting for API routes
    const rateLimit = require('express-rate-limit');
    const apiLimiter = rateLimit({
        windowMs: RATE_LIMIT_WINDOW,
        max: RATE_LIMIT_MAX,
        message: 'Too many requests, please try again later.'
    });
    app.use('/api', apiLimiter);

    // Centralized error handling
    app.use(require('../middleware/errorHandler'));
};