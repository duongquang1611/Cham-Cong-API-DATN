import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import companyModel from "../../models/company.model.js";

const index = async (req, res, next) => {
  try {
    let companies = await companyModel
      .find({}, "-__v")
      .populate("createdBy", "-__v -password")
      .populate("updatedBy", "-__v -password")
      .sort({ updatedAt: -1 });
    return res.json(companies);
  } catch (error) {
    return handleError(res, error);
  }
};

const postIndex = async (req, res, next) => {
  const { name } = req.body;
  let tokenData = commons.getUserIdInToken(req);
  let requiredKey = ["name"];
  requiredKey.map((key) => {
    if (!req.body[key]) {
      return handleError(res, `${key} không được để trống.`);
    }
  });
  try {
    let newCompany = new companyModel({
      ...req.body,
      createdBy: tokenData._id,
      updatedBy: tokenData._id,
    });
    let savedCompany = await newCompany.save();
    if (!savedCompany) return handleError(res, "Lỗi khi lưu thông tin công ty");
    return res.status(201).json(savedCompany);
  } catch (error) {
    return handleError(res, error);
  }
};

export default {
  index,
  postIndex,
};