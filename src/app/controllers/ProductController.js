const Product = require('../models/Product');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class ProductController {
  //GET /products
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

  //GET /products/create
  productcreateShow(req, res, next) {
    res.render('./products/productcreate');
  }

  //POST /products/store
  async productstore(req, res, next) {
    console.log('Received POST request:', req.body);
    console.log('Uploaded file:', req.file);

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'products'
      });

      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        origin: req.body.origin,
        image: result.secure_url // URL ảnh từ Cloudinary
      };

      const product = new Product(productData);
      await product.save();
      res.redirect('/products');
    } catch (err) {
      console.log('Error while saving product:', err);
      next(err);
    }
  }

  //GET /products/:id/product-edit
  productEdit(req, res, next) {
    Product.findById(req.params.id)
      .then(product => res.render('products/products-edit', {
        product: mongooseToObject(product)
      }))
      .catch(next);
  }

  //PUT /products/:id
  async productUpdate(req, res, next) {
    console.log('Updated Product Data:', req.body, req.file);

    const updatedProductData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      origin: req.body.origin,
      image: req.file ? (await cloudinary.uploader.upload(req.file.path, {
        folder: 'products'
      })).secure_url : req.body.image // Kiểm tra xem có file mới hay không
    };

    try {
      await Product.updateOne({ _id: req.params.id }, updatedProductData);
      res.redirect('/me/stored/products');
    } catch (err) {
      console.log('Error while updating product:', err);
      next(err);
    }
  }

  //DELETE /products/:id
  productDelete(req, res, next) {
    Product.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }
}

module.exports = new ProductController();
