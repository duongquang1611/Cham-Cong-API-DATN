import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import moment from "moment";
const ROLE_DATA = [
  {
    name: "Nhân viên",
    code: "staff",
    level: 1,
  },
  {
    name: "Quản lý",
    code: "manager",
    level: 2,
  },
  {
    name: "Quản lý nhân sự",
    code: "admin_company",
    level: 2,
  },
  {
    name: "Giám đốc",
    code: "director",
    level: 3,
  },
  {
    name: "Quản trị hệ thống",
    code: "admin_system",
    level: -1,
  },
];

const ADMIN_DATA = {
  username: "admin",
  password: 123456,
  name: "Admin",
  phoneNumber: "0123456789",
};

const initialRole = () => {
  let promises = [];

  ROLE_DATA.forEach((element) => {
    promises.push(new Role(element).save());
  });

  return promises;
};
const initialAdminSystem = async () => {
  try {
    let countUser = await User.estimatedDocumentCount();
    if (!countUser) {
      let role = await Role.findOne({ code: "admin_system" });
      const passwordHash = await new User().encryptPassword(
        ADMIN_DATA.password
      );
      if (role) {
        let adminData = {
          ...ADMIN_DATA,
          roleId: role._id,
          password: passwordHash,
        };
        let user = await new User(adminData).save();
        if (user) {
          console.log("Add User Admin Success");
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const initial = async () => {
  try {
    let countRole = await Role.estimatedDocumentCount();
    if (!countRole) {
      let rs = await Promise.all(initialRole());
    }
    await initialAdminSystem();
  } catch (error) {
    console.log(error);
  }

  //  => {
  //     if (!err && count === 0) {
  //       // k co role thi add role
  //       ROLE_DATA.map((item) => {
  //         new Role(item).save((err) => {
  //           if (err) {
  //             console.log("error", err);
  //           }
  //           console.log(`added ${item.code} to roles collection`);
  //         });
  //       });

  //       //   new Role({
  //       //     name: "Admin",
  //       //     code: "admin",
  //       //     roleId: 3,
  //       //   }).save((err) => {
  //       //     if (err) {
  //       //       console.log("error", err);
  //       //     }

  //       //     console.log("added 'admin' to roles collection");
  //       //   });
  //     }
  //   });
};
export default initial;
