const Product = require('../models/Product');
const Stuff = require('../models/Stuff');
const Medicine = require('../models/Medicine');
const Newi = require('../models/Newi');
const { multipleMongooseToObject } = require('../../util/mongoose');

class MeController {
  // GET /me/stored/products
  storedProducts(req, res, next) {
    Product.find({})
      .then(products => res.render('me/stored-products', {
        products: multipleMongooseToObject(products)
      }))
      .catch(next);
  }

  storedStuffs(req, res, next) {
    Stuff.find({})
      .then(stuffs => res.render('me/stored-stuffs', {
        stuffs: multipleMongooseToObject(stuffs)
      }))
      .catch(next);
  }
  
  storedMedicines(req, res, next) {
    Medicine.find({})
      .then(medicines => res.render('me/stored-medicines', {
        medicines: multipleMongooseToObject(medicines)
      }))
      .catch(next);
  }

  storedNewis(req, res, next) {
    Newi.find({})
      .then(newis => res.render('me/stored-newis', {
        newis: multipleMongooseToObject(newis)
      }))
      .catch(next);
  }
}

module.exports = new MeController();
