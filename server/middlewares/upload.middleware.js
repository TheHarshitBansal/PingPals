import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { config } from 'dotenv';
config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'PingPals',
      transformation: [{ width: 250, height: 250, gravity: 'faces', crop: 'fill' }],
      allowedFormats: ["png", "jpg", "jpeg"],
      public_id: (file) => file.originalname
    },
  });

export const upload = multer({ storage });

export const deleteImage = async (public_id) => {
    await cloudinary.uploader.destroy(public_id);
}