import mongoose from "mongoose";

const { Types, model, Schema } = mongoose;

var checkinInfoSchema = new Schema({
  companyId: {
    type: Types.ObjectId,
    required: true,
    default: null,
    ref: "Company",
  },
  lat: { type: String, required: true, default: null },
  long: { type: String, required: true, default: null },
  ipAddress: { type: String, required: true, default: null },
  updatedAt: { type: Date, default: Date.now() },
});

export default model("CompanyConfig", checkinInfoSchema, "company_config");
