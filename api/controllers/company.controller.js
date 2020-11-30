import mongoose from "mongoose";
import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import askDayOffModel from "../../models/askDayOff.model.js";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import workDayModel from "../../models/workDay.model.js";
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
  console.log("detailCompany");

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
  console.log("deleteCompany");

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
      console.log("configCompany");
      return handleError(res, checkConfig.errors);
    }
  } catch (error) {
    console.log("configCompany");
    console.log("error.message", error.message);
    return handleError(res, error.message);
  }
};
const getConfigCompanyDefault = async (req, res, next) => {
  try {
    let config = new companyConfigModel();
    return res.status(200).json(config);
  } catch (error) {
    console.log("getConfigCompanyDefault");
    return handleError(res, error.message);
  }
};

const getUserCompany = async (req, res, next) => {
  let _id = req.params.id;
  if (_id) {
    req.query = { ...req.query, companyId: _id };
  } else {
    let user = { ...req.user };
    if (user?.companyId?._id) {
      req.query = { ...req.query, companyId: user?.companyId?._id };
    } else {
      return handleError(res, "Không thể tìm thấy công ty.");
    }
  }
  try {
    userController.index(req, res, next);
  } catch (error) {
    console.log("getUserCompany");

    return handleError(res, error.message);
  }
};

const getListWorkDayCompany = async (req, res, next) => {
  let companyId = req.params.id;

  try {
    let workDays = [];
    let user = { ...req.user };
    let {
      page = 0,
      size = 10000,
      from = "1970-01-01",
      to = "2050-12-30",
      dayWork,
      userId,
      comeLeave,
      parentId,
      statusComeLeaveAsk,
      me,
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
    if (user?.companyId?._id) {
      search.companyId = Types.ObjectId(user?.companyId?._id);
    } else {
      console.log("getListWorkDayCompany");

      return handleError(res, "Không thể tìm thấy công ty.");
    }
    if (text && text.trim().length !== 0) {
      search = {
        ...search,
        $text: { $search: text.trim() },
      };
    }
    if (dayWork) search.dayWork = dayWork;
    else {
      search.dayWork = {
        $gte: from,
        // $lte: new Date(),
        $lte: to,
      };
    }

    if (comeLeave) {
      search = {
        ...search,
        $or: [
          { "comeLateAsk.time": { $ne: null } },
          { "leaveEarlyAsk.time": { $ne: null } },
        ],
      };
    }
    if (statusComeLeaveAsk) {
      search = {
        ...search,
        $or: [
          { "comeLateAsk.status": parseFloat(statusComeLeaveAsk) },
          { "leaveEarlyAsk.status": parseFloat(statusComeLeaveAsk) },
        ],
      };
    }

    if (me) {
      // chinh chu
      console.log("req.user._id", req.user._id);
      search.userId = Types.ObjectId(req.user._id);
    }
    if (userId) {
      search.userId = Types.ObjectId(userId);
    }
    if (parentId) {
      search.parentId = Types.ObjectId(parentId);
    }

    Object.entries(otherSearch).map(([key, value]) => {
      if (value == "true") search[key] = true;
      else if (value == "false") search[key] = false;
      else if (commons.isNumeric(value)) search[key] = parseFloat(value);
      else search[key] = value;
    });

    console.log("search", search, commons.getPageSize(page, size));

    workDays = await workDayModel.aggregate([
      {
        $match: search,
      },

      ...commons.getPageSize(page, size),
      // commons.lookUp("userId", "users", "_id", "userId"),
      // { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
          results: { $push: "$$ROOT" },
        },
      },
      {
        $sort: sort,
      },
    ]);
    console.log("workDays company", workDays.length);
    return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error.message);
  }
};

const getListAskComeLeaveInCompany = async (req, res, next) => {
  try {
    let workDays = [];
    let companyId = req.params.id;
    let user = { ...req.user };
    let {
      page = 0,
      size = 10000,
      from = "1970-01-01",
      to = "2050-12-30",
      dayWork,
      userId,
      comeLeave = true, // mac dinh search ask come leave
      parentId,
      statusComeLeaveAsk, // mac dinh search all
      reverseStatusComeLeaveAsk,
      sortType,
      sortValue,
      ...otherSearch
    } = req.query;

    let search = {};
    if (user?.companyId?._id) {
      search.companyId = Types.ObjectId(user?.companyId?._id);
    } else {
      return handleError(res, "Không thể tìm thấy công ty.");
    }
    let sort = {};
    if (sortType) {
      sort[sortType] = parseInt(sortValue);
    } else {
      sort = SORT_TIME_UPDATED_DESC;
    }
    if (dayWork) search.dayWork = dayWork;
    else {
      search.dayWork = {
        $gte: from,
        // $lte: new Date(),
        $lte: to,
      };
    }

    if (comeLeave) {
      search = {
        ...search,
        $or: [
          { "comeLateAsk.time": { $ne: null } },
          { "leaveEarlyAsk.time": { $ne: null } },
        ],
      };
    }
    if (statusComeLeaveAsk) {
      console.log("if", statusComeLeaveAsk);
      if (reverseStatusComeLeaveAsk) {
        search = {
          ...search,
          $and: [
            { "comeLateAsk.status": { $ne: parseInt(statusComeLeaveAsk) } },
            { "leaveEarlyAsk.status": { $ne: parseInt(statusComeLeaveAsk) } },
          ],
        };
      } else {
        search = {
          ...search,
          $or: [
            { "comeLateAsk.status": parseFloat(statusComeLeaveAsk) },
            { "leaveEarlyAsk.status": parseFloat(statusComeLeaveAsk) },
          ],
        };
      }
    }

    if (userId) {
      search.userId = Types.ObjectId(userId);
    }
    if (parentId) {
      search.parentId = Types.ObjectId(parentId);
    }

    Object.entries(otherSearch).map(([key, value]) => {
      if (value == "true") search[key] = true;
      else if (value == "false") search[key] = false;
      else if (commons.isNumeric(value)) search[key] = parseFloat(value);
      else search[key] = { $regex: new RegExp(value), $options: "$i" };
    });

    console.log("search", search, commons.getPageSize(page, size));

    workDays = await workDayModel.aggregate([
      {
        $match: search,
      },
      ...commons.getPageSize(page, size),
      // commons.lookUp("userId", "users", "_id", "userId"),
      // { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          // select field to show, hide
          "userId.password": 0,
          "userId.__v": 0,
          __v: 0,
        },
      },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
          results: { $push: "$$ROOT" },
        },
      },
      {
        $sort: sort,
      },
    ]);
    // let results = [];

    // workDays.filter((item) => {
    //   let newComeLate = { ...item };
    //   let newLeaveEarly = { ...item };
    //   delete newComeLate[TYPE_ASK_COME_LATE[1].code];
    //   newComeLate.type = TYPE_ASK_COME_LATE[0];
    //   delete newLeaveEarly[TYPE_ASK_COME_LATE[0].code];
    //   newLeaveEarly.type = TYPE_ASK_COME_LATE[1];

    //   if (item?.comeLateAsk?.time && item?.leaveEarlyAsk?.time) {
    //     // neu k truyen status come leave
    //     if (!statusComeLeaveAsk) {
    //       results.push(newComeLate);
    //       results.push(newLeaveEarly);
    //     } else {
    //       // neu truyen status nhung k truyen reverse
    //       if (!reverseStatusComeLeaveAsk) {
    //         if (newComeLate["comeLateAsk"].status == statusComeLeaveAsk) {
    //           results.push(newComeLate);
    //         }
    //         if (newLeaveEarly["leaveEarlyAsk"].status == statusComeLeaveAsk)
    //           results.push(newLeaveEarly);
    //       } else {
    //         results.push(newComeLate);
    //         results.push(newLeaveEarly);
    //       }
    //     }
    //   } else if (item?.comeLateAsk?.time) {
    //     // remove leaveEarlyAsk
    //     results.push(newComeLate);
    //   } else {
    //     results.push(newLeaveEarly);
    //   }
    // });
    // console.log("results", results.length);
    // return res.status(200).json(results || []);

    console.log("come leave", workDays.length);

    return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error.message);
  }
};

const getListAskDayOffInCompany = async (req, res, next) => {
  try {
    let dayOffs = [];
    let user = { ...req.user };
    let {
      page = 0,
      size = 10000,
      from = "1970-01-01",
      to = "2050-12-30",
      // dayWork,
      userId, // search theo userId
      parentId, // search theo parentId
      status, // mac dinh search all
      reverseStatus,
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
    let search = {
      $and: [{ fromDate: { $gte: from } }, { toDate: { $lte: to } }],
    };

    if (user?.companyId?._id) {
      search.companyId = Types.ObjectId(user?.companyId?._id);
    } else {
      return handleError(res, "Không thể tìm thấy công ty.");
    }
    if (status) {
      if (reverseStatus) {
        search = {
          ...search,
          status: { $ne: parseInt(status) },
        };
      } else {
        search = {
          ...search,
          status: parseInt(status),
        };
      }
    }

    if (userId) {
      search.userId = Types.ObjectId(userId);
    }
    if (parentId) {
      search.parentId = Types.ObjectId(parentId);
    }

    Object.entries(otherSearch).map(([key, value]) => {
      if (value == "true") search[key] = true;
      else if (value == "false") search[key] = false;
      else if (commons.isNumeric(value)) search[key] = parseFloat(value);
      else search[key] = value;
    });

    console.log("search", search);

    dayOffs = await askDayOffModel.aggregate([
      {
        $match: search,
      },
      ...commons.getPageSize(page, size),
      // commons.lookUp("userId", "users", "_id", "userId"),
      // { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          // select field to show, hide
          "userId.password": 0,
          "userId.__v": 0,
          __v: 0,
        },
      },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
          results: { $push: "$$ROOT" },
        },
      },
      {
        $sort: sort,
      },
    ]);

    console.log("dayOffs", dayOffs.length);
    return res.status(200).json(dayOffs || []);
    // return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
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
  getListWorkDayCompany,
  getListAskComeLeaveInCompany,
  getListAskDayOffInCompany,
};
