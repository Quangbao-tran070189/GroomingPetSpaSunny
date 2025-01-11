//news

const Medicine = require('../models/Medicine');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');

class MedicineController {
  //GET / news
  medicine(req, res, next) {
    Medicine.find({})
      .then(medicines => {
        res.render('medicines', {
          medicines: multipleMongooseToObject(medicines)
        });
      })
      .catch(next);
  }

  //GET /products/:slug
    medicineShow(req, res, next) {
  
      Medicine.findOne({ slug: req.params.slug })
      .then(medicine => 
        res.render('./medicines/medicines.handlebars', { medicine: mongooseToObject(medicine) })
      )
      .catch(next);
    }

    
    // [GET]  products/create
    medicinecreateShow(req, res, next) {
        res.render('./medicines/medicinecreate');
      }
    

      // [POST]  medicines/store
      medicinestore(req, res, next) { 
          const medicineData = { 
            name: req.body.name, description: req.body.description, 
            price: req.body.price, origin: req.body.origin, 
            image: req.file.filename }; 
            const medicine = new Medicine(medicineData); 
            medicine.save() 
            .then(() => res.redirect('/medicines')) 
            .catch(next);
          }
    
      //[GET]  /products/:id/product-edit
      medicineEdit(req, res, next) {
        Medicine.findById(req.params.id)
        .then(medicine => res.render('medicines/medicines-edit', {
          medicine: mongooseToObject(medicine)
        }))
        .catch(next);
      }
    
      //[PUT] /products/:id
      medicineUpdate(req, res, next) { 
              console.log('Updated Medicine Data:', req.body, req.file);
              const updatedMedicineData = { 
                name: req.body.name, 
                description: req.body.description, 
                price: req.body.price, 
                origin: req.body.origin, 
                image: req.file ? req.file.filename : req.body.image // Kiểm tra xem có file mới hay không 
                }; 
                Medicine.updateOne({ _id: req.params.id }, updatedMedicineData) 
                .then(() => res.redirect('/me/stored/products')) 
                .catch(next); 
              }

       //[DELETE] /products/:id
        medicineDelete(req, res, next) {
          Medicine.deleteOne({ _id: req.params.id })
          .then(() => res.redirect('back'))
          .catch(next);
        } 
            

  //GET /news/:slug
  //stuffsShow(req, res) {
  //  res.send('');
  //}
}

module.exports = new MedicineController();