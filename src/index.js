require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Handlebars Configuration
const hbs = exphbs.create({
    partialsDir: path.join(__dirname, 'resources', 'views', 'partials'),
    extname: '.handlebars',
    helpers: {
        ifCond: function (v1, operator, v2, options) {
            switch (operator) {
                case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                default: return options.inverse(this);
            }
        },
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
        eq: (a, b) => a == b,
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        range: (start, end) => {
            let array = [];
            for (let i = start; i <= end; i++) {
                array.push(i);
            }
            return array;
        },
        formatDate: (date) => {
            return new Date(date).toLocaleDateString('vi-VN');
        },
        formatCurrency: (number) => {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(number);
        },
        truncate: (str, len) => {
            if (str && str.length > len) {
                return str.substring(0, len) + '...';
            }
            return str;
        }
    }
});

const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Running in ${nodeEnv} mode`);

const route = require('./routes/index');
const db = require('./config/db');

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:"]
        }
    }
}));

// Passport Configuration
require('./config/passport')(passport);

// Database Connection
db.connect().then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware Setup
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        mongooseConnection: mongoose.connection,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: nodeEnv === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Template Engine Setup
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Sitemap Route
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Routes Initialization
route(app);

// Error Handling
app.use((req, res, next) => {
    res.status(404).render('404', {
        title: '404 - Không tìm thấy trang',
        layout: 'main'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', {
        title: '500 - Lỗi máy chủ',
        layout: 'main'
    });
});

// Graceful Shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
}

// Start Server
const server = app.listen(port, () => {
    console.log(`Server is running in ${nodeEnv} mode at http://localhost:${port}`);
});