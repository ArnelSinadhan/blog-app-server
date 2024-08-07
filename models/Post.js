const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: [
    {
      userId: {
        type: String,
        required: [true, "User id is required"],
      },
      userName: {
        type: String,
        required: [true, "UserName is required"],
      },
      profilePic: {
        type: String,
        required: [true, "Profile Picture is required"],
      },
    },
  ],
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  author: {
    type: String,
    required: [true, "Author is required"],
  },
  image: {
    type: String,
    required: [true, "Image is required"],
  },
  comments: [
    {
      user: [
        {
          userId: {
            type: String,
            required: [true, "User Id is required"],
          },
          userName: {
            type: String,
            required: [true, "UserName is required"],
          },
          profilePic: {
            type: String,
            required: [true, "Profile Picture is required"],
          },
        },
      ],

      comment: {
        type: String,
      },
    },
  ],
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Post", PostSchema);
