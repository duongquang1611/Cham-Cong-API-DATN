
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import dotenv from "dotenv";
import commons from "../../commons/index.js";
import moment from "moment";
import mongoose from "mongoose";
import userModel from "../../models/user.model.js";
const { Types } = mongoose;

dotenv.config();
const getDetailUser =  async(userId )=>{
  let user=  await userModel
        .findOne({ _id: userId })
        .populate("companyId parentId userId");

        return user;
} 
const userResources = {
  getDetailUser,
};
export default userResources;
