const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Product = new Schema({
    name: { type: String, maxLength: 255 },
    description: { type: String},
    price: { type: String },
    origin: { type: String },
    image: { type: String },
    slug: { type: String, slug: 'name'},
  }, {
    timestamps: true,
  });

  module.exports = mongoose.model('Product', Product);