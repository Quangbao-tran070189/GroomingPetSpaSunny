const mongoose = require('mongoose');
const debug = require('debug')('app:database');

// MongoDB Connection Options
const mongoOptions = {
    serverSelectionTimeoutMS: 30000,    // Timeout sau 30 giây
    socketTimeoutMS: 45000,             // Socket timeout sau 45 giây
    
    
    maxPoolSize: 10,                    // Tối đa 10 kết nối
    minPoolSize: 2,                     // Tối thiểu 2 kết nối
    retryWrites: true,                  // Cho phép retry writes
    w: 'majority',                      // Write concern
    autoIndex: true,                    // Tự động tạo index
    serverSelectionTimeoutMS: 5000,     // Timeout cho server selection
    heartbeatFrequencyMS: 10000,        // Kiểm tra kết nối mỗi 10 giây
};

async function connect() {
    try {
        const uri = process.env.MONGODB_URI;
        
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Thêm các event listeners trước khi kết nối
        mongoose.connection.on('connected', () => {
            debug('MongoDB đã kết nối thành công');
            console.log('MongoDB đã kết nối thành công');
        });

        mongoose.connection.on('error', (err) => {
            debug('MongoDB connection error: %O', err);
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            debug('MongoDB đã ngắt kết nối');
            console.log('MongoDB đã ngắt kết nối');
        });

        mongoose.connection.on('reconnected', () => {
            debug('MongoDB đã kết nối lại');
            console.log('MongoDB đã kết nối lại');
        });

        // Xử lý các sự kiện process
        process.on('SIGINT', gracefulShutdown('SIGINT'));
        process.on('SIGTERM', gracefulShutdown('SIGTERM'));
        process.on('SIGUSR2', gracefulShutdown('SIGUSR2'));

        // Kết nối đến MongoDB
        await mongoose.connect(uri, mongoOptions);
        debug('Khởi tạo kết nối MongoDB thành công');
        console.log('Kết nối MongoDB thành công!');

    } catch (error) {
        debug('Lỗi kết nối MongoDB: %O', error);
        console.error('Lỗi kết nối MongoDB:', error);
        throw error;
    }
}

function gracefulShutdown(signal) {
    return async () => {
        try {
            await mongoose.connection.close();
            debug(`Đã đóng kết nối MongoDB (Signal: ${signal})`);
            console.log(`Đã đóng kết nối MongoDB an toàn (Signal: ${signal})`);
            process.exit(0);
        } catch (err) {
            debug('Lỗi khi đóng kết nối MongoDB: %O', err);
            console.error('Lỗi khi đóng kết nối MongoDB:', err);
            process.exit(1);
        }
    };
}

// Export functions
module.exports = {
    connect,
    connection: mongoose.connection
};