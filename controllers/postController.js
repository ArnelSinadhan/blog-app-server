const Post = require("../models/Post");
const { errorHandler } = require("../middlewares/auth");

// Adding a post
module.exports.addPost = (req, res) => {
  const userId = req.user.id;
  const userName = req.user.userName;
  const profilePic = req.user.profilePic;
  const { title, content, author } = req.body;
  const image = req.file ? req.file.filename : undefined;

  // Validate that userName and profilePic are available
  if (!userName || !profilePic) {
    return res.status(400).json({ error: "User details are incomplete" });
  }

  const newPost = new Post({
    user: {
      userId,
      userName,
      profilePic,
    },
    title,
    content,
    author,
    image, // Save the image filename
    comments: [],
    createdDate: new Date(),
  });

  return newPost
    .save()
    .then((savedPost) => {
      return res.status(201).send({
        message: "Post added successfully",
        savedPost,
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

// Getting all posts
module.exports.getAllPost = (req, res) => {
  return Post.find({})
    .then((posts) => {
      if (posts.length > 0) {
        return res.status(200).send(posts);
      } else {
        return res.status(404).send({ error: "No posts available" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

// Getting user posts
module.exports.getUserPost = (req, res) => {
  const userId = req.user.id;

  return Post.find({ "user.userId": userId })
    .then((posts) => {
      if (posts.length > 0) {
        return res.status(200).send(posts);
      } else {
        return res.status(404).send({ error: "No posts found for this user" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

// Deleting user posts
module.exports.deleteUserPost = (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  return Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).send({ error: "Post not found" });
      }

      // Check if the user is the author of the post
      const isAuthor = post.user.some((user) => user.userId === userId);

      if (!isAuthor && !req.user.isAdmin) {
        return res.status(403).send({ error: "Unauthorized action" });
      }

      // Delete the post
      return Post.findByIdAndDelete(postId)
        .then(() => {
          res.status(200).send({ message: "Post deleted successfully" });
        })
        .catch((error) => errorHandler(error, req, res));
    })
    .catch((error) => errorHandler(error, req, res));
};

// Updating user posts
module.exports.updateUserPost = async (req, res) => {
  const { postId } = req.params; // Extract postId from req.params
  const { title, content, author } = req.body;
  const image = req.file ? req.file.filename : undefined; // Handle image upload

  // Prepare update data
  const updateData = { title, content, author };
  if (image) updateData.image = image;

  try {
    // Find and update the post
    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
    });

    if (!updatedPost) {
      return res.status(404).send({
        error: "Post not found.",
      });
    }

    res.status(200).send({
      message: "Post updated successfully",
      updatedPost,
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Getting specific post
module.exports.getPostDetails = (req, res) => {
  const postId = req.params.postId;

  return Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).send({ error: "Post not found" });
      } else {
        return res.status(200).send(post);
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

// Adding user's comment
module.exports.addComments = (req, res) => {
  const postId = req.params.postId;
  const { comment } = req.body;
  const userId = req.user.id;

  if (req.user.isAdmin === true) {
    return res.status(403).send({ error: "Admin cannot add comments." });
  }

  if (!comment) {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }

  return Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).send({ error: "Post not found" });
      }

      const newComment = {
        user: [
          {
            userId,
            userName: req.user.userName,
            profilePic: req.user.profilePic,
          },
        ],
        comment,
      };

      post.comments.push(newComment);

      return post.save().then((updatedPost) => {
        return res.status(200).send({
          message: "Comment added successfully",
          updatedPost,
        });
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

// Getting all comments for a post
module.exports.getAllComments = (req, res) => {
  const postId = req.params.postId;

  return Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).send({ error: "Post not found" });
      }

      return res.status(200).send({
        message: "Comments retrieved successfully",
        comments: post.comments,
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

// Deleting Post (Admin only)
module.exports.deletePost = (req, res) => {
  const postId = req.params.postId;

  return Post.findByIdAndDelete(postId)
    .then((deletedPost) => {
      if (!deletedPost) {
        return res.status(404).send({ error: "Post not found" });
      }

      return res.status(200).send({
        message: "Post deleted successfully",
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

// Deleting specific comments (Admin only)
module.exports.deleteComments = (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  return Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).send({ error: "Post not found" });
      }

      // Filter out the comment to delete
      const updatedComments = post.comments.filter(
        (comment) => comment._id.toString() !== commentId
      );

      // If comment not found
      if (updatedComments.length === post.comments.length) {
        return res.status(404).send({ error: "Comment not found" });
      }

      post.comments = updatedComments;

      return post.save().then(() => {
        return res.status(200).send({
          message: "Comment deleted successfully",
        });
      });
    })
    .catch((error) => errorHandler(error, req, res));
};
