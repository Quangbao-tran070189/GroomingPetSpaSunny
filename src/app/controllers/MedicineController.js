const Medicine = require('../models/Medicine');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class MedicineController {
  // GET /stuffs
  medicine(req, res, next) {
    Medicine.find({})
          .then(medicines => {
            res.render('medicines', {
              medicines: multipleMongooseToObject(medicines)
            });
          })
          .catch(next);

  }
  // GET /stuffs/:slug
  medicineShow(req, res, next) {
    Medicine.findOne({ slug: req.params.slug })
      .then(medicine => 
        res.render('./medicines/medicines.handlebars', { medicine: mongooseToObject(medicine) })
      )
      .catch(next);
  }

  // GET /stuffs/create
  medicinecreateShow(req, res, next) {
    res.render('./medicines/medicinecreate');
  }

  // POST /stuffs/store
  async medicinestore(req, res, next) {
    console.log('Received POST request:', req.body);
    console.log('Uploaded file:', req.file);

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'medicines'
      });

      const medicineData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        origin: req.body.origin,
        image: result.secure_url // URL ảnh từ Cloudinary
      };

      const medicine = new Medicine(medicineData);
      await medicine.save();
      res.redirect('/medicines');
    } catch (err) {
      console.log('Error while saving medicine:', err);
      next(err);
    }
  }

  // GET /stuffs/:id/stuff-edit
  medicineEdit(req, res, next) {
    Medicine.findById(req.params.id)
      .then(medicine => res.render('medicines/medicines-edit', {
        medicine: mongooseToObject(medicine)
      }))
      .catch(next);
  }

  // PUT /stuffs/:id
  async medicineUpdate(req, res, next) {
    console.log('Updated medicine Data:', req.body, req.file);

    const updatedMedicineData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      origin: req.body.origin,
      image: req.file ? (await cloudinary.uploader.upload(req.file.path, {
        folder: 'medicines'
      })).secure_url : req.body.image // Kiểm tra xem có file mới hay không
    };

    try {
      await Medicine.updateOne({ _id: req.params.id }, updatedMedicineData);
      res.redirect('/me/stored/medicines');
    } catch (err) {
      console.log('Error while updating medicine:', err);
      next(err);
    }
  }

  // DELETE /medicines/:id
  medicineDelete(req, res, next) {
    Medicine.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }
}

module.exports = new MedicineController();
