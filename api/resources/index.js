import companyResources from "./company.resources.js";
import userResources from "./user.resources.js";

const resources = {
  ...companyResources,
  ...userResources,
};

export default resources;
