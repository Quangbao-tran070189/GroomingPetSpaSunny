//news

const Product = require('../models/Product');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');

class ProductController {
  //GET / news
  product(req, res, next) {
    Product.find({})
      .then(products => {
        res.render('products', {
          products: multipleMongooseToObject(products)
        });
      })
      .catch(next);
  }

  //GET /products/:slug
    productShow(req, res, next) {
  
      Product.findOne({ slug: req.params.slug })
      .then(product => 
        res.render('./products/products.handlebars', { product: mongooseToObject(product) })
      )
      .catch(next);
    }

    
    // [GET]  products/create
    productcreateShow(req, res, next) {
        res.render('./products/productcreate');
      }
    

      // [POST]  stuffs/store
      productstore(req, res, next) { 
          const productData = { 
                  name: req.body.name, 
                  description: req.body.description, 
                  price: req.body.price, 
                  origin: req.body.origin, 
                  image: req.file.filename }; 
            const product = new Product(productData); 
            product.save() 
            .then(() => res.redirect('/products')) 
            .catch(next);
          }
    
      //[GET]  /products/:id/product-edit
      productEdit(req, res, next) {
        Product.findById(req.params.id)
        .then(product => res.render('products/products-edit', {
          product: mongooseToObject(product)
        }))
        .catch(next);
      }
    
      //[PUT] /products/:id
      productUpdate(req, res, next) { 
        console.log('Updated Product Data:', req.body, req.file);
        const updatedProductData = { 
          name: req.body.name, 
          description: req.body.description, 
          price: req.body.price, 
          origin: req.body.origin, 
          image: req.file ? req.file.filename : req.body.image // Kiểm tra xem có file mới hay không 
          }; 
          Product.updateOne({ _id: req.params.id }, updatedProductData) 
          .then(() => res.redirect('/me/stored/products')) 
          .catch(next); 
        }

       //[DELETE] /products/:id
        productDelete(req, res, next) {
          Product.deleteOne({ _id: req.params.id })
          .then(() => res.redirect('back'))
          .catch(next);
        } 
            

  //GET /news/:slug
  //stuffsShow(req, res) {
  //  res.send('');
  //}
}

module.exports = new ProductController();