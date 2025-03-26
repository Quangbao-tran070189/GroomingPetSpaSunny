const debug = require('debug')('app:error');

module.exports = function errorHandler(app) {
    // Error handling for 404 - Not Found
    /*
    app.use((req, res, next) => {
        debug(`404 Not Found: ${req.originalUrl}`);
        res.status(404).render('404', {
            title: '404 - Không tìm thấy trang',
            layout: 'main'
        });
    });

    // Error handling for 500 - Server Error
    app.use((err, req, res, next) => {
        console.error(err.stack);
        debug(`500 Server Error: ${err.message}`);
        res.status(500).render('500', {
            title: '500 - Lỗi máy chủ',
            layout: 'main',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    });
    */
};