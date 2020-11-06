import handleError from "../../commons/handleError.js";
import commons from "../../commons/index.js";
import config from "../../config/index.js";
import mongoose from "mongoose";
import workDayModel from "../../models/workDay.model.js";
import moment from "moment";
import resources from "../resources/index.js";

// search all user
const index = async (req, res, next) => {
  try {
    return res.status(200).json({});
  } catch (error) {
    return handleError(res, JSON.stringify(error));
  }
};

const getDetailWorkDay = async (req, res, next) => {
  try {
    return res.status(200).json();
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
    let allowCheckin = commons.setTimeToDate(
      now,
      detailCompany.config.allowCheckin
    );
    let allowCheckout = commons.setTimeToDate(
      now,
      detailCompany.config.allowCheckout
    );
    let defaultCheckin = commons.setTimeToDate(
      now,
      detailCompany.config.checkin
    );
    let defaultCheckout = commons.setTimeToDate(
      now,
      detailCompany.config.checkout
    );

    // check allow checkout, checkin
    if (updateData.isCheckout) {
      let checkIsBeforeDate = commons.isBeforeDate(now, allowCheckout);
      if (checkIsBeforeDate) {
        return handleError(
          res,
          `Không thể thực hiện checkout sau ${detailCompany.config.allowCheckout}`
        );
      }
    } else {
      let checkIsBeforeDate = commons.isBeforeDate(allowCheckin, now);
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
      updateData = {
        ...updateData,
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
