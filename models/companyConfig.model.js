import mongoose from "mongoose";
import moment from "moment";
const { Types, model, Schema } = mongoose;

var companyConfigSchema = new Schema(
  {
    companyId: {
      type: Types.ObjectId,
      required: true,
      ref: "Company",
    },
    lat: { type: String, required: true, default: null },
    long: { type: String, required: true, default: null },
    // ipAddress: { type: String, required: true, default: null },
    startBreak: { type: String, required: true, default: "12:00:00" },
    endBreak: { type: String, required: true, default: "14:00:00" },
    checkin: { type: String, required: true, default: "08:00:00" },
    checkout: { type: String, required: true, default: "18:00:00" },
    allowCheckin: { type: String, required: true, default: "06:30:00" },
    allowCheckout: { type: String, required: true, default: "22:00:00" },
    maxMinutesComeLate: {
      type: Number,
      required: true,
      default: 60,
      min: [0, "Giá trị nhập không thể nhỏ hơn 0"],
    },
    maxMinutesLeaveEarly: {
      type: Number,
      required: true,
      default: 60,
      min: [0, "Giá trị nhập không thể nhỏ hơn 0"],
    },
  },
  {
    timestamps: true,
  }
);
companyConfigSchema.index({ "$**": "text" });
export default model("CompanyConfig", companyConfigSchema, "company_config");
