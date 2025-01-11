const express = require('express');
//const app = express();
const router = express.Router();

const newiController = require('../app/controllers/NewiController');
const upload = require('../middleware/uploadMiddleware');

//ProductsController.index

router.get('/newicreate', newiController.newicreateShow);
router.post('/store', upload.single('image'), newiController.newistore);
router.get('/:id/newi-edit', newiController.newiEdit);
router.put('/:id', upload.single('image'), newiController.newiUpdate);
router.delete('/:id', newiController.newiDelete);
router.get('/:slug', newiController.newiShow);
router.get('/', newiController.newi);

module.exports = router;