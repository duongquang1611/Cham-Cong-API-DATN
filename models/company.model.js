import mongoose from "mongoose";
const { Types, Schema, model } = mongoose;

// định nghĩ cấu trúc company model
var companySchema = new Schema(
  {
    name: { type: String, required: true, default: null },
    phoneNumber: { type: String, default: null },
    email: { type: String, default: null },
    address: { type: Types.ObjectId, default: null },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      default: null,
    },
    // createdAt: { type: Date, default: Date.now() },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      default: null,
    },
    // updatedAt: { type: Date, default: Date.now() },
    website: { type: String, default: null },
    representativeName: { type: String, default: null },
    representativeEmail: { type: String, default: null },
    representativePhoneNumber: { type: String, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default model("Company", companySchema);
