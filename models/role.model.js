import mongoose from "mongoose";
const { Types, Schema, model } = mongoose;

var roleSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
});

export default model("Role", roleSchema);
