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
const getPerson = async (personGroupId, personId) => {
  //  data =  {
  //     "personId": "25985303-c537-4467-b41d-bdb45cd95ca1",
  //     "persistedFaceIds": [
  //         "015839fb-fbd9-4f79-ace9-7675fc2f1dd9",
  //         "fce92aed-d578-4d2e-8114-068f8af4492e",
  //         "b64d5e15-8257-4af2-b20a-5a750f8940e7"
  //     ],
  //     "name": "Ryan",
  //     "userData": "User-provided data attached to the person."
  // }
  let res = await Axios({
    method: "get",
    url: `/persongroups/${personGroupId}/persons/${personId}`,
    baseURL: commons.FACE_RECO_URL,
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
      // "Content-Type": "application/json",
    },
  });
  return res;
};
const detect = async (dataUrl) => {
  console.log("detect");
  let res = await Axios({
    method: "post",
    url: `/detect`,
    baseURL: commons.FACE_RECO_URL,
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
      "Content-Type": "application/json",
    },
    params: {
      returnFaceId: true,
      returnFaceLandmarks: false,
      recognitionModel: "recognition_03",
      returnRecognitionModel: false,
      detectionModel: "detection_02",
    },
    data: {
      url: dataUrl,
    },
  });
  return res;
};
const identify = async (personGroupId, faceId) => {
  console.log("identify");
  // console.log({ personGroupId, faceId });
  let res = await Axios({
    method: "post",
    url: `/identify`,
    baseURL: commons.FACE_RECO_URL,
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
      "Content-Type": "application/json",
    },
    data: {
      personGroupId: personGroupId,
      faceIds: Array.isArray(faceId) ? faceId : [faceId],
      maxNumOfCandidatesReturned: 1,
      confidenceThreshold: 0.5,
    },
  });
  return res;
};
const deleteFace = async (personGroupId, personId, faceId) => {
  console.log("identify");
  console.log({ personGroupId });
  let res = await Axios({
    method: "delete",
    url: `/persongroups/${personGroupId}/persons/${personId}/persistedFaces/${faceId}`,
    baseURL: commons.FACE_RECO_URL,
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.FACE_KEY_01,
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
  getPerson,
  detect,
  identify,
  deleteFace,
};
export default faceResources;
