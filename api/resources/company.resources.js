import companyModel from "../../models/company.model.js";
import companyConfigModel from "../../models/companyConfig.model.js";

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

const companyResources = {
  getDetailCompany,
};
export default companyResources;
