// models/user.model.js
// load những thư viện chúng ta cần
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";
const { Types, Schema, model } = mongoose;

// định nghĩ cấu trúc user model
var userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  roleId: { type: Types.ObjectId, required: true, ref: "Role" },
  parentId: { type: Types.ObjectId, ref: "User" },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  address: { type: String },
  email: { type: String },
  gender: { type: Number },
  dateOfBirth: { type: Date },
});
userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
export default model("User", userSchema);
