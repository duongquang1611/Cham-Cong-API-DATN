import mongoose from "mongoose";

var Schema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  roleId: { type: Number, required: true },
});

export default mongoose.model("Role", Schema);
