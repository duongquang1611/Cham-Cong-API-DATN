var mongoose = require("mongoose");

var Schema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  roleId: { type: Number, required: true },
});

module.exports = mongoose.model("Role", Schema);
