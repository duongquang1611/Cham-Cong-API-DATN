import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import workDayModel from "../../models/workDay.model.js";
import moment from "moment";
import resources from "../resources/index.js";
const { Types } = mongoose;

var SORT_TIME_DESC = { updatedAt: -1 };

// search all work day
const index = async (req, res, next) => {
  try {
    let {
      // dayWork = moment().format(commons.formatDayWork),
      dayWork,
      userId,
    } = req.query;
    console.log(" req.query", req.query);
    if (!userId) {
      // cham cong ho
      userId = req.user._id;
    }

    let workDays = await workDayModel
      .find(
        {
          dayWork: new RegExp(dayWork, "i"),
          userId: userId,
        },
        "-__v"
      )
      .sort(SORT_TIME_DESC);

    return res.status(200).json(workDays || []);
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
      { $sort: SORT_TIME_DESC },
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

const askComeLeave = async (req, res, next) => {
  try {
    const { time, typeAsk, title = "", reason = "", status } = req.body;
    let dayWork = moment(time).format(commons.formatDayWork);

    let query = {
      userId: req.user._id,
      dayWork: dayWork,
      ...commons.getDetailDate(time),
    };
    let updateData = {
      parentId: req.user.parentId._id,
      companyId: req.user.companyId._id,
    };

    // 0: chờ duyệt
    // 1: đã chấp nhận
    // -1: từ chối

    if (typeAsk === "comeLate") {
      updateData = {
        ...updateData,
        timeComeLateAsk: time,
        statusComeLateAsk: status || 0,
        titleComeLateAsk: title,
        reasonComeLateAsk: reason,
      };
    }
    if (typeAsk === "leaveEarly") {
      updateData = {
        ...updateData,
        timeLeaveEarlyAsk: time,
        statusLeaveEarlyAsk: status || 0,
        titleLeaveEarlyAsk: title,
        reasonLeaveEarlyAsk: reason,
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

export default {
  index,
  getDetailWorkDay,
  getListWorkDayCompany,
  updateWorkDay,
  askComeLeave,
};
