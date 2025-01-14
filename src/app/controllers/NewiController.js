const Newi = require('../models/Newi');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class NewiController {
  //GET /newis
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

  //GET /newis/:slug
  newiShow(req, res, next) {
    Newi.findOne({ slug: req.params.slug })
      .then(newi => 
        res.render('./newis/newis.handlebars', { newi: mongooseToObject(newi) })
      )
      .catch(next);
  }

  //GET /newis/create
  newicreateShow(req, res, next) {
    res.render('./newis/newicreate');
  }

  //POST /newis/store
  async newistore(req, res, next) {
    console.log('Received POST request:', req.body);
    console.log('Uploaded file:', req.file);

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'newis'
      });

      const newiData = {
        name: req.body.name,
        description: req.body.description,
        origin: req.body.origin,
        image: result.secure_url // URL ảnh từ Cloudinary
      };

      const newi = new Newi(newiData);
      await newi.save();
      res.redirect('/newis');
    } catch (err) {
      console.log('Error while saving newi:', err);
      next(err);
    }
  }

  //GET /newis/:id/newi-edit
  newiEdit(req, res, next) {
    Newi.findById(req.params.id)
      .then(newi => res.render('newis/newis-edit', {
        newi: mongooseToObject(newi)
      }))
      .catch(next);
  }

  //PUT /newis/:id
  async newiUpdate(req, res, next) {
    console.log('Updated newi Data:', req.body, req.file);

    const updatedNewiData = {
      name: req.body.name,
      description: req.body.description,
      origin: req.body.origin,
      image: req.file ? (await cloudinary.uploader.upload(req.file.path, {
        folder: 'newis'
      })).secure_url : req.body.image // Kiểm tra xem có file mới hay không
    };

    try {
      await Newi.updateOne({ _id: req.params.id }, updatedNewiData);
      res.redirect('/me/stored/newis');
    } catch (err) {
      console.log('Error while updating newi:', err);
      next(err);
    }
  }

  //DELETE /newis/:id
  newiDelete(req, res, next) {
    Newi.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }
}

module.exports = new NewiController();
