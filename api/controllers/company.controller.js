import mongoose from "mongoose";
import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import userController from "./user.controller.js";
const { Types } = mongoose;

let SORT_TIME_UPDATED_DESC = { updatedAt: -1 };
let SORT_DAY_WORK = { dayWork: -1 };

const index = async (req, res, next) => {
  try {
    let companies = [];
    let {
      page = 0,
      size = 10000,
      createdBy,
      updatedBy,
      text,
      sortType,
      sortValue,
      ...otherSearch
    } = req.query;

    let sort = {};
    if (sortType) {
      sort[sortType] = parseInt(sortValue);
    } else {
      sort = SORT_TIME_UPDATED_DESC;
    }
    let search = {};
    if (text && text.trim().length !== 0) {
      search = {
        ...search,
        $text: { $search: text.trim() },
      };
    }
    if (createdBy) {
      search.createdBy = Types.ObjectId(createdBy);
    }
    if (updatedBy) {
      search.updatedBy = Types.ObjectId(updatedBy);
    }

    // companies = await companyModel
    //   .find({}, "-__v")
    //   .populate("createdBy", "-__v -password")
    //   .populate("updatedBy", "-__v -password")
    //   .sort({ updatedAt: -1 });

    Object.entries(otherSearch).map(([key, value]) => {
      if (value == "true") search[key] = true;
      else if (value == "false") search[key] = false;
      else if (commons.isNumeric(value)) search[key] = parseFloat(value);
      else search[key] = { $regex: new RegExp(value), $options: "$i" };
    });

    console.log("company.controller.js ~ index ~ search", search);

    companies = await companyModel.aggregate([
      {
        $match: search,
      },
      {
        $sort: sort,
      },
      ...commons.getPageSize(page, size),
      commons.lookUp("createdBy", "users", "_id", "createdBy"),
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

      commons.lookUp("updatedBy", "users", "_id", "updatedBy"),
      { $unwind: { path: "$updatedBy", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          // select field to show, hide
          "createdBy.password": 0,
          "updatedBy.password": 0,
          "createdBy.__v": 0,
          "updatedBy.__v": 0,
          __v: 0,
        },
      },
      // commons.groupBy(),
    ]);
    console.log("companies", companies.length);
    return res.status(200).json(companies);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error.message);
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
    return handleError(res, error.message);
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

    return res.status(200).json(newCompany);
  } catch (error) {
    return handleError(res, error.message);
  }
};

const detailCompany = async (req, res, next) => {
  try {
    let company = await companyModel
      .findOne({ _id: req.params.id }, " -__v")
      .populate({ path: "createdBy", select: "-__v -password" })
      .populate({ path: "updatedBy", select: "-__v -password" });
    let config = await companyConfigModel.findOne({ companyId: req.params.id });
    if (!company) {
      return handleError(res, "Company không tồn tại.");
    }
    company = { ...company._doc, config: { ...config._doc } };
    return res.status(200).json(company);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error.message);
  }
};

const deleteCompany = async (req, res, next) => {
  let _id = req.params.id;
  try {
    let company = await companyModel.findOneAndRemove({ _id });
    if (!company) {
      return handleError(res, `Id: ${_id} không tồn tại.`);
    }
    return res
      .status(200)
      .json({ msg: `Xóa Id: ${req.params.id} thành công.` });
  } catch (error) {
    return handleError(res, error.message);
  }
};

const configCompany = async (req, res, next) => {
  try {
    let updateData = req.body;
    console.log("updateData", updateData);
    let query = { companyId: updateData.companyId };
    let options = { upsert: true, new: true, setDefaultsOnInsert: true };
    // Since upsert creates a document if not finds a document, you don't need to create another one manually.

    // validate input
    let checkConfig = new companyConfigModel(req.body).validateSync();
    if (!checkConfig) {
      // k loi thi update or create
      let config = await companyConfigModel
        .findOneAndUpdate(query, updateData, options)
        .select("-__v");
      let company = await companyModel
        .findOne({ _id: req.body.companyId }, " -__v")
        .populate({ path: "createdBy", select: "-__v -password" })
        .populate({ path: "updatedBy", select: "-__v -password" });
      company = { ...company._doc, config: { ...config._doc } };
      return res.status(200).json(company);
      // return res.status(200).json(config);
    } else {
      return handleError(res, checkConfig.errors);
    }
  } catch (error) {
    console.log("error.message", error.message);
    return handleError(res, error.message);
  }
};
const getConfigCompanyDefault = async (req, res, next) => {
  try {
    let config = new companyConfigModel();
    return res.status(200).json(config);
  } catch (error) {
    return handleError(res, error.message);
  }
};

const getUserCompany = async (req, res, next) => {
  let _id = req.params.id;
  // Object.entries(req.query).map(([key, value]) => {
  //   req.query[key] = `/${req.query[key].toLowerCase()}/i`;
  // });
  // console.log("req.query", req.query);
  req.query = { ...req.query, companyId: _id };
  try {
    userController.index(req, res, next);
  } catch (error) {
    return handleError(res, error.message);
  }
};

export default {
  index,
  postIndex,
  updateCompany,
  detailCompany,
  deleteCompany,
  configCompany,
  getUserCompany,
  getConfigCompanyDefault,
};
