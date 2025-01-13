const express = require('express');
const router = express.Router();

const medicineController = require('../app/controllers/MedicineController');

// Định tuyến
router.post('/store', medicineController.medicinestore);
router.get('/medicinecreate', medicineController.medicinecreateShow);
router.get('/:id/medicine-edit', medicineController.medicineEdit);
router.put('/:id', medicineController.medicineUpdate);
router.delete('/:id', medicineController.medicineDelete);
router.get('/:slug', medicineController.medicineShow);
router.get('/', medicineController.medicine);

module.exports = router;
