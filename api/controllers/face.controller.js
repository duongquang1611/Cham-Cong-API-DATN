import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import mongoose from "mongoose";
const listKey = ["username", "password", "name", "roleId"];
import cloudinary from "cloudinary";
import { multerSingle } from "../handlers/multer.upload.js";
import commons from "../../commons/index.js";
import resources from "../resources/index.js";
import companyModel from "../../models/company.model.js";
import fs from "fs";
const { Types } = mongoose;

let SORT_TIME_UPDATED_DESC = { updatedAt: -1 };
let SORT_DAY_WORK = { dayWork: -1 };

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

const addFace = async (req, res, next) => {
  let _id = req.params.id;
  try {
    let dataUrl = null;

    if (req.file && req.file.path) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      let resize = urlResize(result);
      console.log({ resize });
      dataUrl = resize.thumb500;
    }
    if (dataUrl) {
      let user = await userModel.findById(_id);

      if (!user.personId) {
        // neu add face ma chua co personId thi create person
        let createPerson = await resources.createPerson(
          user.companyId,
          user._id,
          user.name
        );
        if (createPerson.status === 200) {
          console.log("create person success");
          let updateData = {
            personId: createPerson?.data?.personId,
          };

          user = await userModel.findByIdAndUpdate(_id, updateData, {
            new: true,
          });
        }
      }
      let addFace = await resources.addFace(
        user.companyId,
        user.personId,
        dataUrl
      );
      if (addFace.status === 200) {
        console.log("Face added successfully.");
        await resources.trainGroup(user.companyId);
        return res
          .status(200)
          .json({ msg: `Thêm dữ liệu khuôn mặt ${user.name} thành công.` });
      }
    } else {
      return handleError(res);
    }
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};

const createPerson = async (req, res, next) => {
  let _id = req.params.id;
  try {
    let user = await userModel.findById(_id);
    if (user.personId) {
      console.log("Đã có personId rồi", user.personId);
      return res.status(200).json(user);
    }
    let createPerson = await resources.createPerson(
      user.companyId,
      user._id,
      user.name
    );
    if (createPerson.status === 200) {
      console.log("create person success");
      let updateData = {
        personId: createPerson?.data?.personId,
      };

      let newUser = await userModel.findByIdAndUpdate(_id, updateData, {
        new: true,
      });
      return res.status(200).json(newUser);
    } else {
      return handleError(res, error.message);
    }
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};

const createPersonGroup = async (req, res, next) => {
  try {
    let id = req.params.id;
    let company = await companyModel.findById(id);
    // if (company.havePersonGroup) {
    //   console.log("Đã tạo Person Group rồi.");
    //   return res.status(200).json(company);
    // }
    let createPersonGroup = await resources.createPersonGroup(
      company._id,
      company.name
    );
    if (createPersonGroup.status === 200) {
      let updateData = {
        havePersonGroup: true,
      };
      let newCompany = await companyModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return res.status(200).json(newCompany);
    } else {
      return handleError(res);
    }
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};
const trainGroup = async (req, res, next) => {
  try {
    let companyId = req.params.id;
    await resources.trainGroup(companyId);
    return res.status(200).json();
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};
const listPersons = async (req, res, next) => {
  try {
    let companyId = req.params.id;
    let listPersons = await resources.listPersons(companyId);
    return res.status(200).json(listPersons.data);
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};
const getPerson = async (req, res, next) => {
  try {
    let { id: companyId, personId } = req.params;
    let person = await resources.getPerson(companyId, personId);
    return res.status(200).json(person.data);
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};
const detect = async (req, res, next) => {
  try {
    let dataUrl = null;

    if (req.file && req.file.path) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      // console.log("addFace ~ result", result);
      let resize = urlResize(result);
      console.log({ resize });
      dataUrl = resize.thumb500;
    }
    if (dataUrl) {
      let detectData = await resources.detect(dataUrl);
      if (detectData.status === 200) {
        console.log("detect success");
        return res.status(200).json(detectData.data);
      } else {
        return handleError(res);
      }
    } else {
      return handleError(res);
    }
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};
const identify = async (req, res, next) => {
  try {
    let companyId = req.params.id;
    let { faceId } = req.body;
    let identifyData = await resources.identify(companyId, faceId);
    return res.status(200).json(identifyData.data);
  } catch (error) {
    console.log("error control");
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};
const deleteFace = async (req, res, next) => {
  try {
    console.log("delete");
    let { id: companyId, personId } = req.params;
    let person = await resources.getPerson(companyId, personId);
    const { persistedFaceIds } = person.data;
    console.log({ person: person.data });
    for (let faceId of persistedFaceIds) {
      await resources.deleteFace(companyId, personId, faceId);
      await commons.sleep(4000);
    }
    person = await resources.getPerson(companyId, personId);
    return res.status(200).json(person.data);
  } catch (error) {
    console.log("error control");
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};
const detectAndIdentify = async (req, res, next) => {
  console.log("detectAndIdentify");
  try {
    let companyId = req.params.id;
    let dataUrl = null;

    if (req.file && req.file.path) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      let resize = urlResize(result);
      console.log({ resize });
      dataUrl = resize.thumb500;
    }
    if (dataUrl) {
      let detectData = await resources.detect(dataUrl);
      console.log(" detectData", detectData);
      if (detectData.status === 200) {
        console.log("detect success");
        let identifyData = await resources.identify(
          companyId,
          detectData?.data[0].faceId
        );
        console.log(identifyData.data);
        return res.status(200).json(identifyData.data);
      } else {
        return handleError(res);
      }
    } else {
      return handleError(res);
    }
  } catch (error) {
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};

const saveFaceId = async (req, res, next) => {
  try {
    const { imageTest } = commons;
    let detect;
    let faceIdArr = [];
    for (let i = 0; i < 50; i++) {
      console.log({
        image: imageTest[i].original_filename,
      });
      detect = await resources.detect(imageTest[i].url);
      faceIdArr.push(detect.data[0]);
      await commons.sleep(5000);
    }

    let faceIdJson = JSON.stringify(faceIdArr);
    fs.writeFile("./upload/faceId50.json", faceIdJson, "utf8", (err) => {
      if (err) throw err;
      console.log("done");
    });
    return res.status(200).json(faceIdArr);
  } catch (error) {
    return handleError(res, error.message);
  }
};
const testAccuracy = async (req, res, next) => {
  // thuc hien test do chinh xac voi 4 8 12 16 20 anh train
  try {
    let path = "./upload/resultFinal.json";
    // if (fs.existsSync(path)) console.log({ path });
    let { id: companyId, personId } = req.params;
    let { faceIds, sleep } = commons;
    let listFaces = faceIds.map((item) => item.faceId);
    let identifyData;
    let totalResult = [];
    const person = await resources.getPerson(companyId, personId);
    for (let i = 0; i < 5; i++) {
      // only identify faces length 1->10
      let subFaces = listFaces.slice(i * 10, (i + 1) * 10);
      identifyData = await resources.identify(companyId, subFaces);
      totalResult.push(...identifyData.data);
      await sleep(4000);
    }
    let trueResult = totalResult.filter((item) => {
      console.log(item);
      return item?.candidates[0]?.personId == personId;
    });

    const countTrueResult = trueResult.length || 0;
    let confidence = 0;

    for (let result of trueResult) {
      confidence += result?.candidates[0]?.confidence;
    }

    let testFinal = {
      personId,
      companyId,
      totalFaceOfPerson: person?.data?.persistedFaceIds?.length,
      totalTest: listFaces.length,
      totalTrue: countTrueResult,
      percentTrueTest: (countTrueResult / listFaces.length) * 100 + "%",
      confidenceTest:
        (countTrueResult ? (confidence / countTrueResult) * 100 : 0) + "%",
    };
    let resultFinalJson = JSON.stringify([testFinal]);
    if (fs.existsSync(path)) {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let dataArr = JSON.parse(data);
          dataArr.push(testFinal);
          resultFinalJson = JSON.stringify(dataArr); //convert it back to json
          fs.writeFile(path, resultFinalJson, "utf8", (err) => {
            if (err) throw err;
            console.log("done");
          });
        }
      });
    } else {
      fs.writeFile(path, resultFinalJson, "utf8", (err) => {
        if (err) throw err;
        console.log("done");
      });
    }

    return res.status(200).json(testFinal);
  } catch (error) {
    console.log("error control");
    let msg = error?.response?.data?.error?.message;
    if (msg && typeof msg === "string") {
      console.log({ msg });
      return handleError(res, msg);
    }
    return handleError(res, error.message);
  }
};

const addMultiFace = async (req, res, next) => {
  try {
    const { id: companyId, personId } = req.params;
    let { numFace = 0, page = 0, size = 4 } = req.query;
    const { imageTrain, sleep } = commons;
    if (parseInt(numFace) > 20) {
      numFace = 20;
    }
    page = parseInt(page);
    size = parseInt(size);
    for (let i = page * size; i < (page + 1) * size; i++) {
      await resources.addFace(companyId, personId, imageTrain[i].url);
      console.log(imageTrain[i].original_filename);
      await sleep(4000);
    }
    await resources.trainGroup(companyId);
    let person = await resources.getPerson(companyId, personId);
    return res.status(200).json(person.data);
  } catch (error) {
    return handleError(res, error.message);
  }
};

export default {
  createPerson,
  addFace,
  addMultiFace,
  createPersonGroup,
  trainGroup,
  listPersons,
  detect,
  identify,
  detectAndIdentify,
  testAccuracy,
  saveFaceId,
  getPerson,
  deleteFace,
};
