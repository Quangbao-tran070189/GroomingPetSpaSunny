const router = require('express').Router();
const { SitemapStream, streamToPromise } = require('sitemap');
const compression = require('compression');
const cache = require('memory-cache');
const debug = require('debug')('app:sitemap');
const path = require('path');

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://sunnypetspabaria.vn'; // Sử dụng biến môi trường
const CACHE_DURATION = 3600000; // 1 hour
const STATIC_PAGES = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/products', changefreq: 'weekly', priority: 0.8 },
    { url: '/stuffs', changefreq: 'weekly', priority: 0.8 },
    { url: '/medicines', changefreq: 'weekly', priority: 0.8 },
    { url: '/newis', changefreq: 'weekly', priority: 0.8 },
    { url: '/abouts', changefreq: 'monthly', priority: 0.5 }
];

// Model paths (sử dụng path.join để đảm bảo tính tương thích)
let Product, Stuff, Medicine, Newi;
try {
    debug('Đang tải models...');
    Product = require('../app/models/Product');
    Stuff = require('../app/models/Stuff');
    Medicine = require('../app/models/Medicine');
    Newi = require('../app/models/Newi');
    debug('Tải models thành công.');
} catch (e) {
    console.error('Lỗi khi tải model:', e);
    // Gửi phản hồi lỗi cho client thay vì throw Error
    module.exports = router;
    return;
}

// Hàm tạo URL cho sitemap
const addUrlsToSitemap = (smStream, items, prefix) => {
    debug(`Thêm URLs cho: ${prefix}`);
    items?.forEach(item => {
        if (item?.slug) {
            const url = `/${prefix}/${item.slug}`;
            debug(`Thêm URL: ${url}`);
            smStream.write({
                url: url,
                changefreq: 'weekly',
                priority: 0.8,
                lastmod: item.updatedAt?.toISOString() || new Date().toISOString()
            });
        }
    });
    debug(`Hoàn thành thêm URLs cho: ${prefix}`);
};

// Middleware nén
router.use(compression());

router.get('/', async (req, res) => {
    let smStream;
    try {
        debug('Bắt đầu xử lý yêu cầu sitemap');

        // Kiểm tra SITE_URL
        if (!SITE_URL || typeof SITE_URL !== 'string' || !SITE_URL.startsWith('https://')) {
            console.error('SITE_URL không hợp lệ:', SITE_URL);
            return res.status(500).json({ error: 'SITE_URL không hợp lệ' });
        }
        debug(`SITE_URL hợp lệ: ${SITE_URL}`);

        // Kiểm tra cache
        const cachedSitemap = cache.get('sitemap');
        if (cachedSitemap) {
            debug('Phục vụ sitemap từ cache');
            return sendSitemap(res, cachedSitemap);
        }

        debug('Bắt đầu tạo sitemap');
        smStream = new SitemapStream({
            hostname: SITE_URL,
            cacheTime: CACHE_DURATION
        });
        debug(`SitemapStream được khởi tạo với hostname: ${SITE_URL} và cacheTime: ${CACHE_DURATION}`);

        // Thêm các trang tĩnh
        debug('Thêm các trang tĩnh');
        STATIC_PAGES.forEach(page => {
            debug(`Thêm trang tĩnh: ${page.url}`);
            smStream.write({
                ...page,
                lastmod: new Date().toISOString()
            });
        });
        debug('Hoàn thành thêm các trang tĩnh');

        // Lấy dữ liệu từ database
        try {
            debug('Lấy dữ liệu từ database');
            const [products, stuffs, medicines, news] = await Promise.all([
                Product.find({}).select('slug updatedAt').lean(),
                Stuff.find({}).select('slug updatedAt').lean(),
                Medicine.find({}).select('slug updatedAt').lean(),
                Newi.find({}).select('slug updatedAt').lean()
            ]);

            debug(`Tìm thấy: ${products.length} products, ${stuffs.length} stuffs, ${medicines.length} medicines, ${news.length} news`);

            // Thêm các URL động
            addUrlsToSitemap(smStream, products, 'product');
            addUrlsToSitemap(smStream, stuffs, 'stuff');
            addUrlsToSitemap(smStream, medicines, 'medicine');
            addUrlsToSitemap(smStream, news, 'newis');

        } catch (dbError) {
            console.error('Lỗi truy vấn database:', dbError);
            return res.status(500).json({ error: 'Lỗi truy vấn database' });
        }

        smStream.end();
        debug('Kết thúc stream sitemap');
        const sitemap = await streamToPromise(smStream);
        debug('Sitemap đã được tạo thành công');

        // Cache sitemap
        cache.put('sitemap', sitemap, CACHE_DURATION);
        debug('Sitemap đã được cache');

        return sendSitemap(res, sitemap);

    } catch (error) {
        console.error('Lỗi tạo sitemap:', error);

        // Đảm bảo stream được đóng khi có lỗi
        if (smStream) {
            try {
                smStream.end();
                debug('Stream sitemap đã được đóng sau lỗi');
            } catch (streamError) {
                console.error('Lỗi khi đóng stream:', streamError);
            }
        }

        res.status(500).json({
            error: 'Lỗi tạo sitemap',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi server nội bộ'
        });
    }
});

function sendSitemap(res, sitemap) {
    debug('Gửi sitemap cho client');
    res.header({
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(sitemap),
        'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}`,
        'Last-Modified': new Date().toUTCString()
    });
    res.send(sitemap.toString());
    debug('Sitemap đã được gửi thành công');
}

// Xử lý cleanup
process.on('SIGTERM', () => {
    debug('Nhận tín hiệu SIGTERM, xóa cache');
    cache.clear();
});
process.on('SIGINT', () => {
    debug('Nhận tín hiệu SIGINT, xóa cache');
    cache.clear();
});

module.exports = router;