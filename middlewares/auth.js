const jwt = require("jsonwebtoken");
require("dotenv").config();

// Create Token for login User
module.exports.createAccessToken = (user) => {
  const data = {
    id: user._id,
    email: user.email,
    userName: user.userName, // Include userName
    profilePic: user.profilePic, // Include profilePic
    isAdmin: user.isAdmin,
  };
  return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
};

// Verifying if the user is logged in
module.exports.verify = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(403).send({ auth: "Failed. No Token" });
  } else {
    token = token.replace("Bearer ", ""); // Strip 'Bearer ' from the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(403).send({
          auth: "Failed",
          message: err.message,
        });
      } else {
        req.user = decodedToken;
        next();
      }
    });
  }
};

// Verifying if the user is an Admin
module.exports.verifyAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).send({
      auth: "Failed",
      message: "Action Forbidden",
    });
  }
};

// Error handler
module.exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  const errorMessage = err.message || "Internal Server Error";
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    error: {
      message: errorMessage,
      errorCode: err.code || "SERVER_ERROR",
      details: err.details || null,
    },
  });
};
