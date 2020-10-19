import mongoose from "mongoose";
const { Types, Schema, model } = mongoose;

// định nghĩ cấu trúc company model
var companySchema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String },
  address: { type: Types.ObjectId },
  createdBy: { type: Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedBy: { type: Types.ObjectId, ref: "User", required: true },
  updatedAt: { type: Date, default: Date.now() },
  website: { type: String },
  representativeName: { type: String },
  representativeEmail: { type: String },
  representativePhoneNumber: { type: String },
});

export default model("Company", companySchema);
