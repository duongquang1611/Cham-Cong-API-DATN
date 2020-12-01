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

const faceResources = {
  createPerson,
  createPersonGroup,
};
export default faceResources;
