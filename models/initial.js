var Role = require("../models/role.model");
const Role_DATA = [
  {
    name: "Nhân viên",
    code: "staff",
    roleId: 0,
  },
  {
    name: "Nhân sự",
    code: "hr",
    roleId: 1,
  },
  {
    name: "Quản lý",
    code: "manager",
    roleId: 2,
  },
  {
    name: "Admin",
    code: "admin",
    roleId: 3,
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
module.exports = initial;
