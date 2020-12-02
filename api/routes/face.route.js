import express from "express";
import handleError from "../../commons/handleError.js";
import userModel from "../../models/user.model.js";
import controller from "../controllers/face.controller.js";
import middleware from "../../middleware/index.js";
var router = express.Router();
import { multerSingle } from "../handlers/multer.upload.js";
import os from "os";
const { auth, checkObjectId, isAdminSystem } = middleware;
const listKey = ["username", "password", "name", "roleId"];

// const { networkInterfaces } = os;
// const nets = networkInterfaces();
// console.log("router.get ~ nets", nets);
// const results = Object.create(null); // or just '{}', an empty object

// for (const name of Object.keys(nets)) {
//   for (const net of nets[name]) {
//     // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
//     if (net.family === "IPv4" && !net.internal) {
//       if (!results[name]) {
//         results[name] = [];
//       }

//       results[name].push(net.address);
//     }
//   }
// }
// console.log("001~ results", results);

router.get("/test", async (req, res, next) => {
  // console.log("🚀 ~ file: face.route.js ~ line 32 ~ router.get ~ req", req.ip);
  const { networkInterfaces } = os;
  const nets = networkInterfaces();
  // console.log("router.get ~ nets", nets);
  const results = Object.create(null); // or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }

        results[name].push(net.address);
      }
    }
  }
  console.log("router.get ~ results", results);

  return res.json(results);
});

// add face
router.post("/detect", [auth, multerSingle.single("file")], controller.detect);

// create person for user
router.post(
  "/:id/create-person",
  [auth, checkObjectId],
  controller.createPerson
);

// add face
router.post(
  "/:id/add-face",
  [auth, checkObjectId, multerSingle.single("file")],
  controller.addFace
);

// create person group for company
router.put(
  "/:id/create-person-group",
  [auth, checkObjectId],
  controller.createPersonGroup
);

// train person group for company
router.post("/:id/train", [auth, checkObjectId], controller.trainGroup);

router.post("/:id/identify", [auth, checkObjectId], controller.identify);

router.post(
  "/:id/detect-and-identify",
  [auth, checkObjectId, multerSingle.single("file")],
  controller.detectAndIdentify
);

// list person group in company
router.get("/:id/persons", [auth, checkObjectId], controller.listPersons);

export default router;
