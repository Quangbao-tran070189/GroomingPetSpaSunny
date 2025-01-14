const express = require('express');
const router = express.Router();

const newiController = require('../app/controllers/NewiController');
const upload = require('../middleware/uploadMiddleware'); // Middleware để upload image

// Định tuyến
router.get('/newicreate', newiController.newicreateShow);
router.post('/store', upload('newis').single('image'), newiController.newistore);
router.get('/:id/newi-edit', newiController.newiEdit);
router.put('/:id', upload('newis').single('image'), newiController.newiUpdate);
router.delete('/:id', newiController.newiDelete);
router.get('/:slug', newiController.newiShow);
router.get('/', newiController.newi);

module.exports = router;
