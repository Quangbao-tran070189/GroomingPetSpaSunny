const Stuff = require('../models/Stuff');
const { mongooseToObject } = require('../../util/mongoose');
const { multipleMongooseToObject } = require('../../util/mongoose');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class StuffController {
  // GET /stuffs
  stuff(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    Stuff.find({})
      .skip(skip)
      .limit(limit)
      .then(stuffs => {
        console.log(stuffs); // Kiểm tra dữ liệu
        Stuff.countDocuments().then(count => {
          res.render('stuffs', {
            stuffs: multipleMongooseToObject(stuffs),
            currentPage: page,
            totalPages: Math.ceil(count / limit)
          });
        });
      })
      .catch(next);
  }

  // GET /stuffs/:slug
  stuffShow(req, res, next) {
    Stuff.findOne({ slug: req.params.slug })
      .then(stuff => 
        res.render('./stuffs/stuff.handlebars', { stuff: mongooseToObject(stuff) })
      )
      .catch(next);
  }

  // GET /stuffs/create
  stuffcreateShow(req, res, next) {
    res.render('./stuffs/stuffcreate');
  }

  // POST /stuffs/store
  async stuffstore(req, res, next) {
    console.log('Received POST request:', req.body);
    console.log('Uploaded file:', req.file);

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'stuffs'
      });

      const stuffData = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        origin: req.body.origin,
        image: result.secure_url // URL ảnh từ Cloudinary
      };

      const stuff = new Stuff(stuffData);
      await stuff.save();
      res.redirect('/stuffs');
    } catch (err) {
      console.log('Error while saving stuff:', err);
      next(err);
    }
  }

  // GET /stuffs/:id/stuff-edit
  stuffEdit(req, res, next) {
    Stuff.findById(req.params.id)
      .then(stuff => res.render('stuffs/stuff-edit', {
        stuff: mongooseToObject(stuff)
      }))
      .catch(next);
  }

  // PUT /stuffs/:id
  async stuffUpdate(req, res, next) {
    console.log('Updated stuff Data:', req.body, req.file);

    const updatedStuffData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      origin: req.body.origin,
      image: req.file ? (await cloudinary.uploader.upload(req.file.path, {
        folder: 'stuffs'
      })).secure_url : req.body.image // Kiểm tra xem có file mới hay không
    };

    try {
      await Stuff.updateOne({ _id: req.params.id }, updatedStuffData);
      res.redirect('/me/stored/stuffs');
    } catch (err) {
      console.log('Error while updating stuff:', err);
      next(err);
    }
  }

  // DELETE /stuffs/:id
  stuffDelete(req, res, next) {
    Stuff.deleteOne({ _id: req.params.id })
      .then(() => res.redirect('back'))
      .catch(next);
  }
}

module.exports = new StuffController();
