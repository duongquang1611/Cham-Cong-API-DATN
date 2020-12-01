import Axios from "axios";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import dotenv from "dotenv";
import commons from "../../commons/index.js";
dotenv.config();

const createPerson = async (personGroupId, personId, personName) => {
  let res = await Axios({
    method: "post",
    url: `/persongroups/${personGroupId}/persons`,
    baseURL: commons.FACE_RECO_URL,
    data: {
      name: personName || "Create Person By Duong Quang",
      userData: personId,
    },
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
      "Content-Type": "application/json",
    },
  });
  //   console.log("createPerson ~ res", res);
  return res;
};

const userResources = {
  createPerson,
};
export default userResources;
