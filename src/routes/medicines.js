const express = require('express');
const router = express.Router();

const medicineController = require('../app/controllers/MedicineController');
const upload = require('../middleware/uploadMiddleware'); // Middleware để upload image

// Định tuyến
router.post('/store', upload('medicines').single('image'), medicineController.medicinestore);
router.get('/medicinecreate', medicineController.medicinecreateShow);
router.get('/:id/medicine-edit', medicineController.medicineEdit);
router.put('/:id', upload('medicines').single('image'), medicineController.medicineUpdate);
router.delete('/:id', medicineController.medicineDelete);
router.get('/:slug', medicineController.medicineShow);
router.get('/', medicineController.medicine);

module.exports = router;
