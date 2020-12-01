import Axios from "axios";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import dotenv from "dotenv";
import commons from "../../commons/index.js";
dotenv.config();

const getDetailCompany = async (companyId) => {
  try {
    let company = await companyModel
      .findOne({ _id: companyId }, " -__v")
      .populate({ path: "createdBy", select: "-__v -password" })
      .populate({ path: "updatedBy", select: "-__v -password" });
    let config = await companyConfigModel.findOne({ companyId: companyId });

    company = { ...company._doc, config: { ...config._doc } };
    return company || {};
  } catch (error) {
    return {};
  }
};
const createPersonGroup = async (companyId, companyName) => {
  let res = await Axios({
    method: "put",
    url: `/persongroups/${companyId}`,
    baseURL: commons.FACE_RECO_URL,
    data: {
      name: companyName,
      userData: "Group Person Face Make By Duong Quang",
      recognitionModel: "recognition_03",
    },
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
      "Content-Type": "application/json",
    },
  });
  return res;
};

const companyResources = {
  getDetailCompany,
  createPersonGroup,
};
export default companyResources;
