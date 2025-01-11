const express = require('express');
//const app = express();
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const upload = require('../middleware/uploadMiddleware'); //upload image



//ProductsController.index
router.post('/store', upload.single('image'), productController.productstore); //upload image
router.get('/productcreate', productController.productcreateShow);
router.post('/store', productController.productstore);
router.get('/:id/product-edit', productController.productEdit);
router.put('/:id', upload.single('image'), productController.productUpdate);
router.delete('/:id', productController.productDelete);
router.get('/:slug', productController.productShow);
router.get('/', productController.product);

module.exports = router;
