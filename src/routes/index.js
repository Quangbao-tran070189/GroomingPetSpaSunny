const express = require('express');
const router = express.Router();

const meRouter = require('./me');
const productsRouter = require('./products');
const stuffsRouter = require('./stuffs');
const medicinesRouter = require('./medicines');
const newisRouter = require('./newis');
//const newisRouter = require('./abouts');
const siteRouter = require('./site');
const usersRouter = require('./users');
const adminRouter = require('./admin');
//const sitemapRoute = require('./routes/sitemap');
const sitemapRoute = require('./sitemap'); // Adjust path if needed

//app.use(sitemapRoute);

function route(app) {
  app.use('/me', meRouter);
  app.use('/products', productsRouter);
  app.use('/stuffs', stuffsRouter);
  app.use('/medicines', medicinesRouter);
  app.use('/newis', newisRouter);
  //app.use('/abouts', aboutsRouter);
  app.use('/users', usersRouter);
  app.use('/admin', adminRouter);
  //app.use('/abouts', siteRouter);
  app.use('/', siteRouter);
  app.use('/sitemap.xml', sitemapRoute); // Register the sitemap route
}

module.exports = route;
