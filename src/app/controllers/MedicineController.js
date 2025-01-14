const Medicine = require('../models/Medicine');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');

class MedicineController {
  // GET /medicines
  medicine(req, res, next) {
    Medicine.find({})
      .then(medicines => {
        res.render('medicines', {
          medicines: multipleMongooseToObject(medicines)
        });
      })
      .catch(next);
  }

  // GET /medicines/:slug
  medicineShow(req, res, next) {
    Medicine.findOne({ slug: req.params.slug })
      .then(medicine => 
        res.render('./medicines/medicines.handlebars', { medicine: mongooseToObject(medicine) })
      )
      .catch(next);
  }

  // GET /medicines/create
  medicinecreateShow(req, res, next) {
    res.render('./medicines/medicinecreate');
  }

  // POST /medicines/store
  medicinestore(req, res, next) {
    console.log('Received POST request:', req.body);
    console.log('Uploaded file:', req.file);

    const medicineData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      origin: req.body.origin,
      image: req.file.path // URL ảnh từ Cloudinary
    };
    const medicine = new Medicine(medicineData);
    medicine.save()
      .then(() => res.redirect('/medicines'))
      .catch((err) => {
        console.log('Error while saving medicine:', err);
        next(err);
      });
  }

  // GET /medicines/:id/medicine-edit
  medicineEdit(req, res, next) {
    Medicine.findById(req.params.id)
      .then(medicine => res.render('medicines/medicines-edit', {
        medicine: mongooseToObject(medicine)
      }))
      .catch(next);
  }

  // PUT /medicines/:id
  medicineUpdate(req, res, next) {
    console.log('Updated Medicine Data:', req.body, req.file);
    const updatedMedicineData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      origin: req.body.origin,
      image: req.file ? req.file.path : req.body.image // Kiểm tra xem có file mới hay không
    };
    Medicine.updateOne({ _id: req.params.id }, updatedMedicineData)
      .then(() => res.redirect('/me/stored/medicines'))
      .catch(next);
  }

  // DELETE /medicines/:id
  medicineDelete(req, res, next) {
    Medicine.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }
}

module.exports = new MedicineController();
