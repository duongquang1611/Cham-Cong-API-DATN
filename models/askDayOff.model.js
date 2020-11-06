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
    fromDate: { type: Date, default: null },
    toDate: { type: Date, default: null },
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

export default model("AskDayOff", askDayOffSchema, ask_day_off);
