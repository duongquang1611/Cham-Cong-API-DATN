// models/user.model.js
// load những thư viện chúng ta cần
import mongoose from "mongoose";
import moment from "moment";
import bcrypt from "bcrypt-nodejs";
const { Types, Schema, model } = mongoose;

// định nghĩ cấu trúc user model
var userSchema = new Schema(
  {
    username: { type: String, unique: true, required: true, default: null },
    password: { type: String, required: true, default: null },
    name: { type: String, default: null },
    roleId: {
      type: Types.ObjectId,
      required: true,
      ref: "Role",
      default: null,
    },
    companyId: {
      type: Types.ObjectId,
      ref: "Company",
      default: null,
    },
    parentId: { type: Types.ObjectId, ref: "User", default: null },
    phoneNumber: { type: String, default: null },
    // createdAt: { type: Date, default: Date.now() },
    // updatedAt: { type: Date, default: Date.now() },
    address: { type: String, default: null },
    email: { type: String, default: null },
    gender: { type: Number, default: null },
    dateOfBirth: { type: Date, default: null },
    avatar: {
      thumb200: { type: String, default: null },
      thumb300: { type: String, default: null },
      thumb500: { type: String, default: null },
      original: { type: String, default: null },
    },
    personId: { type: String, default: null },
    // test: { type: String, default: null },
  },
  { timestamps: true }
);

// create text index in all field
userSchema.index({ "$**": "text" });

// userSchema.index({ test: "text" });
userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
export default model("User", userSchema);
