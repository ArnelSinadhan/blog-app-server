const User = require("../models//User");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
const { errorHandler } = auth;

// Controllers

// Registering user
module.exports.registerUser = (req, res) => {
  const { userName, email, password } = req.body;
  const profilePic = req.file ? req.file.filename : undefined;

  if (!email.includes("@")) {
    return res.status(400).send({ error: "Email invalid" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .send({ error: "Password must be at least 8 characters" });
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(409).send({ error: "User already exists" });
      }

      const newUser = new User({
        userName,
        email,
        password: bcrypt.hashSync(password, 10),
        profilePic,
      });

      return newUser.save().then((savedUser) => {
        return res.status(201).send({
          message: "Registered Successfully",
          savedUser,
        });
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

// Logging in user
module.exports.loginUser = (req, res) => {
  if (!req.body.email.includes("@")) {
    return res.status(400).send({ error: "Invalid Email" });
  }

  const email = req.body.email;
  return User.findOne({ email })
    .then((result) => {
      if (result === null) {
        return res.status(404).send({ error: "No email found" });
      } else {
        const isPasswordCorrect = bcrypt.compareSync(
          req.body.password,
          result.password
        );

        if (isPasswordCorrect) {
          return res.status(200).send({
            access: auth.createAccessToken(result),
          });
        } else {
          return res.status(401).send({
            message: "Email and password do not match",
          });
        }
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

// Getting user profile
module.exports.getProfile = (req, res) => {
  return User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      } else {
        return res.status(200).send(user);
      }
    })
    .catch((error) => errorHandler(error, req, res));
};
