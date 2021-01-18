import Axios from "axios";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import dotenv from "dotenv";
import commons from "../../commons/index.js";
import moment from "moment";
import mongoose from "mongoose";
import userModel from "../../models/user.model.js";
import resources from "./index.js";
import workDayModel from "../../models/workDay.model.js";
const { Types } = mongoose;

dotenv.config();

const getDetailCompany = async (companyId) => {
  try {
    let company = await companyModel
      .findOne({ _id: companyId }, " -__v")
      .populate({ path: "createdBy", select: "-__v -password" })
      .populate({ path: "updatedBy", select: "-__v -password" });
    let config = await companyConfigModel.findOne({ companyId: companyId });

    company = { ...company._doc, config: { ...config._doc } };
    return company || {};
  } catch (error) {
    return {};
  }
};
const createReport = async (data, daysInMonth, companyId) => {
  let usersInCompany = await userModel.aggregate([
    { $match: { companyId: Types.ObjectId(companyId) } },
    commons.lookUp("roleId", "roles", "_id", "roleId"),
    { $unwind: { path: "$roleId", preserveNullAndEmptyArrays: true } },
    { $sort: { "roleId.level": -1 } },
  ]);

  let dataEachUser = null;
  let dayActiveWork = [];
  let dataComeLate = [];
  let dataLeaveEarly = [];
  let rowData = [[], [], []];
  let msgWorkDay = 0;
  let msgComeLate = 0;
  let msgLeaveEarly = 0;
  let tableData = { workDay: [], comeLate: [], leaveEarly: [] };
  usersInCompany.forEach((userData, index) => {
    dataEachUser = data[userData?._id];
    rowData = [[], [], []];
    if (dataEachUser) {
      dayActiveWork = dataEachUser
        .filter((item) => item?.isSuccessDay)
        .map((item) => item.day);

      dataComeLate = dataEachUser.filter((item) => {
        if (item?.minutesComeLate) return item.minutesComeLate > 0;
        return;
      });
      dataLeaveEarly = dataEachUser.filter((item) => {
        if (item?.minutesLeaveEarly) return item.minutesLeaveEarly > 0;
        return;
      });
    } else {
      dayActiveWork = [];
      dataComeLate = [];
      dataLeaveEarly = [];
    }
    for (let j = -3; j < daysInMonth + 2; j++) {
      switch (j) {
        case -3:
          rowData[0].push(index + 1);
          rowData[1].push(index + 1);
          rowData[2].push(index + 1);
          break;
        case -2:
          rowData[0].push(userData?.name);
          rowData[1].push(userData?.name);
          rowData[2].push(userData?.name);
          break;
        case -1:
          rowData[0].push(userData?.roleId?.name);
          rowData[1].push(userData?.roleId?.name);
          rowData[2].push(userData?.roleId?.name);
          break;
        case 0:
          let dateFormat = commons.noData;
          if (userData?.dateOfBirth) {
            dateFormat = moment(userData?.dateOfBirth).format(
              commons.FORMAT_DATE_VN
            );
          }
          rowData[0].push(dateFormat);
          rowData[1].push(dateFormat);
          rowData[2].push(dateFormat);
          break;
        case daysInMonth + 1:
          // sum
          msgWorkDay = 0;
          msgComeLate = 0;
          msgLeaveEarly = 0;
          if (dataEachUser && dataEachUser.length > 0 && dayActiveWork) {
            msgWorkDay = dayActiveWork.length;
          }
          if (dataComeLate && dataComeLate.length > 0)
            msgComeLate = dataComeLate.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.minutesComeLate,
              0
            );
          if (dataLeaveEarly && dataLeaveEarly.length > 0)
            msgLeaveEarly = dataLeaveEarly.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.minutesLeaveEarly,
              0
            );
          rowData[0].push(msgWorkDay);
          rowData[1].push(msgComeLate + "ph");
          rowData[2].push(msgLeaveEarly + "ph");
          break;

        default:
          // check or uncheck
          msgWorkDay = "";
          msgComeLate = "";
          msgLeaveEarly = "";
          if (dayActiveWork && dayActiveWork.length > 0) {
            if (dayActiveWork.includes(j)) msgWorkDay = "X";
          }
          if (dataComeLate && dataComeLate.length > 0) {
            let dayComeLate = dataComeLate.find((item) => item.day == j);
            if (dayComeLate) msgComeLate = dayComeLate.minutesComeLate;
          }
          if (dataLeaveEarly && dataLeaveEarly.length > 0) {
            let dayLeaveEarly = dataLeaveEarly.find((item) => item.day == j);
            if (dayLeaveEarly) msgLeaveEarly = dayLeaveEarly.minutesLeaveEarly;
          }

          rowData[0].push(msgWorkDay);
          rowData[1].push(msgComeLate ? msgComeLate + "ph" : msgComeLate);
          rowData[2].push(msgLeaveEarly ? msgLeaveEarly + "ph" : msgLeaveEarly);
          break;
      }
    }
    tableData.workDay.push(rowData[0]);
    tableData.comeLate.push(rowData[1]);
    tableData.leaveEarly.push(rowData[2]);
  });
  return tableData;
};
const fakeWorkDay = async (props) => {
  let { now = new Date(), ...updateData } = props;

  now = new Date(now);
  let user;
  if (updateData?.userId) {
    // cham cong ho, truyen user vao body
    user = await userModel
      .findById(updateData?.userId)
      .populate({
        path: "companyId",
        select: "-__v",
      })
      .populate({
        path: "roleId",
        select: "-__v",
      })
      .populate({
        path: "parentId",
        select: "-__v -password",
      })
      .select("-__v -password")
      .exec();
    // console.log({ newUser });
  }
  let query = {
    userId: user._id,
  };

  // get config company
  let detailCompany = await resources.getDetailCompany(user.companyId._id);
  let allowCheckin = commons.setTimeToDate(
    detailCompany.config.allowCheckin,
    new Date(now)
  );
  let allowCheckout = commons.setTimeToDate(
    detailCompany.config.allowCheckout,
    new Date(now)
  );
  let defaultCheckin = commons.setTimeToDate(
    detailCompany.config.checkin,
    new Date(now)
  );
  let defaultCheckout = commons.setTimeToDate(
    detailCompany.config.checkout,
    new Date(now)
  );
  console.log({
    now,
    defaultCheckin,
    test: detailCompany.config.checkin,
    day: moment(now).format("D"),
    month: moment(now).format("M"),
    year: moment(now).format("YYYY"),
  });

  // set parentId, company, day, month, year
  updateData = {
    ...updateData,
    parentId: user?.parentId?._id || null,
    companyId: user.companyId._id,
    day: moment(now).format("D"),
    month: moment(now).format("M"),
    year: moment(now).format("YYYY"),
  };

  if (!updateData.dayWork) {
    query.dayWork = moment(now).format(commons.formatDayWork);
  } else {
    query.dayWork = updateData.dayWork;
  }
  let oldData = await workDayModel.findOne(query);

  // time checkin auto khoi tao khi tao ban ghi
  if (updateData.isCheckout) {
    // checkout

    // date1 - date2
    let diff = commons.getDurationToMinutes(defaultCheckout, now, false);
    // 11h ,12h -> < 0
    // 13h, 12h -> > 0
    if (oldData?.leaveEarlyAsk?.time && diff > 0) {
      diff = (diff < 0 ? 0 : diff) + (oldData?.minutesLeaveEarly || 0);
    }

    updateData = {
      ...updateData,
      isSuccessDay: true,
      minutesLeaveEarly: diff < 0 ? 0 : diff, // checkout sau gio hanh chinh thi 0 phut di muon
      checkout: now,
    };
  } else {
    // date1-date2
    let diff = commons.getDurationToMinutes(defaultCheckin, now, false);
    console.log({ diff });
    if (oldData?.comeLateAsk?.time && diff < 0) {
      diff = (diff < 0 ? Math.abs(diff) : 0) + (oldData?.minutesComeLate || 0);
      diff = diff < 0 ? 0 : -diff;
    }

    updateData = {
      ...updateData,
      checkin: now,
      minutesComeLate: diff < 0 ? Math.abs(diff) : 0,
    };
  }

  let options = { upsert: true, new: true, setDefaultsOnInsert: true };
  // Since console.log({ query, updateData, options });
  let workDay = await workDayModel
    .findOneAndUpdate(query, updateData, options)
    .select("-__v");
  //  upsert creates a document if not finds a document, you don't need to create another one manually.
  return workDay;
};

const companyResources = {
  getDetailCompany,
  createReport,
  fakeWorkDay,
};
export default companyResources;
