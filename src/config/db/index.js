const mongoose = require('mongoose');

async function connect() {
    try {
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000 // Tăng thời gian timeout lên 30 giây
        });
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('Connect failure!!!', error);
    }
}

module.exports = { connect };
