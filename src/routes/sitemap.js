const router = require('express').Router();
const { SitemapStream, streamToPromise } = require('sitemap');
const db = require('../config/db'); // Giả sử bạn có file config db

router.get('/', async (req, res) => { // Changed the route to '/'
  try {
    const smStream = new SitemapStream({
      hostname: 'https://sunnypetspabaria.vn/', // Thay bằng hostname của bạn
      cacheTime: 600000, // 600 sec - cache purge after 10 min
    });

    // URL tĩnh
    smStream.write({ url: 'https://sunnypetspabaria.vn/', changefreq: 'daily', priority: 1, lastmod: new Date().toISOString() });
    smStream.write({ url: 'https://sunnypetspabaria.vn/products', changefreq: 'weekly', priority: 0.8, lastmod: new Date().toISOString() });
    smStream.write({ url: 'https://sunnypetspabaria.vn/stuffs', changefreq: 'weekly', priority: 0.8, lastmod: new Date().toISOString() });
    smStream.write({ url: 'https://sunnypetspabaria.vn/medicines', changefreq: 'weekly', priority: 0.8, lastmod: new Date().toISOString() });
    smStream.write({ url: 'https://sunnypetspabaria.vn/newis', changefreq: 'weekly', priority: 0.8, lastmod: new Date().toISOString() });
    smStream.write({ url: 'https://sunnypetspabaria.vn/abouts', changefreq: 'monthly', priority: 0.5, lastmod: new Date().toISOString() });

    // Truy vấn cơ sở dữ liệu để lấy danh sách sản phẩm
    const products = await db.query('SELECT slug, updated_at FROM products'); // Thay bằng câu query của bạn
    products.rows.forEach((product) => {
      smStream.write({
        url: `https://sunnypetspabaria.vn/product/${product.slug}`, // Sửa thành URL tĩnh
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: product.updated_at ? new Date(product.updated_at).toISOString() : new Date().toISOString() // Thêm lastmod
      });
    });

    // Truy vấn cơ sở dữ liệu để lấy danh sách phụ kiện
    const stuffs = await db.query('SELECT slug, updated_at FROM stuffs'); // Thay bằng câu query của bạn
    stuffs.rows.forEach((stuff) => {
      smStream.write({
        url: `https://sunnypetspabaria.vn/stuff/${stuff.slug}`, // Sửa thành URL tĩnh
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: stuff.updated_at ? new Date(stuff.updated_at).toISOString() : new Date().toISOString() // Thêm lastmod
      });
    });
   // Truy vấn cơ sở dữ liệu để lấy danh sách medicine
    const medicines = await db.query('SELECT slug, updated_at FROM medicines'); // Thay bằng câu query của bạn
    medicines.rows.forEach((medicine) => {
      smStream.write({
        url: `https://sunnypetspabaria.vn/medicine/${medicine.slug}`, // Sửa thành URL tĩnh
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: medicine.updated_at ? new Date(medicine.updated_at).toISOString() : new Date().toISOString() // Thêm lastmod
      });
    });
    // Truy vấn cơ sở dữ liệu để lấy danh sách newis
    const newis = await db.query('SELECT slug, updated_at FROM newis'); // Thay bằng câu query của bạn
    newis.rows.forEach((newi) => {
      smStream.write({
        url: `https://sunnypetspabaria.vn/newis/${newi.slug}`, // Sửa thành URL tĩnh
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: newi.updated_at ? new Date(newi.updated_at).toISOString() : new Date().toISOString() // Thêm lastmod
      });
    });

    // Kết thúc stream
    smStream.end();

    // Xuất sitemap ra response
    const sitemapOutput = await streamToPromise(smStream).then((data) =>
      data.toString()
    );

    res.header('Content-Type', 'application/xml');
    res.send(sitemapOutput);
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
});

module.exports = router;