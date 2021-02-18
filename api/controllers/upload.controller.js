import handleError from "../../commons/handleError.js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
import commons from "../../commons/index.js";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const resizeImage = (id, h, w) => {
  return cloudinary.url(id, {
    height: h,
    width: w,
    crop: "fit",
    format: "jpg",
  });
};

const urlResize = (imageData) => {
  return {
    thumb200: resizeImage(imageData.public_id, 200, 200),
    thumb300: resizeImage(imageData.public_id, 300, 300),
    thumb500: resizeImage(imageData.public_id, 500, 500),
    original: imageData.secure_url,
  };
};

const postUploadImage = async (req, res, next) => {
  try {
    let resize = {};
    let result = {};
    console.log({ path: req.file.path });
    if (req.file && req.file.path) {
      console.log("req.file && req.file.path", req.file, req.file.path);
      result = await cloudinary.v2.uploader.upload(req.file.path);

      console.log({ result });
      resize = urlResize(result);
      console.log({ resize });
      console.log({ resize });
    }
    return res.status(200).json({ ...result, resize });
  } catch (error) {
    console.log("error", error);
    return handleError(res, error.message);
  }
};

const uploadImageTest = async (req, res, next) => {
  try {
    let resize = {};
    let result = {};
    const { type = "test" } = req.query;
    const isTest = type === "test";
    const count = isTest ? 50 : 20;

    let dataImage = [];
    let path;

    for (let i = 1; i <= count; i++) {
      path = `../test/${isTest ? "test50/test_" : "train/train_"}${i}.jpg`;
      result = await cloudinary.v2.uploader.upload(path);
      resize = urlResize(result);
      dataImage.push({ ...result, resize });
      console.log(result.original_filename);
      await commons.sleep(2000);
    }
    let dataImageJson = JSON.stringify(dataImage);
    fs.writeFile(
      `./upload/${isTest ? "test50" : "train"}.json`,
      dataImageJson,
      "utf8",
      (err) => {
        if (err) throw err;
        console.log("done");
      }
    );
    return res.json(dataImage);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error.message);
  }
};
export default {
  postUploadImage,
  uploadImageTest,
};
