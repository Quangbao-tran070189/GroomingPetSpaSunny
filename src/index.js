require('dotenv').config();

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const app = express();

const hbs = exphbs.create({
    partialsDir: path.join(__dirname, 'resources', 'views', 'partials'),
    extname: '.handlebars',
    helpers: {
        ifCond: function(v1, operator, v2, options) {
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
        }
    }
});

const port = process.env.PORT || 3000;

const route = require('./routes/index');
const db = require('./config/db'); // Đường dẫn tới file db

// Passport Config
require('./config/passport')(passport);

// Connect to DB
db.connect().then(() => {
  console.log('Connected to MongoDB successfully');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// HTTP logger
app.use(morgan('combined'));

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables for flash messages and user
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Template engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'resources', 'views'));

// Routes initialization
route(app);

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
