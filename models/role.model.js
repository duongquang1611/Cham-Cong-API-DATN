import mongoose from "mongoose";
const { Types, Schema, model } = mongoose;

var roleSchema = new Schema({
  name: { type: String, required: true, default: null },
  code: { type: String, required: true, default: null },
  level: { type: Number, default: null },
});

export default model("Role", roleSchema);
