const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const upload = require('../middleware/uploadMiddleware'); // Middleware để upload image

// Định tuyến
router.post('/store', upload('products').single('image'), productController.productstore);
router.get('/productcreate', productController.productcreateShow);
router.get('/:id/product-edit', productController.productEdit);
router.put('/:id', upload('products').single('image'), productController.productUpdate);
router.delete('/:id', productController.productDelete);
router.get('/:slug', productController.productShow);
router.get('/', productController.product);

module.exports = router;
