import mongoose from "mongoose";
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

const updateCompany = async (req, res, next) => {
  let _id = req.params.id;
  let updateData = req.body;
  try {
    // cach 1
    let newCompany = await companyModel
      .findByIdAndUpdate(_id, updateData, { new: true })
      .populate({ path: "createdBy", select: "-__v -password" })
      .populate({ path: "updatedBy", select: "-__v -password" })
      .select("-__v ")
      .exec();

    // cach 2
    // let newCompany = await companyModel
    //   .findOneAndUpdate({ _id }, updateData, { new: true })
    //   .select("-__v ")
    //   .exec();

    return res.json(newCompany);
  } catch (error) {
    return handleError(res, error);
  }
};

const detailCompany = async (req, res, next) => {
  try {
    let company = await companyModel
      .findOne({ _id: req.params.id }, " -__v")
      .populate({ path: "createdBy", select: "-__v -password" })
      .populate({ path: "updatedBy", select: "-__v -password" });

    if (!company) {
      return handleError(res, "Company không tồn tại.");
    }
    return res.json(company);
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteCompany = async (req, res, next) => {
  let _id = req.params.id;
  try {
    let company = await companyModel.findOneAndRemove({ _id });
    if (!company) {
      return handleError(res, `Id: ${_id} không tồn tại.`);
    }
    return res.json({ msg: `Xóa Id: ${req.params.id} thành công.` });
  } catch (error) {
    return handleError(res, error);
  }
};

export default {
  index,
  postIndex,
  updateCompany,
  detailCompany,
  deleteCompany,
};
