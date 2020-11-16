import mongoose from "mongoose";
import moment from "moment";
const { Types, Schema, model } = mongoose;

// định nghĩ cấu trúc company model
var askDayOffSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
      default: null,
    },
    parentId: { type: String, default: null, ref: "User" },
    companyId: { type: String, default: null, ref: "Company" },
    fromDate: { type: String, default: null },
    toDate: { type: String, default: null },
    type: { type: String, default: null },
    title: { type: String, default: null },
    reason: { type: String, default: null },
    status: { type: Number, default: null },
    // 0: chờ duyệt
    // 1: đã đồng ý
    //-1: từ chối
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default model("AskDayOff", askDayOffSchema, "day_off");
