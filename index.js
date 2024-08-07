const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoute");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_DB_STRING);
// Confirming Connection
mongoose.connection.once("open", () => {
  console.log("Now Connected to MongoDB Atlas");
});

// Routes

// User
app.use("/users", userRoutes);

// Post
app.use("/posts", postRoutes);

// Server Listening
app.listen(process.env.PORT || 4000, () => {
  console.log(`API is now online on port ${process.env.PORT || 4000}`);
});

module.exports = app;
