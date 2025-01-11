//Home, search, contact

//const Product = require('../models/Product');



class SiteController {

  


  //GET / news
 //[GET] /
    
    //async index(req, res) {
    //    try {
    //        const Courses = await Course.find({});
    //        res.json(Courses);
    //    } catch (err) {
    //        res.status(400).json({ err: 'ERROR!!!' });
    //    }
        // res.render('home');
    //}

    //GET /home
  index(req, res) {
    res.render('home');
  }

  abouts(req, res) {
    res.render('abouts');
  }
  //GET /search
  //about(req, res) {
    //res.render('about');
  //}
}

//Để những site tương tự tại đây: Contact ...
//site: introduce

module.exports = new SiteController();
