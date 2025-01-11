//news

const Newi = require('../models/Newi');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');

class ProductController {
  //GET / news
  newi(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    Newi.find({})
      .skip(skip)
      .limit(limit)
      .then(newis => {
        console.log(newis); // Kiểm tra dữ liệu
        Newi.countDocuments().then(count => {
          res.render('newis', {
            newis: multipleMongooseToObject(newis),
            currentPage: page,
            totalPages: Math.ceil(count / limit)
          });
        });
      })
      .catch(next);
}


  //GET /products/:slug
    newiShow(req, res, next) {
  
      Newi.findOne({ slug: req.params.slug })
      .then(newi => 
        res.render('./newis/newis.handlebars', { newi: mongooseToObject(newi) })
      )
      .catch(next);
    }

    
    // [GET]  products/create
    newicreateShow(req, res, next) {
        res.render('./newis/newicreate');
      }
    

      // [POST]  stuffs/store
      newistore(req, res, next) { 
          const newiData = { 
                  name: req.body.name, 
                  description: req.body.description, 
                  origin: req.body.origin, 
                  image: req.file.filename }; 
            const newi = new Newi(newiData); 
            newi.save() 
            .then(() => res.redirect('/newis')) 
            .catch(next);
          }
    
      //[GET]  /products/:id/product-edit
      newiEdit(req, res, next) {
        Newi.findById(req.params.id)
        .then(newi => res.render('newis/newis-edit', {
          newi: mongooseToObject(newi)
        }))
        .catch(next);
      }
    
      //[PUT] /products/:id
      newiUpdate(req, res, next) { 
        console.log('Updated newi Data:', req.body, req.file);
        const updatedNewiData = { 
          name: req.body.name, 
          description: req.body.description, 
          origin: req.body.origin, 
          image: req.file ? req.file.filename : req.body.image // Kiểm tra xem có file mới hay không 
          }; 
          Newi.updateOne({ _id: req.params.id }, updatedNewiData) 
          .then(() => res.redirect('/me/stored/newis')) 
          .catch(next); 
        }

       //[DELETE] /products/:id
        newiDelete(req, res, next) {
          Newi.deleteOne({ _id: req.params.id })
          .then(() => res.redirect('back'))
          .catch(next);
        } 
            

  //GET /news/:slug
  //stuffsShow(req, res) {
  //  res.send('');
  //}
}

module.exports = new ProductController();