const express = require('express');
const router = express.Router();

const stuffController = require('../app/controllers/StuffController');
const upload = require('../middleware/uploadMiddleware'); // Middleware để upload image

// Định tuyến
router.post('/store', upload('stuffs').single('image'), stuffController.stuffstore);
router.get('/stuffcreate', stuffController.stuffcreateShow);
router.get('/:id/stuff-edit', stuffController.stuffEdit);
router.put('/:id', upload('stuffs').single('image'), stuffController.stuffUpdate);
router.delete('/:id', stuffController.stuffDelete);
router.get('/:slug', stuffController.stuffShow);
router.get('/', stuffController.stuff);

module.exports = router;
