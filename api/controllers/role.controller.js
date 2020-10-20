import roleModel from "../../models/role.model.js";

const index = async (req, res, next) => {
  try {
    let roles = await roleModel.find({}, "-__v");
    res.json(roles);
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

export default {
  index,
};
