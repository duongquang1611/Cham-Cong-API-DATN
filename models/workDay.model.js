import mongoose from "mongoose";
import moment from "moment";
const { Types, model, Schema } = mongoose;
const formatDayWork = "YYYY-MM-DD";
var workDaySchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    parentId: { type: Types.ObjectId, ref: "User", default: null },
    companyId: { type: Types.ObjectId, ref: "Company", default: null },
    dayWork: {
      type: String,
      required: true,
      default: moment().format(formatDayWork),
    },
    day: { type: Number, default: null },
    month: { type: Number, default: null },
    year: { type: Number, default: null },
    checkin: { type: Date, default: null },
    checkout: { type: Date, default: null },
    timeComeLateAsk: { type: String, default: null },
    timeLeaveEarlyAsk: { type: String, default: null },
    statusComeLateAsk: { type: Number, default: null },
    statusLeaveEarlyAsk: { type: Number, default: null },
    reasonComeLateAsk: { type: String, default: null },
    reasonComeLateAsk: { type: String, default: null },
    minutesComeLate: { type: Number, default: 0 },
    minutesLeaveEarly: { type: Number, default: 0 },
    isDayOff: { type: Boolean, default: false },
    isCheckining: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default model("WorkDay", workDaySchema, "work_day");
