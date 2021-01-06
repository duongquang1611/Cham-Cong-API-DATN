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
    parentId: { type: Types.ObjectId, default: null, ref: "User" },
    companyId: { type: Types.ObjectId, default: null, ref: "Company" },
    fromDate: { type: String, default: null },
    toDate: { type: String, default: null },
    type: { type: String, default: null },
    title: { type: String, default: null },
    reason: { type: String, default: null },
    status: { type: Number, default: null },
    acceptedBy: { type: Types.ObjectId, default: null, ref: "User" },
    // 0: chờ duyệt
    // 1: đã đồng ý
    //-1: từ chối
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

askDayOffSchema.index({ "$**": "text" });

export default model("AskDayOff", askDayOffSchema, "day_off");
