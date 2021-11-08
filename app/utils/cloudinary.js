const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require("uuid");
const streamifier = require("streamifier");

cloudinary.config({
    cloud_name: process.env.cloudinary_cloud_name,
    api_key: process.env.cloudinary_api_key,
    api_secret: process.env.cloudinary_api_secret,
});

const addImageToCloud = async(req, folderName) => {
    return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream({
                folder: folderName,
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
    });
};

exports = {
    addImageToCloud
}