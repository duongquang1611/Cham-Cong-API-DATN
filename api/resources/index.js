import companyResources from "./company.resources.js";
import faceResources from "./face.resources.js";
import userResources from "./user.resources.js";

const resources = {
  ...companyResources,
  ...faceResources,
  ...userResources,
};

export default resources;
