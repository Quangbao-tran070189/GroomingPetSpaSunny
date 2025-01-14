const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

console.log('Cloudinary config path:', path.resolve(__dirname, '../config/cloudinaryConfig'));
const cloudinary = require('../config/cloudinaryConfig');
console.log('Cloudinary loaded:', cloudinary);

const storage = (folder) => new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: folder, // Thư mục sẽ được truyền vào khi gọi middleware
    format: async (req, file) => { 
      const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']; // Danh sách định dạng tệp cho phép
      const ext = file.originalname.split('.').pop().toLowerCase();
      return allowedFormats.includes(ext) ? ext : 'jpg'; // Sử dụng định dạng gốc nếu hợp lệ, nếu không thì sử dụng 'jpg'
    },
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0] // Tên file duy nhất
  },
});

const upload = (folder) => multer({ storage: storage(folder) });

module.exports = upload;
