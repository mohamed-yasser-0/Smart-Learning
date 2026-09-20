const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "course-thumbnails",
        resource_type: "image", // أو احذف السطر لأن image هو الافتراضي
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

module.exports = multer({ storage });