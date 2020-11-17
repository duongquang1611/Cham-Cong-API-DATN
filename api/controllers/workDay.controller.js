import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import workDayModel from "../../models/workDay.model.js";
import moment from "moment";
import resources from "../resources/index.js";
import userModel from "../../models/user.model.js";
import askDayOffModel from "../../models/askDayOff.model.js";
const { Types } = mongoose;
const TYPE_ASK_COME_LATE = [
  {
    id: 0,
    name: "Đi muộn",
    code: "comeLateAsk",
  },
  {
    id: 1,
    name: "Về sớm",
    code: "leaveEarlyAsk",
  },
];

var SORT_TIME_UPDATED_DESC = { updatedAt: -1 };
var SORT_DAY_WORK = { dayWork: -1 };

// search all work day
const index = async (req, res, next) => {
  try {
    let workDays = [];

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
      ...otherSearch
    } = req.query;

    let search = {};

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
      {
        $sort: SORT_TIME_UPDATED_DESC,
        // $sort: SORT_DAY_WORK,
      },
      ...commons.getPageSize(page, size),
      // commons.groupBy(),
    ]);

    return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error);
  }
};

// search list ask come leave
const getAskComeLeave = async (req, res, next) => {
  try {
    let workDays = [];

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
      ...otherSearch
    } = req.query;

    let search = {};

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
      else search[key] = value;
    });

    console.log("search", search, commons.getPageSize(page, size));

    workDays = await workDayModel.aggregate([
      {
        $match: search,
      },
      {
        $sort: SORT_TIME_UPDATED_DESC,
        // $sort: SORT_DAY_WORK,
      },
      ...commons.getPageSize(page, size),
      commons.lookUp("userId", "users", "_id", "userId"),
      { $unwind: { path: "$userId" } },
      {
        $project: {
          // select field to show, hide
          "userId.password": 0,
          __v: 0,
        },
      },
      // commons.groupBy(),
    ]);
    let results = [];
    workDays.filter((item) => {
      let newComeLate = { ...item };
      let newLeaveEarly = { ...item };
      delete newComeLate[TYPE_ASK_COME_LATE[1].code];
      newComeLate.type = TYPE_ASK_COME_LATE[0];
      delete newLeaveEarly[TYPE_ASK_COME_LATE[0].code];
      newLeaveEarly.type = TYPE_ASK_COME_LATE[1];

      if (item?.comeLateAsk?.time && item?.leaveEarlyAsk?.time) {
        // neu k truyen status come leave
        if (!statusComeLeaveAsk) {
          results.push(newComeLate);
          results.push(newLeaveEarly);
        } else {
          // neu truyen status nhung k truyen reverse
          if (!reverseStatusComeLeaveAsk) {
            if (newComeLate["comeLateAsk"].status == statusComeLeaveAsk) {
              results.push(newComeLate);
            }
            if (newLeaveEarly["leaveEarlyAsk"].status == statusComeLeaveAsk)
              results.push(newLeaveEarly);
          } else {
            results.push(newComeLate);
            results.push(newLeaveEarly);
          }
        }
      } else if (item?.comeLateAsk?.time) {
        // remove leaveEarlyAsk
        results.push(newComeLate);
      } else {
        results.push(newLeaveEarly);
      }
    });
    return res.status(200).json(results || []);
    // return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error);
  }
};

const getDetailWorkDay = async (req, res, next) => {
  console.log("getDetailWorkDay");
  let _id = req.params.id;
  try {
    let workDay = await workDayModel.findOne({ _id: id });

    return res.status(200).json(workDay || {});
  } catch (error) {
    return handleError(res, JSON.stringify(error));
  }
};

const getListWorkDayCompany = async (req, res, next) => {
  let companyId = req.params.id;

  const {
    page = 0,
    size = 10000,
    date,
    from = "1970-01-01",
    to = "2050-12-30",
  } = req.query;
  // let month = moment(date).format("M");
  // let year = moment(date).format("YYYY");
  // console.log("month", moment(date), month, year);
  try {
    let workDays = await workDayModel.aggregate([
      {
        $match: {
          companyId: Types.ObjectId(companyId),
          // month: parseInt(month),
          // year: parseInt(year),
          dayWork: {
            $gte: from,
            // $lte: new Date(),
            $lte: to,
          },
        },
      },
      { $sort: SORT_DAY_WORK },
      ...commons.getPageSize(page, size),

      //    from: <collection to join>,
      //    localField: <field from the input documents>,
      //    foreignField: <field from the documents of the "from" collection>,
      //    as: <output array field>
      commons.lookUp("userId", "users", "_id", "userId"),
      { $unwind: { path: "$userId" } }, // bo [] => {} userId
      commons.lookUp("parentId", "users", "_id", "parentId"),
      { $unwind: "$parentId" },
      {
        $project: {
          // select field to show, hide
          "userId.password": 0,
          "parentId.password": 0,
          __v: 0,
        },
      },
      // {
      //   $group: {
      //     _id: companyId,
      //     count: { $sum: 1 },
      //     results: { $push: "$$ROOT" },
      //   },
      // },
      commons.groupBy(companyId),
    ]);
    return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error);
  }
};

const updateWorkDay = async (req, res, next) => {
  try {
    let updateData = req.body;

    let now = new Date();
    // let now = moment();

    if (updateData.user) {
      // cham cong ho, truyen user vao body
      req.user = updateData.user;
    }
    let { user } = req;
    let query = {
      userId: user._id,
    };

    // get config company
    let detailCompany = await resources.getDetailCompany(user.companyId._id);
    let allowCheckin = commons.setTimeToDate(detailCompany.config.allowCheckin);
    let allowCheckout = commons.setTimeToDate(
      detailCompany.config.allowCheckout
    );
    let defaultCheckin = commons.setTimeToDate(detailCompany.config.checkin);
    let defaultCheckout = commons.setTimeToDate(detailCompany.config.checkout);

    // check allow checkout, checkin

    // if (updateData.isCheckout) {
    //   let checkIsBeforeDate = commons.isBeforeDate(allowCheckout, now);
    //   if (checkIsBeforeDate) {
    //     return handleError(
    //       res,
    //       `Không thể thực hiện checkout sau ${detailCompany.config.allowCheckout}`
    //     );
    //   }
    // } else {
    //   let checkIsBeforeDate = commons.isBeforeDate(now, allowCheckin);
    //   if (checkIsBeforeDate) {
    //     return handleError(
    //       res,
    //       `Không thể thực hiện checkin trước ${detailCompany.config.allowCheckin}`
    //     );
    //   }
    // }

    // set parentId, company
    updateData = {
      ...updateData,
      parentId: user.parentId._id,
      companyId: user.companyId._id,
    };

    // check late, early to put db: minutesComeLate, minutesLeaveEarly
    // console.log(commons.getDiffTime(now));

    if (!updateData.dayWork) {
      query.dayWork = moment(now).format(commons.formatDayWork);
    }

    // time checkin auto khoi tao khi tao ban ghi
    if (updateData.isCheckout) {
      // checkout

      let diff = commons.getDurationToMinutes(defaultCheckout, now, false);
      // date1 - date2
      updateData = {
        ...updateData,
        isSuccessDay: true,
        minutesLeaveEarly: diff < 0 ? 0 : diff, // checkout sau gio hanh chinh thi 0 phut di muon
        checkout: now,
      };
    } else {
      let diff = commons.getDurationToMinutes(defaultCheckin, now, false);
      // date1-date2
      updateData = {
        ...updateData,
        checkin: now,
        minutesComeLate: diff < 0 ? Math.abs(diff) : 0,
      };
    }

    let options = { upsert: true, new: true, setDefaultsOnInsert: true };
    // Since upsert creates a document if not finds a document, you don't need to create another one manually.

    let workDay = await workDayModel
      .findOneAndUpdate(query, updateData, options)
      .select("-__v");
    return res.status(200).json(workDay);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error);
  }
};

const putAskComeLeave = async (req, res, next) => {
  try {
    const {
      time,
      typeAsk,
      title = "",
      reason = "",
      status = 0,
      userId,
    } = req.body;
    let dayWork = moment(time).format(commons.formatDayWork);
    let user = req.user;
    if (userId) {
      user = await userModel
        .findOne({ _id: userId })
        .populate("companyId parentId userId");
    }
    let query = {
      userId: Types.ObjectId(userId || user._id),
      dayWork: dayWork,
    };

    let updateData = {
      parentId: user.parentId._id,
      companyId: user.companyId._id,
      ...commons.getDetailDate(time),
    };

    // 0: chờ duyệt
    // 1: đã chấp nhận
    // -1: từ chối

    if (typeAsk === "comeLateAsk") {
      updateData = {
        ...updateData,
        comeLateAsk: {
          time,
          title,
          status: status || 0,
          reason,
        },
      };
    }
    if (typeAsk === "leaveEarlyAsk") {
      updateData = {
        ...updateData,
        leaveEarlyAsk: {
          time,
          title,
          status: status || 0,
          reason,
        },
      };
    }
    let options = { upsert: true, new: true, setDefaultsOnInsert: true };
    // Since upsert creates a document if not finds a document, you don't need to create another one manually.

    let workDay = await workDayModel
      .findOneAndUpdate(query, updateData, options)
      .select("-__v");
    console.log("workDay", workDay);
    return res.status(200).json(workDay);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error);
  }
};

// day off
const getAskDayOff = async (req, res, next) => {
  try {
    let dayOffs = [];

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
      ...otherSearch
    } = req.query;

    let search = {
      $and: [{ fromDate: { $gte: from } }, { toDate: { $lte: to } }],
    };

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
      {
        $sort: SORT_TIME_UPDATED_DESC,
        // $sort: SORT_DAY_WORK,
      },
      ...commons.getPageSize(page, size),
      commons.lookUp("userId", "users", "_id", "userId"),
      { $unwind: { path: "$userId" } },
      {
        $project: {
          // select field to show, hide
          "userId.password": 0,
          __v: 0,
        },
      },
      // commons.groupBy(),
    ]);

    console.log("dayOffs", dayOffs);
    return res.status(200).json(dayOffs || []);
    // return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error);
  }
};

const putAskDayOff = async (req, res, next) => {
  try {
    let {
      userId,
      fromDate,
      toDate,
      title,
      reason,
      status,
      typeAsk: type,
    } = req.body;
    let user = req.user;
    if (userId) {
      user = await userModel
        .findOne({ _id: userId })
        .populate("companyId parentId userId");
    }

    let options = { upsert: true, new: true, setDefaultsOnInsert: true };

    let query = {
      userId: Types.ObjectId(userId || user._id),
      fromDate: moment(fromDate).format(commons.formatDayWork),
      toDate: moment(toDate).format(commons.formatDayWork),
    };

    let updateData = {
      parentId: user.parentId._id,
      companyId: user.companyId._id,
      title,
      reason,
      status: parseInt(status),
      type,
    };

    let dayOff = await askDayOffModel
      .findOneAndUpdate(query, updateData, options)
      .select("-__v");
    return res.status(200).json(dayOff);
  } catch (error) {
    console.log("error", error);
    handleError(res, error);
  }
};
export default {
  index,
  getDetailWorkDay,
  getListWorkDayCompany,
  updateWorkDay,
  putAskComeLeave,
  getAskComeLeave,
  getAskDayOff,
  putAskDayOff,
};