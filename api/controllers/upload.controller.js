import handleError from "../../commons/handleError.js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const resizeImage = (id, h, w) => {
  return cloudinary.url(id, {
    height: h,
    width: w,
    crop: "scale",
    format: "jpg",
  });
};

const postUploadImage = async (req, res, next) => {
  try {
    let resize = {};
    let result = {};
    if (req.file && req.file.path) {
      console.log("req.file && req.file.path", req.file, req.file.path);
      result = await cloudinary.v2.uploader.upload(req.file.path);
      // console.log("result", result)
      resize = {
        thumb200: resizeImage(result.public_id, 200, 200),
        thumb300: resizeImage(result.public_id, 300, 300),
        thumb500: resizeImage(result.public_id, 500, 500),
        original: result.secure_url,
      };
    }
    return res.status(200).json({ ...result, resize });
  } catch (error) {
    console.log("error", error);
    return handleError(res, error.message);
  }
};
export default {
  postUploadImage,
};
