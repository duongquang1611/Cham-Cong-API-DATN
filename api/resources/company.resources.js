import Axios from "axios";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import dotenv from "dotenv";
import commons from "../../commons/index.js";
import moment from "moment";
import mongoose from "mongoose";
import userModel from "../../models/user.model.js";
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
const createReport = async (
  data,
  date = new Date(),
  companyId,
  type = "work_day"
) => {
  let daysInMonth = moment(date).daysInMonth();
  let usersInCompany = await userModel
    .find({
      companyId: Types.ObjectId(companyId),
    })
    .populate("roleId");

  let tableHead = ["STT", "Họ tên", "Chức vụ", "Ngày sinh"];
  let widthArr = [40, 150, 100, 120];
  for (let i = 0; i < daysInMonth + 1; i++) {
    if (i === daysInMonth) {
      tableHead.push("Tổng");
    } else tableHead.push(i + 1);
    widthArr.push(60);
  }
  let dataEachUser = null;
  let dayActiveWork = [];
  let rowData = [];
  let msg = "";
  let tableData = [];
  usersInCompany.forEach((userData, index) => {
    dataEachUser = data[userData?._id];
    rowData = [];
    msg = "";
    if (dataEachUser) {
      dayActiveWork = dataEachUser.map((item) => item.day);
    } else {
      dayActiveWork = [];
    }
    for (let j = -3; j < daysInMonth + 2; j++) {
      switch (j) {
        case -3:
          rowData.push(index + 1);
          break;
        case -2:
          rowData.push(userData?.name);
          break;
        case -1:
          rowData.push(userData?.roleId?.name);
          break;
        case 0:
          if (userData?.dateOfBirth) {
            rowData.push(
              moment(userData?.dateOfBirth).format(commons.FORMAT_DATE_VN)
            );
          } else {
            rowData.push(commons.noData);
          }
          break;
        case daysInMonth + 1:
          // sum
          msg = 0;
          if (dataEachUser && dataEachUser.length > 0) {
            msg = dataEachUser.length;
          }
          rowData.push(msg);
          break;

        default:
          // check or uncheck
          msg = "";
          if (dayActiveWork && dayActiveWork.length > 0) {
            if (dayActiveWork.includes(j)) msg = "X";
          }

          rowData.push(msg);
          break;
      }
    }
    tableData.push(rowData);
  });
  return tableData;
};
const companyResources = {
  getDetailCompany,
  createReport,
};
export default companyResources;
