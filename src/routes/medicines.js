const express = require('express');
//const app = express();
const router = express.Router();

const medicineController = require('../app/controllers/MedicineController');
const upload = require('../middleware/uploadMiddleware'); //upload image


//ProductsController.index
router.post('/store', upload.single('image'), medicineController.medicinestore); //upload image
router.get('/medicinecreate', medicineController.medicinecreateShow);
router.post('/store', medicineController.medicinestore);
router.get('/:id/medicine-edit', medicineController.medicineEdit);
router.put('/:id', upload.single('image'), medicineController.medicineUpdate);
router.delete('/:id', medicineController.medicineDelete);
router.get('/:slug', medicineController.medicineShow);
router.get('/', medicineController.medicine);

module.exports = router;
