import Role from "../models/role.model.js";
const Role_DATA = [
  {
    name: "Nhân viên",
    code: "staff",
    level: "",
  },
  {
    name: "Quản lý",
    code: "manager",
    level: "",
  },
  {
    name: "Quản lý nhân sự",
    code: "admin_company",
    level: "",
  },
  {
    name: "Giám đốc",
    code: "director",
    level: "",
  },
  {
    name: "Quản  trị hệ thống",
    code: "admin_system",
    level: "",
  },
];
function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      // k co role thi add role
      Role_DATA.map((item) => {
        new Role(item).save((err) => {
          if (err) {
            console.log("error", err);
          }
          console.log(`added ${item.code} to roles collection`);
        });
      });

      //   new Role({
      //     name: "Admin",
      //     code: "admin",
      //     roleId: 3,
      //   }).save((err) => {
      //     if (err) {
      //       console.log("error", err);
      //     }

      //     console.log("added 'admin' to roles collection");
      //   });
    }
  });
}
export default initial;
