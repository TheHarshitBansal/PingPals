import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { config } from "dotenv";
config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Configure Multer with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "PingPals",
      resource_type: isVideo ? "video" : "image",
      allowedFormats: isVideo
        ? ["mp4", "webm", "ogg", "mov"]
        : ["png", "jpg", "jpeg"],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

export const upload = multer({ storage });

// Function to delete image/video
export const deleteFile = async (public_id, resource_type) => {
  try {
    await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type || "image", // Use correct resource type
    });
    console.log(`${resource_type} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting ${resource_type}:`, error);
  }
};