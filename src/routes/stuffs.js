const express = require('express');
//const app = express();
const router = express.Router();

const stuffController = require('../app/controllers/StuffController');
const upload = require('../middleware/uploadMiddleware'); //upload image


//ProductsController.index
router.post('/store', upload.single('image'), stuffController.stuffstore); //upload image
router.get('/stuffcreate', stuffController.stuffcreateShow);
router.post('/store', stuffController.stuffstore);
router.get('/:id/stuff-edit', stuffController.stuffEdit);
router.put('/:id', upload.single('image'), stuffController.stuffUpdate);
router.delete('/:id', stuffController.stuffDelete);
router.get('/:slug', stuffController.stuffShow);
router.get('/', stuffController.stuff);

module.exports = router;
