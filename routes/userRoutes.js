const express = require("express");
const mongoose = require("mongoose");
const { verify } = require("../middlewares/auth");
const UserController = require("../controllers/userController");
const upload = require("../config/gridfs");

const router = express.Router();

router.post("/register", upload.single("file"), UserController.registerUser);
router.post("/login", UserController.loginUser);
router.get("/getProfile", verify, UserController.getProfile);

// Route to fetch image by filename
router.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });

  gfs
    .openDownloadStreamByName(filename)
    .on("error", (err) => {
      return res.status(404).json({ err: "No file exists" });
    })
    .pipe(res)
    .on("finish", () => {
      console.log("Image sent successfully");
    });
});

module.exports = router;
