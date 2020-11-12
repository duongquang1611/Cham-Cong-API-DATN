import mongoose from "mongoose";
import moment from "moment";
const { Types, model, Schema } = mongoose;
import commons from "../commons/index.js";

var workDaySchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" }, //put neu cham cong ho
    parentId: { type: Types.ObjectId, ref: "User", default: null }, //put neu cham cong ho
    companyId: { type: Types.ObjectId, ref: "Company", default: null }, //put neu cham cong ho
    dayWork: {
      type: String,
      required: true,
      default: moment().format(commons.formatDayWork),
    },
    day: { type: Number, default: moment().format("D") },
    month: { type: Number, default: moment().format("M") },
    year: { type: Number, default: moment().format("YYYY") },
    checkin: { type: Date, default: null },
    checkout: { type: Date, default: null }, // put
    timeComeLateAsk: { type: String, default: null }, //put
    timeLeaveEarlyAsk: { type: String, default: null }, //put
    titleComeLateAsk: { type: String, default: null }, //put
    titleLeaveEarlyAsk: { type: String, default: null }, //put
    statusComeLateAsk: { type: Number, default: null }, //put
    statusLeaveEarlyAsk: { type: Number, default: null }, //put
    reasonComeLateAsk: { type: String, default: null }, //put
    reasonLeaveEarlyAsk: { type: String, default: null }, //put
    minutesComeLate: { type: Number, default: 0 }, //put
    minutesLeaveEarly: { type: Number, default: 0 }, //put
    isDayOff: { type: Boolean, default: false }, //put
    isSuccessDay: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default model("WorkDay", workDaySchema, "work_day");
