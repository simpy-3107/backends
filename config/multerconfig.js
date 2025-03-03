
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');  // Import Cloudinary config

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',  // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'], 
    unique_filename: true,
    access_mode: 'public' // Allowed formats
  },
});

// Multer configuration
const upload = multer({ storage: storage });

module.exports = upload;