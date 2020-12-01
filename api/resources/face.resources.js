import Axios from "axios";
import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";
import dotenv from "dotenv";
import commons from "../../commons/index.js";
dotenv.config();

const createPerson = async (personGroupId, userId, personName) => {
  console.log("createPerson");
  let res = await Axios({
    method: "post",
    url: `/persongroups/${personGroupId}/persons`,
    baseURL: commons.FACE_RECO_URL,
    data: {
      name: personName || "Create Person By Duong Quang",
      userData: userId,
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
  console.log("createPersonGroup");
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

const addFace = async (personGroupId, personId, dataUrl) => {
  console.log("addFace");
  let res = await Axios({
    method: "post",
    url: `/persongroups/${personGroupId}/persons/${personId}/persistedFaces`,
    baseURL: commons.FACE_RECO_URL,
    params: { detectionModel: "detection_02" },
    data: {
      url: dataUrl,
    },
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
      "Content-Type": "application/json",
    },
  });
  return res;
};

const trainGroup = async (personGroupId) => {
  console.log("trainGroup");
  let res = await Axios({
    method: "post",
    url: `/persongroups/${personGroupId}/train`,
    baseURL: commons.FACE_RECO_URL,
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
      "Content-Type": "application/json",
    },
  });
  return res;
};
const listPersons = async (personGroupId) => {
  console.log({ personGroupId });
  let res = await Axios({
    method: "get",
    url: `/persongroups/${personGroupId}/persons`,
    baseURL: commons.FACE_RECO_URL,
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
  addFace,
  trainGroup,
  listPersons,
};
export default faceResources;
