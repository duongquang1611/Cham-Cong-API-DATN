import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import workDayModel from "../../models/workDay.model.js";
import moment from "moment";
import resources from "../resources/index.js";

// search all work day
const index = async (req, res, next) => {
  try {
    let {
      dayWork = moment().format(commons.formatDayWork),
      userId,
    } = req.query;
    console.log(" req.query", req.query);
    if (!userId) {
      // cham cong ho
      userId = req.user._id;
    }
    console.log(dayWork, userId);
    let workDays = await workDayModel.find(
      {
        dayWork: new RegExp(dayWork, "i"),
        userId: userId,
      },
      "-__v"
    );

    return res.status(200).json(workDays || []);
  } catch (error) {
    console.log("error", error);
    return handleError(res, error);
  }
};

const getDetailWorkDay = async (req, res, next) => {
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
  try {
    let workDays = await workDayModel.findOne({ companyId: companyId });
    return res.status(200).json(workDays || []);
  } catch (error) {
    return handleError(res, JSON.stringify(error));
  }
};

const updateWorkDay = async (req, res, next) => {
  try {
    let updateData = req.body;

    let now = moment();

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

    if (updateData.isCheckout) {
      let checkIsBeforeDate = commons.isBeforeDate(allowCheckout, now);
      if (checkIsBeforeDate) {
        return handleError(
          res,
          `Không thể thực hiện checkout sau ${detailCompany.config.allowCheckout}`
        );
      }
    } else {
      let checkIsBeforeDate = commons.isBeforeDate(now, allowCheckin);

      if (checkIsBeforeDate) {
        return handleError(
          res,
          `Không thể thực hiện checkin trước ${detailCompany.config.allowCheckin}`
        );
      }
    }

    // set parentId, company
    updateData = {
      ...updateData,
      parentId: user.parentId._id,
      companyId: user.companyId._id,
    };

    // check late, early to put db: minutesComeLate, minutesLeaveEarly
    // console.log(commons.getDiffTime(now));

    if (!updateData.dayWork) {
      query.dayWork = now.format(commons.formatDayWork);
    }

    // time checkin auto khoi tao khi tao ban ghi
    if (updateData.isCheckout) {
      // checkout

      let diff = commons.getDurationToMinutes(now, defaultCheckout, false);

      updateData = {
        ...updateData,
        isSuccessDay: true,
        minutesLeaveEarly: diff < 0 ? 0 : diff, // checkout sau gio hanh chinh thi 0 phut di muon
        checkout: now,
      };
    } else {
      let diff = commons.getDurationToMinutes(now, defaultCheckin, false);
      console.log("now, defaultCheckin", now, defaultCheckin);
      updateData = {
        ...updateData,
        checkin: now,
        minutesComeLate: diff > 0 ? diff : 0,
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
    return handleError(res, JSON.stringify(error));
  }
};

export default {
  index,
  getDetailWorkDay,
  getListWorkDayCompany,
  updateWorkDay,
};
