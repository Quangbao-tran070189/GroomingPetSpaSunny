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
    Product = require(path.join(__dirname, '..', 'app', 'models', 'Product'));
    Stuff = require(path.join(__dirname, '..', 'app', 'models', 'Stuff'));
    Medicine = require(path.join(__dirname, '..', 'app', 'models', 'Medicine'));
    Newi = require(path.join(__dirname, '..', 'app', 'models', 'Newi'));
} catch (e) {
    debug('Lỗi khi tải model:', e);
    throw new Error('Không thể tải model');
}

// Hàm tạo URL cho sitemap
const addUrlsToSitemap = (smStream, items, prefix) => {
    items?.forEach(item => {
        if (item?.slug) {
            smStream.write({
                url: `/${prefix}/${item.slug}`,
                changefreq: 'weekly',
                priority: 0.8,
                lastmod: item.updatedAt?.toISOString() || new Date().toISOString()
            });
        }
    });
};

// Middleware nén
router.use(compression());

router.get('/', async (req, res) => {
    let smStream;
    try {
        // Kiểm tra SITE_URL
        if (!SITE_URL || typeof SITE_URL !== 'string' || !SITE_URL.startsWith('https://')) {
            debug('SITE_URL không hợp lệ:', SITE_URL);
            throw new Error('SITE_URL phải là một URL https hợp lệ.');
        }

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

        // Thêm các trang tĩnh
        STATIC_PAGES.forEach(page => {
            smStream.write({
                ...page,
                lastmod: new Date().toISOString()
            });
        });

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
            debug('Lỗi truy vấn database:', dbError);
            throw new Error(`Lỗi truy vấn database: ${dbError.message}`);
        }

        smStream.end();
        const sitemap = await streamToPromise(smStream);
        debug('Sitemap đã được tạo thành công');

        // Cache sitemap
        cache.put('sitemap', sitemap, CACHE_DURATION);

        return sendSitemap(res, sitemap);

    } catch (error) {
        debug('Lỗi tạo sitemap:', error);

        // Đảm bảo stream được đóng khi có lỗi
        if (smStream) {
            try {
                smStream.end();
            } catch (streamError) {
                debug('Lỗi khi đóng stream:', streamError);
            }
        }

        res.status(500).json({
            error: 'Lỗi tạo sitemap',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi server nội bộ'
        });
    }
});

function sendSitemap(res, sitemap) {
    res.header({
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(sitemap),
        'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}`,
        'Last-Modified': new Date().toUTCString()
    });
    return res.send(sitemap.toString());
}

// Xử lý cleanup
process.on('SIGTERM', () => cache.clear());
process.on('SIGINT', () => cache.clear());

module.exports = router;