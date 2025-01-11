//Home, search, contact

const express = require('express');
//const app = express();
const router = express.Router();

const siteController = require('../app/controllers/SiteController');

//newsController.index
//site contact
//router.get('/product', siteController.product);
//router.get('/search', siteController.search); //site search
router.get('/abouts', siteController.abouts);
router.get('/', siteController.index); //site home

module.exports = router;
