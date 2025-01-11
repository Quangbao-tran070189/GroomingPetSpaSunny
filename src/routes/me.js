const express = require('express');
//const app = express();
const router = express.Router();

const meController = require('../app/controllers/MeController');

//ProductsController.index
router.get('/stored/newis', meController.storedNewis);
router.get('/stored/products', meController.storedProducts);
router.get('/stored/stuffs', meController.storedStuffs);
router.get('/stored/medicines', meController.storedMedicines);

module.exports = router;
