// models/user.model.js
// load những thư viện chúng ta cần
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";
// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var schema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: {
    type: String,
  },
  phoneNumber: { type: String },
  roleId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});
schema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
schema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
export default mongoose.model("User", schema);
