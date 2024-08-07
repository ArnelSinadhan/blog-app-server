const express = require("express");
const mongoose = require("mongoose");
const { verify, verifyAdmin } = require("../middlewares/auth");
const PostController = require("../controllers/postController");
const upload = require("../config/gridfs");

const router = express.Router();

// Routes

// Adding Post
router.post("/addPost", verify, upload.single("file"), PostController.addPost);

// Getting all post
router.get("/getAllPost", PostController.getAllPost);

// Getting user posts
router.get("/getUserPost", verify, PostController.getUserPost);

// Deleting user posts
router.delete("/deleteUserPost/:postId", verify, PostController.deleteUserPost);
// Getting specific post
router.get("/:postId/getPostDetails", verify, PostController.getPostDetails);

// Updating user posts
router.patch(
  "/updateUserPost/:postId",
  verify,
  upload.single("file"),
  PostController.updateUserPost
);

// Adding comment to post
router.patch("/:postId/addComments", verify, PostController.addComments);

// Getting all comments for a specific post
router.get("/:postId/getAllComments", verify, PostController.getAllComments);

// Deleting post admin only
router.delete(
  "/:postId/deletePost",
  verify,
  verifyAdmin,
  PostController.deletePost
);

// Deleting a specific comment (Admin only)
router.delete(
  "/:postId/deleteComments/:commentId",
  verify,
  verifyAdmin,
  PostController.deleteComments
);

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
