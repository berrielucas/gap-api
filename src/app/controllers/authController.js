const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const router = express.Router();

function generateToken(obj={}) {
  return jwt.sign(obj, process.env._SECRET_TOKEN, {
    expiresIn: 86400,
  });
}

router.post("/registerUser", async (req, res) => {
  const { email } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ success: false, error: "User already exists" });
    }
    const user = await User.create(req.body);
    user.password = undefined;
    return res.send({ success: true, data: {user, token: generateToken({ id: user.id, email: user.email })} });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ success: false, error: "Registration failed" });
  }
});

router.post("/authenticateUser", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password").select("+fullUser");
  if (!user) {
    return res.status(400).send({ success: false, error: "User not found" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ success: false, error: "Invalid password" });
  }
  user.password = undefined;
  return res.send({ success: true, data: { user, token: generateToken({ id: user.id, email: user.email }) } });
});

module.exports = (app) => app.use("/Auth", router);