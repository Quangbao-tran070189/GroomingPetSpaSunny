//news

const Stuff = require('../models/Stuff');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');

class StuffController {
  //GET / news
  stuff(req, res, next) {
    Stuff.find({})
      .then(stuffs => {
        res.render('stuffs', {
          stuffs: multipleMongooseToObject(stuffs)
        });
      })
      .catch(next);
  }

  //GET /products/:slug
    stuffShow(req, res, next) {
  
      Stuff.findOne({ slug: req.params.slug })
      .then(stuff => 
        res.render('./stuffs/stuffs.handlebars', { stuff: mongooseToObject(stuff) })
      )
      .catch(next);
    }

    
    // [GET]  products/create
    stuffcreateShow(req, res, next) {
        res.render('./stuffs/stuffcreate');
      }
    

      // [POST]  stuffs/store
      stuffstore(req, res, next) { 
          const stuffData = { 
                  name: req.body.name, 
                  description: req.body.description, 
                  price: req.body.price, 
                  origin: req.body.origin, 
                  image: req.file.filename }; 
            const stuff = new Stuff(stuffData); 
            stuff.save() 
            .then(() => res.redirect('/stuffs')) 
            .catch(next);
          }
    
      //[GET]  /products/:id/product-edit
      stuffEdit(req, res, next) {
        Stuff.findById(req.params.id)
        .then(stuff => res.render('stuffs/stuffs-edit', {
          stuff: mongooseToObject(stuff)
        }))
        .catch(next);
      }
    
      //[PUT] /products/:id
      stuffUpdate(req, res, next) { 
              console.log('Updated Stuff Data:', req.body, req.file);
              const updatedStuffData = { 
                name: req.body.name, 
                description: req.body.description, 
                price: req.body.price, 
                origin: req.body.origin, 
                image: req.file ? req.file.filename : req.body.image // Kiểm tra xem có file mới hay không 
                }; 
                Stuff.updateOne({ _id: req.params.id }, updatedStuffData) 
                .then(() => res.redirect('/me/stored/stuffs')) 
                .catch(next); 
              }

       //[DELETE] /products/:id
        stuffDelete(req, res, next) {
          Stuff.deleteOne({ _id: req.params.id })
          .then(() => res.redirect('back'))
          .catch(next);
        } 
            

  //GET /news/:slug
  //stuffsShow(req, res) {
  //  res.send('');
  //}
}

module.exports = new StuffController();